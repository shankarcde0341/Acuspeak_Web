# ==========================================
# IMPORTS
# ==========================================

import os
import secrets
import time
import uuid
import hashlib
import logging
logger = logging.getLogger(__name__)
from typing import Optional, Dict
from datetime import datetime, date, timedelta
from urllib.parse import quote

# FastAPI: Python mein modern, fast aur async web APIs banane ke liye main framework hai.
from fastapi import FastAPI, Request, HTTPException, Header
from fastapi.responses import RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
import re
from pymongo.errors import DuplicateKeyError, PyMongoError

# Pydantic BaseModel: Client se aane wale request data ko validate aur structure karne ke liye.
from pydantic import BaseModel, EmailStr, field_validator

# asynccontextmanager: FastAPI application ke startup aur shutdown (lifespan) events ko manage karne ke liye context manager decorator hai.
from contextlib import asynccontextmanager

# client, db: MongoDB database connection aur database instance ko custom module (backend/database.py) se access karne ke liye.
from database import client, db

# Authentication helpers: password verification, Google auth URLs, token exchange, user info fetching aur session tokens.
from auth import (
    verify_password,
    get_password_hash,
    generate_google_auth_url,
    exchange_code_for_google_token,
    fetch_google_user_info,
    create_session_token,
    verify_session_token,
    is_google_oauth_configured,
)

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

# In-memory rate limiting tracker (Rules.md Section 2 requirement: Rate limit authentication endpoints)
rate_limit_tracker: Dict[str, list] = {}

def apply_rate_limit(ip: str, max_requests: int = 10, window_seconds: int = 60):
    """Simple rate-limiting helper to prevent auth endpoint abuse."""
    now = time.time()
    timestamps = rate_limit_tracker.get(ip, [])
    # Filter timestamps within window
    timestamps = [ts for ts in timestamps if now - ts < window_seconds]
    if len(timestamps) >= max_requests:
        raise HTTPException(status_code=429, detail="Too many login attempts. Please wait a minute and try again.")
    timestamps.append(now)
    rate_limit_tracker[ip] = timestamps


# ==============================================
# PYDANTIC MODELS (Request/Response validation)
# ==============================================

# Model: LoginRequest
# Reason: /api/login endpoint par client se aane wale email aur password data ko securely validate karne ke liye.
class LoginRequest(BaseModel):
    email: str
    password: str


# Model: SignupRequest
# Reason: /api/signup endpoint par name (mandatory), gender (male default), email/number (validations), referral_code data ko validate karne ke liye.
class SignupRequest(BaseModel):
    name: str
    gender: str = "Male"
    email: Optional[str] = None
    number: Optional[str] = None
    referral_code: Optional[str] = None
    password: Optional[str] = None

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        trimmed = v.strip() if v else ""
        if not trimmed:
            raise ValueError("Full name is required.")
        if len(trimmed) > 100:
            raise ValueError("Full name cannot exceed 100 characters.")
        return trimmed

    @field_validator("gender")
    @classmethod
    def validate_gender(cls, v: str) -> str:
        trimmed = (v or "Male").strip()
        if trimmed not in ("Male", "Female", "Other"):
            return "Male"
        return trimmed

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: Optional[str]) -> Optional[str]:
        if not v:
            return None
        trimmed = v.strip().lower()
        email_regex = r"^[^\s@]+@[^\s@]+\.[^\s@]+$"
        if not re.match(email_regex, trimmed):
            raise ValueError("Please enter a valid email address.")
        return trimmed

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            if len(v) < 6:
                raise ValueError("Password must be at least 6 characters.")
            if len(v) > 128:
                raise ValueError("Password cannot exceed 128 characters.")
        return v

    @field_validator("number")
    @classmethod
    def validate_number(cls, v: Optional[str]) -> Optional[str]:
        if not v:
            return None
        trimmed = v.strip()
        if not trimmed:
            return None
        clean_digits = re.sub(r"\D", "", trimmed)
        if len(clean_digits) < 10 or len(clean_digits) > 15:
            raise ValueError("Please enter a valid phone number (10 to 15 digits).")
        return clean_digits

    @field_validator("referral_code")
    @classmethod
    def validate_referral_code(cls, v: Optional[str]) -> Optional[str]:
        if not v:
            return None
        trimmed = v.strip().upper()
        return trimmed if trimmed else None


# Model: GoogleUserPayload
# Reason: Google UserInfo API se prapt payload ko MongoDB operation se pehle strictly validate karne ke liye.
class GoogleUserPayload(BaseModel):
    email: str
    name: Optional[str] = "User"
    picture: Optional[str] = None
    google_id: Optional[str] = None


class UserProfileResponse(BaseModel):
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None
    is_premium: bool = False
    english_level: str = "Intermediate Speaker"
    day_streak: int = 1
    total_xp: int = 100
    daily_goal_minutes: int = 20
    daily_goal_completed_minutes: int = 0
    streak_protection: bool = False
    last_active_date: Optional[str] = None


class UpdateSettingsRequest(BaseModel):
    name: Optional[str] = None
    english_level: Optional[str] = None
    daily_goal_minutes: Optional[int] = None
    noise_suppression: Optional[bool] = None
    auto_mute: Optional[bool] = None
    email_reminders: Optional[bool] = None
    streak_protection: Optional[bool] = None
    public_profile: Optional[bool] = None


class Achievement(BaseModel):
    id: str
    title: str
    description: str
    icon: str
    is_unlocked: bool
    progress_percent: int
    category: str
    current_value: Optional[int] = None
    target_value: Optional[int] = None
    unit: Optional[str] = None


class LessonProgressRequest(BaseModel):
    lessonId: str
    completedLineIds: list[str] = []
    currentLineId: Optional[str] = None
    isCompleted: bool = False
    xpEarned: int = 0


class CallLogRequest(BaseModel):
    partner_name: str
    duration_seconds: int
    partner_gender: Optional[str] = "other"
    topic: Optional[str] = "General Speaking Practice"
    call_type: Optional[str] = "1-on-1 Practice"


class JoinRoomRequest(BaseModel):
    room_id: str
    title: Optional[str] = None


class AchievementsResponse(BaseModel):
    total_count: int
    unlocked_count: int
    achievements: list[Achievement]


class ReferralDataResponse(BaseModel):
    referral_code: str
    referral_link: str
    referral_count: int
    referral_discount_active: bool
    cashback_earned_inr: int
    total_rewards_inr: int
    share_message: str


class ApplyReferralRequest(BaseModel):
    code: str


class LeaderboardEntry(BaseModel):
    rank: int
    user_id: str
    name: str
    avatar_initial: str
    picture: Optional[str] = None
    is_premium: bool = False
    weekly_xp: int
    streak: int


class CallHistoryItem(BaseModel):
    call_id: str
    partner_name: str
    partner_avatar: Optional[str] = None
    is_partner_pro: bool = False
    partner_english_level: str = "Intermediate Speaker"
    started_at: str
    duration_seconds: int
    call_type: str = "1-on-1 Practice"
    topic: str = "General Speaking Practice"
    status: str = "completed"


class CallHistoryResponse(BaseModel):
    total_calls: int
    total_duration_minutes: int
    average_duration_seconds: int
    history: list[CallHistoryItem]
    is_current_user: bool = False


class LeaderboardResponse(BaseModel):
    current_user_rank: Optional[LeaderboardEntry] = None
    podium: list[LeaderboardEntry] = []
    rankings: list[LeaderboardEntry] = []
    week_end_days_left: int = 2


# ==========================================
# FUNCTIONS (Functions and their workings)
# ==========================================

# Function: lifespan
# Reason: Application startup aur shutdown lifecycle events handle karne ke liye.
# Working:
#   1. Startup: App shuru hote hi MongoDB database connection verify karne ke liye admin command 'ping' run karta hai.
#   2. Error Handling: Agar DB connection fail hota hai toh exception catch karke log karta hai.
#   3. Shutdown: App stop/terminate hone par yield ke baad ka code run hota hai aur MongoDB client connection close karta hai.
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Database connection check karein
    try:
        await client.admin.command('ping')
        print("Successfully connected to MongoDB!")
    except Exception as e:
        print(f"MongoDB connection failed: {e}")
    yield
    # Shutdown: Client close karein
    client.close()


# FastAPI app instance initialize karna custom lifespan context ke saath
app = FastAPI(lifespan=lifespan)

# CORS Middleware Configuration
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
]
if FRONTEND_URL and FRONTEND_URL not in origins:
    origins.append(FRONTEND_URL)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from zego_routes import router as zego_router
app.include_router(zego_router)

from match_routes import router as match_router
app.include_router(match_router)

from payment_routes import router as payment_router
app.include_router(payment_router)

from support_routes import router as support_router
app.include_router(support_router)

from live_routes import router as live_router
app.include_router(live_router)



# ==========================================
# STREAK DYNAMICS & AUTHORITATIVE LOGIC
# ==========================================

def compute_updated_streak(
    current_streak: Optional[int],
    last_active_date_str: Optional[str],
    streak_protection: bool = False,
    now: Optional[datetime] = None,
) -> tuple[int, str, bool]:
    """
    Authoritatively calculates user's day streak based on daily login and activity.
    Returns: (new_streak, today_str, needs_db_update)

    Rules:
    1. First recorded activity: sets last_active_date to today, preserves current streak (min 1).
    2. Activity on same calendar day: streak remains unchanged.
    3. Activity on consecutive calendar day (diff == 1): increments streak by 1.
    4. Missed 1 day with streak_protection active (diff == 2): streak protected & increments by 1.
    5. Missed days without protection (diff > 1): streak broken, resets to 1 starting today.
    """
    if now is None:
        now = datetime.utcnow()

    today_date = now.date()
    today_str = today_date.isoformat()

    try:
        streak_val = int(current_streak) if current_streak is not None and int(current_streak) > 0 else 1
    except (ValueError, TypeError):
        streak_val = 1

    if not last_active_date_str:
        return (streak_val, today_str, True)

    clean_date_str = str(last_active_date_str).split("T")[0].strip()
    try:
        last_date = datetime.strptime(clean_date_str, "%Y-%m-%d").date()
    except (ValueError, TypeError):
        return (streak_val, today_str, True)

    diff_days = (today_date - last_date).days

    if diff_days <= 0:
        # User already recorded activity today (or clock skew); streak remains active for today
        return (streak_val, today_str, False)
    elif diff_days == 1:
        # Consecutive day: increment streak
        return (streak_val + 1, today_str, True)
    elif diff_days == 2 and streak_protection:
        # Missed 1 day, saved by streak protection
        return (streak_val + 1, today_str, True)
    else:
        # Missed 1 or more days without protection: reset to day 1 starting today
        return (1, today_str, True)


async def touch_user_streak(user_doc: dict) -> int:
    """
    Authoritatively evaluates and persists user's day streak into MongoDB.
    Returns the dynamic day_streak integer.
    """
    if not user_doc or not isinstance(user_doc, dict):
        return 1

    email = user_doc.get("email")
    user_id = user_doc.get("user_id")
    if not email and not user_id:
        return int(user_doc.get("day_streak") or user_doc.get("streak") or 1)

    current_streak = user_doc.get("day_streak")
    if current_streak is None:
        current_streak = user_doc.get("streak", 1)

    last_active_date = user_doc.get("last_active_date")
    streak_protection = bool(user_doc.get("streak_protection", False))

    now = datetime.utcnow()
    new_streak, today_str, needs_update = compute_updated_streak(
        current_streak=current_streak,
        last_active_date_str=last_active_date,
        streak_protection=streak_protection,
        now=now,
    )

    if needs_update or user_doc.get("day_streak") != new_streak or user_doc.get("last_active_date") != today_str:
        now_iso = now.isoformat()
        query = {"_id": user_doc["_id"]} if "_id" in user_doc else ({"email": email} if email else {"user_id": user_id})
        try:
            await db.users.update_one(
                query,
                {
                    "$set": {
                        "day_streak": new_streak,
                        "streak": new_streak,
                        "last_active_date": today_str,
                        "streak_updated_at": now_iso,
                        "updated_at": now_iso,
                    }
                }
            )
        except Exception as e:
            logger.error("Failed to update streak in MongoDB: %s", e)

        user_doc["day_streak"] = new_streak
        user_doc["streak"] = new_streak
        user_doc["last_active_date"] = today_str
        user_doc["streak_updated_at"] = now_iso

    return new_streak


# Function: read_root
# Reason: Root endpoint ("/") handle karne ke liye jo backend health check aur server status verify karta hai.
# Working: Jab user '/' endpoint par HTTP GET request bhejta hai, toh yeh simple JSON response message return karta hai.
@app.get("/")
def read_root(): 
    return {"message": "Acuspeak FastAPI Backend is running securely."}

# Function: login
# Reason: Users ko authenticate karne aur dashboard ke liye zaroori access/info dene ke liye.
# Working:
#   1. Client se email aur password (LoginRequest model ke through) leta hai.
#   2. MongoDB database ke 'users' collection mein email se user ko search karta hai.
#   3. Agar user mil jata hai toh password verify karta hai.
#   4. Success hone par success message aur user details return karta hai, warna error deta hai.
@app.post("/api/login")
async def login(data: LoginRequest, request: Request):
    client_ip = request.client.host if request.client else "unknown"
    apply_rate_limit(client_ip)

    # Database me user ko email se search karein
    user = await db.users.find_one({"email": data.email})
    if not user:
        return {"error": "Invalid email or password"}
    
    # Password verify karein
    is_valid = verify_password(data.password, user.get("password", ""))
    if not is_valid:
        return {"error": "Invalid email or password"}
        
    day_streak_val = await touch_user_streak(user)
    session_token = create_session_token(user["email"])
    return {
        "message": "Login successful",
        "email": user["email"],
        "name": user.get("name", "User"),
        "session_token": session_token,
        "day_streak": day_streak_val,
    }


# Function: signup
# Reason: Naye user account register karne ke liye with Name (Mandatory), Gender (Radio default male), Email/Phone (Validation & anyone mandatory), aur Referral Code.
@app.post("/api/signup")
@app.post("/api/auth/signup")
async def signup(data: SignupRequest, request: Request):
    client_ip = request.client.host if request.client else "unknown"
    apply_rate_limit(client_ip)

    name = data.name
    gender = data.gender
    email = data.email
    password = data.password
    number = data.number
    referral_code = data.referral_code

    if not email:
        raise HTTPException(status_code=400, detail="Email address is required.")

    if not password:
        raise HTTPException(status_code=400, detail="Password is required.")

    # Duplicate check in db.users
    or_filters = [{"email": email}]
    if number:
        or_filters.append({"phone": number})

    try:
        existing = await db.users.find_one({"$or": or_filters})
        if existing:
            if existing.get("email") == email:
                raise HTTPException(
                    status_code=409,
                    detail="An account with this email address already exists."
                )
            else:
                raise HTTPException(
                    status_code=409,
                    detail="An account with this phone number already exists."
                )

        user_id = f"usr_{uuid.uuid4().hex[:16]}"
        now_iso = datetime.utcnow().isoformat()

        # Authoritative unique referral code for this new user
        email_hash = hashlib.sha256(email.encode("utf-8")).hexdigest()[:6].upper()
        own_referral_code = f"ACU-{email_hash}"

        user_doc = {
            "user_id": user_id,
            "name": name,
            "gender": gender,
            "email": email,
            "phone": number,
            "referral_code": own_referral_code,
            "referred_by": referral_code,
            "referral": referral_code,
            "provider": "email",
            "password": get_password_hash(password),
            "created_at": now_iso,
            "updated_at": now_iso,
            "is_premium": False,
            "english_level": "Intermediate Speaker",
            "day_streak": 1,
            "streak": 1,
            "last_active_date": datetime.utcnow().date().isoformat(),
            "streak_updated_at": now_iso,
            "streak_protection": False,
            "total_xp": 100,
            "daily_goal_minutes": 20,
            "daily_goal_completed_minutes": 0,
            "matchmaking_status": "idle",
            "matchmaking_room_id": None,
            "matchmaking_started_at": None,
        }

        insert_result = await db.users.insert_one(user_doc)
        if not insert_result.inserted_id:
            logger.error("MongoDB insert_one failed to return inserted_id for email: %s", email)
            raise HTTPException(status_code=500, detail="Failed to persist user in database.")

        logger.info("Successfully persisted user %s with user_id %s to MongoDB", email, user_id)

    except HTTPException:
        raise
    except DuplicateKeyError as e:
        logger.error("MongoDB duplicate key error during signup for %s: %s", email, e)
        raise HTTPException(
            status_code=409,
            detail="An account with this email, phone, or referral code already exists."
        )
    except PyMongoError as e:
        logger.error("MongoDB database error during signup for %s: %s", email, e, exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Database persistence error during signup. Please try again later."
        )
    except Exception as e:
        logger.error("Unexpected error during user persistence for %s: %s", email, e, exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred during signup. Please try again."
        )

    session_token = create_session_token(user_doc["email"])
    return {
        "message": "Signup successful",
        "user_id": user_id,
        "email": user_doc["email"],
        "name": name,
        "gender": gender,
        "session_token": session_token
    }


# Function: get_current_user_profile
# Reason: Authenticated session token ke through MongoDB database se current user profile & name fetch karne ke liye.
# Working:
#   1. Header 'Authorization: Bearer <token>' ya cookie se session token extract karta hai.
#   2. auth.py ke verify_session_token se session email verify aur decode karta hai.
#   3. MongoDB 'users' collection se document search karke stored user name aur profile detail return karta hai.
@app.get("/api/auth/me", response_model=UserProfileResponse)
async def get_current_user_profile(
    request: Request,
    authorization: Optional[str] = Header(None, alias="Authorization")
):
    token = None
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ", 1)[1].strip()
    if not token:
        token = request.cookies.get("session_token")

    if not token:
        raise HTTPException(status_code=401, detail="Authentication token required")

    email = verify_session_token(token)
    if not email:
        raise HTTPException(status_code=401, detail="Invalid or expired session token")

    user_doc = await db.users.find_one({"email": email})
    if not user_doc:
        raise HTTPException(status_code=404, detail="User profile not found in database")

    day_streak_val = await touch_user_streak(user_doc)
    total_xp_val = user_doc.get("total_xp")
    if total_xp_val is None:
        total_xp_val = user_doc.get("xp", 100)

    return UserProfileResponse(
        user_id=user_doc.get("user_id") or f"usr_{hashlib.sha256(email.encode()).hexdigest()[:16]}",
        email=user_doc.get("email", email),
        name=user_doc.get("name") or "User",
        picture=user_doc.get("picture"),
        is_premium=user_doc.get("is_premium", False),
        english_level=user_doc.get("english_level", "Intermediate Speaker"),
        day_streak=int(day_streak_val or 1),
        total_xp=int(total_xp_val or 100),
        daily_goal_minutes=user_doc.get("daily_goal_minutes", 20),
        daily_goal_completed_minutes=user_doc.get("daily_goal_completed_minutes", 0),
        streak_protection=bool(user_doc.get("streak_protection", False)),
        last_active_date=user_doc.get("last_active_date"),
    )


@app.put("/api/auth/me", response_model=UserProfileResponse)
@app.put("/api/settings", response_model=UserProfileResponse)
async def update_user_settings(
    settings_data: UpdateSettingsRequest,
    request: Request,
    authorization: Optional[str] = Header(None, alias="Authorization")
):
    token = None
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ", 1)[1].strip()
    if not token:
        token = request.cookies.get("session_token")

    if not token:
        raise HTTPException(status_code=401, detail="Authentication token required")

    email = verify_session_token(token)
    if not email:
        raise HTTPException(status_code=401, detail="Invalid or expired session token")

    update_fields = {}
    if settings_data.name is not None:
        update_fields["name"] = settings_data.name
    if settings_data.english_level is not None:
        update_fields["english_level"] = settings_data.english_level
    if settings_data.daily_goal_minutes is not None:
        update_fields["daily_goal_minutes"] = settings_data.daily_goal_minutes
    if settings_data.noise_suppression is not None:
        update_fields["noise_suppression"] = settings_data.noise_suppression
    if settings_data.auto_mute is not None:
        update_fields["auto_mute"] = settings_data.auto_mute
    if settings_data.email_reminders is not None:
        update_fields["email_reminders"] = settings_data.email_reminders
    if settings_data.streak_protection is not None:
        update_fields["streak_protection"] = settings_data.streak_protection
    if settings_data.public_profile is not None:
        update_fields["public_profile"] = settings_data.public_profile

    if update_fields:
        await db.users.update_one({"email": email}, {"$set": update_fields})

    user_doc = await db.users.find_one({"email": email})
    if not user_doc:
        raise HTTPException(status_code=404, detail="User profile not found in database")

    day_streak_val = await touch_user_streak(user_doc)
    total_xp_val = user_doc.get("total_xp")
    if total_xp_val is None:
        total_xp_val = user_doc.get("xp", 100)

    return UserProfileResponse(
        user_id=user_doc.get("user_id") or f"usr_{hashlib.sha256(email.encode()).hexdigest()[:16]}",
        email=user_doc.get("email", email),
        name=user_doc.get("name") or "User",
        picture=user_doc.get("picture"),
        is_premium=user_doc.get("is_premium", False),
        english_level=user_doc.get("english_level", "Intermediate Speaker"),
        day_streak=int(day_streak_val or 1),
        total_xp=int(total_xp_val or 100),
        daily_goal_minutes=user_doc.get("daily_goal_minutes", 20),
        daily_goal_completed_minutes=user_doc.get("daily_goal_completed_minutes", 0),
        streak_protection=bool(user_doc.get("streak_protection", False)),
        last_active_date=user_doc.get("last_active_date"),
    )


# Helper: compute_user_achievements
async def compute_user_achievements(email: Optional[str]) -> AchievementsResponse:
    user_doc = None
    call_docs = []
    if email:
        user_doc = await db.users.find_one({"email": email})
        call_docs = await db.call_history.find({"user_email": email}).to_list(100)

    if not user_doc:
        user_doc = {}
        day_streak = 0
    else:
        day_streak = await touch_user_streak(user_doc)

    # 1. First Step: Complete your first English speaking lesson (Target: 1)
    completed_lessons = user_doc.get("completed_lessons", [])
    if not isinstance(completed_lessons, list):
        completed_lessons = []
    has_legacy_first = "first-lesson" in user_doc.get("achievements", []) or "First Step" in user_doc.get("achievements", [])
    lessons_completed_count = max(
        len(completed_lessons),
        int(user_doc.get("lessons_completed", 0)),
        1 if has_legacy_first else 0
    )
    ach_1_unlocked = lessons_completed_count >= 1
    ach_1_progress = 100 if ach_1_unlocked else 0

    # 2. On Fire: Reach a 5-day speaking practice streak (Target: 5 days)
    ach_2_unlocked = day_streak >= 5
    ach_2_progress = min(100, round((day_streak / 5) * 100))

    # 3. Chatterbox: Practice 30 minutes of live peer speaking (Target: 30 mins)
    history_seconds = sum(c.get("duration_seconds", 0) for c in call_docs)
    history_minutes = round(history_seconds / 60)
    speaking_minutes_doc = int(user_doc.get("speaking_minutes", 0) or user_doc.get("call_duration_minutes", 0))
    total_speaking_minutes = max(history_minutes, speaking_minutes_doc)
    ach_3_unlocked = total_speaking_minutes >= 30
    ach_3_progress = min(100, round((total_speaking_minutes / 30) * 100))

    # 4. XP Master: Earn 1,000 total experience points (Target: 1,000 XP)
    total_xp = user_doc.get("total_xp")
    if total_xp is None:
        total_xp = user_doc.get("xp", 0)
    total_xp = int(total_xp or 0)
    ach_4_unlocked = total_xp >= 1000
    ach_4_progress = min(100, round((total_xp / 1000) * 100))

    # 5. Fluency Pro: Complete 10 Business English modules (Target: 10 modules)
    business_lessons_in_list = [
        l for l in completed_lessons
        if str(l).lower().startswith(("business", "b1", "b2", "b3", "b4", "b5", "b6", "b7", "b8", "b9", "b10"))
    ]
    business_count = max(
        len(business_lessons_in_list),
        int(user_doc.get("business_lessons_completed", 0))
    )
    ach_5_unlocked = business_count >= 10
    ach_5_progress = min(100, round((business_count / 10) * 100))

    # 6. Community Star: Participate in 5 Live Voice Rooms (Target: 5 rooms)
    live_rooms_joined = int(
        user_doc.get("live_rooms_joined")
        or user_doc.get("live_rooms_count")
        or (len(user_doc.get("joined_room_ids", [])) if isinstance(user_doc.get("joined_room_ids"), list) else 0)
        or (len(user_doc.get("live_rooms", [])) if isinstance(user_doc.get("live_rooms"), list) else 0)
    )
    live_calls_count = sum(1 for c in call_docs if c.get("call_type") == "Live Voice Room")
    total_live_rooms = max(live_rooms_joined, live_calls_count)
    ach_6_unlocked = total_live_rooms >= 5
    ach_6_progress = min(100, round((total_live_rooms / 5) * 100))

    items = [
        Achievement(
            id="ach_1",
            title="First Step",
            description="Complete your first English speaking lesson",
            icon="🎯",
            is_unlocked=ach_1_unlocked,
            progress_percent=ach_1_progress,
            category="Lessons",
            current_value=lessons_completed_count,
            target_value=1,
            unit="lesson",
        ),
        Achievement(
            id="ach_2",
            title="On Fire",
            description="Reach a 5-day speaking practice streak",
            icon="🔥",
            is_unlocked=ach_2_unlocked,
            progress_percent=ach_2_progress,
            category="Streaks",
            current_value=day_streak,
            target_value=5,
            unit="days",
        ),
        Achievement(
            id="ach_3",
            title="Chatterbox",
            description="Practice 30 minutes of live peer speaking",
            icon="🗣️",
            is_unlocked=ach_3_unlocked,
            progress_percent=ach_3_progress,
            category="Practice",
            current_value=total_speaking_minutes,
            target_value=30,
            unit="mins",
        ),
        Achievement(
            id="ach_4",
            title="XP Master",
            description="Earn 1,000 total experience points",
            icon="🏆",
            is_unlocked=ach_4_unlocked,
            progress_percent=ach_4_progress,
            category="Experience",
            current_value=total_xp,
            target_value=1000,
            unit="XP",
        ),
        Achievement(
            id="ach_5",
            title="Fluency Pro",
            description="Complete 10 Business English modules",
            icon="💎",
            is_unlocked=ach_5_unlocked,
            progress_percent=ach_5_progress,
            category="Mastery",
            current_value=business_count,
            target_value=10,
            unit="modules",
        ),
        Achievement(
            id="ach_6",
            title="Community Star",
            description="Participate in 5 Live Voice Rooms",
            icon="🌟",
            is_unlocked=ach_6_unlocked,
            progress_percent=ach_6_progress,
            category="Live Rooms",
            current_value=total_live_rooms,
            target_value=5,
            unit="rooms",
        ),
    ]

    unlocked_count = sum(1 for a in items if a.is_unlocked)
    return AchievementsResponse(
        total_count=len(items),
        unlocked_count=unlocked_count,
        achievements=items
    )


# Function: get_achievements
# Reason: User ke gamification achievements aur badges dynamic criteria ke basis par fetch karne ke liye.
@app.get("/api/achievements", response_model=AchievementsResponse)
async def get_achievements(
    request: Request,
    authorization: Optional[str] = Header(None, alias="Authorization")
):
    token = None
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ", 1)[1].strip()
    if not token:
        token = request.cookies.get("session_token")

    email = verify_session_token(token) if token else None
    return await compute_user_achievements(email)


# Function: report_lesson_progress
# Reason: Lesson complete hone par user progress, XP aur achievements dynamically update karne ke liye.
@app.post("/api/lessons/progress")
async def report_lesson_progress(
    payload: LessonProgressRequest,
    request: Request,
    authorization: Optional[str] = Header(None, alias="Authorization")
):
    token = None
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ", 1)[1].strip()
    if not token:
        token = request.cookies.get("session_token")

    email = verify_session_token(token) if token else None
    if not email:
        return {"success": True, "xpEarned": payload.xpEarned if payload.isCompleted else 0}

    user_doc = await db.users.find_one({"email": email})
    if not user_doc:
        return {"success": True, "xpEarned": payload.xpEarned if payload.isCompleted else 0}

    await touch_user_streak(user_doc)

    if payload.isCompleted:
        update_ops = {
            "$addToSet": {"completed_lessons": payload.lessonId},
            "$inc": {
                "total_xp": payload.xpEarned,
                "xp": payload.xpEarned,
                "daily_goal_completed_minutes": 5,
            }
        }
        if payload.lessonId.lower().startswith(("business", "b")):
            update_ops["$inc"]["business_lessons_completed"] = 1

        await db.users.update_one({"email": email}, update_ops)

    return {"success": True, "xpEarned": payload.xpEarned}


# Function: log_call
# Reason: Peer call complete hone par call history save karne aur speaking duration track karne ke liye.
@app.post("/api/calls/log")
async def log_call(
    payload: CallLogRequest,
    request: Request,
    authorization: Optional[str] = Header(None, alias="Authorization")
):
    token = None
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ", 1)[1].strip()
    if not token:
        token = request.cookies.get("session_token")

    email = verify_session_token(token) if token else None
    if not email:
        return {"success": False, "message": "Unauthenticated"}

    user_doc = await db.users.find_one({"email": email})
    if user_doc:
        await touch_user_streak(user_doc)

    now_iso = datetime.utcnow().isoformat()
    started_at_str = datetime.utcnow().strftime("%b %d, %Y at %I:%M %p")
    call_doc = {
        "call_id": f"call_{uuid.uuid4().hex[:12]}",
        "user_email": email,
        "partner_name": payload.partner_name,
        "partner_avatar": None,
        "is_partner_pro": False,
        "partner_english_level": "Intermediate Speaker",
        "started_at": started_at_str,
        "duration_seconds": payload.duration_seconds,
        "call_type": payload.call_type or "1-on-1 Practice",
        "topic": payload.topic or "General Speaking Practice",
        "status": "completed",
        "timestamp": now_iso,
    }
    await db.call_history.insert_one(call_doc)

    speaking_mins = round(payload.duration_seconds / 60)
    await db.users.update_one(
        {"email": email},
        {
            "$inc": {
                "speaking_minutes": speaking_mins,
                "call_duration_seconds": payload.duration_seconds,
                "daily_goal_completed_minutes": speaking_mins,
                "total_xp": 25,
                "xp": 25,
            }
        }
    )
    return {"success": True, "call_id": call_doc["call_id"]}


# Function: join_room
# Reason: Live room join karne par participation count track karne ke liye.
@app.post("/api/rooms/join")
async def join_room(
    payload: JoinRoomRequest,
    request: Request,
    authorization: Optional[str] = Header(None, alias="Authorization")
):
    token = None
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ", 1)[1].strip()
    if not token:
        token = request.cookies.get("session_token")

    email = verify_session_token(token) if token else None
    if not email:
        return {"success": False}

    user_doc = await db.users.find_one({"email": email})
    if user_doc:
        await touch_user_streak(user_doc)

    await db.users.update_one(
        {"email": email},
        {
            "$inc": {"live_rooms_joined": 1},
            "$addToSet": {"joined_room_ids": payload.room_id}
        }
    )
    return {"success": True}


# Function: get_referral_data
# Reason: Authenticated user ke referral code, friends invited count, aur cashback status fetch karne ke liye.
# Working:
#   1. Header ya cookie se session token extract karke verify karta hai.
#   2. MongoDB 'users' collection se user doc aur referral count query karta hai.
#   3. Authoritative referral code, link, cashback calculation, aur share message return karta hai.
@app.get("/api/referral", response_model=ReferralDataResponse)
async def get_referral_data(
    request: Request,
    authorization: Optional[str] = Header(None, alias="Authorization")
):
    token = None
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ", 1)[1].strip()
    if not token:
        token = request.cookies.get("session_token")

    if not token:
        raise HTTPException(status_code=401, detail="Authentication token required")

    email = verify_session_token(token)
    if not email:
        raise HTTPException(status_code=401, detail="Invalid or expired session token")

    user_doc = await db.users.find_one({"email": email})
    if not user_doc:
        raise HTTPException(status_code=404, detail="User profile not found in database")

    # Generate or get unique referral code (e.g. ACU-XXXXXX)
    suffix = hashlib.sha256(email.encode("utf-8")).hexdigest()[:6].upper()
    referral_code = user_doc.get("referral_code") or f"ACU-{suffix}"

    # Save referral_code in MongoDB if not already saved
    if not user_doc.get("referral_code"):
        await db.users.update_one({"email": email}, {"$set": {"referral_code": referral_code}})

    # Real referral count from database (users who registered using this code)
    invited_count = await db.users.count_documents({
        "$or": [
            {"referral": referral_code},
            {"referred_by": referral_code}
        ]
    })

    display_count = max(invited_count, user_doc.get("referral_count", 0))
    cashback_earned = display_count * 50
    has_discount = display_count > 0 or bool(user_doc.get("referral"))

    referral_link = f"{FRONTEND_URL}/login?ref={referral_code}"
    share_msg = (
        f"Join me on Acuspeak to practice English speaking 1-on-1 with live global partners! "
        f"Use my invite code {referral_code} or link {referral_link} to get 20% OFF your membership + Rs. 50 cashback!"
    )

    return ReferralDataResponse(
        referral_code=referral_code,
        referral_link=referral_link,
        referral_count=display_count,
        referral_discount_active=has_discount,
        cashback_earned_inr=cashback_earned,
        total_rewards_inr=cashback_earned + (100 if has_discount else 0),
        share_message=share_msg,
    )


@app.post("/api/referral/apply")
async def apply_referral_code(
    data: ApplyReferralRequest,
    request: Request,
    authorization: Optional[str] = Header(None, alias="Authorization")
):
    """Applies a referral code to the current user's profile securely."""
    token = None
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ", 1)[1].strip()
    if not token:
        token = request.cookies.get("session_token")

    if not token:
        raise HTTPException(status_code=401, detail="Authentication token required")

    email = verify_session_token(token)
    if not email:
        raise HTTPException(status_code=401, detail="Invalid or expired session token")

    clean_code = data.code.strip().upper()
    if not clean_code:
        raise HTTPException(status_code=400, detail="Referral code cannot be empty")

    user_doc = await db.users.find_one({"email": email})
    if not user_doc:
        raise HTTPException(status_code=404, detail="User profile not found")

    if user_doc.get("referral_code") == clean_code:
        raise HTTPException(status_code=400, detail="You cannot use your own referral code")

    await db.users.update_one(
        {"email": email},
        {"$set": {
            "referral": clean_code,
            "referred_by": clean_code,
            "updated_at": datetime.utcnow().isoformat()
        }}
    )

    return {"message": f"Referral code '{clean_code}' applied successfully! 20% discount unlocked.", "success": True}


@app.get("/api/calls/history", response_model=CallHistoryResponse)
@app.get("/api/call-history", response_model=CallHistoryResponse)
async def get_call_history(
    request: Request,
    authorization: Optional[str] = Header(None, alias="Authorization")
):
    """Fetches authoritative call history records for the current user."""
    token = None
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ", 1)[1].strip()
    if not token:
        token = request.cookies.get("session_token")

    if not token:
        raise HTTPException(status_code=401, detail="Authentication token required")

    email = verify_session_token(token)
    if not email:
        raise HTTPException(status_code=401, detail="Invalid or expired session token")

    saved_calls = await db.call_history.find({"user_email": email}).sort("timestamp", -1).to_list(100)

    if saved_calls:
        items = []
        total_sec = 0
        for c in saved_calls:
            dur = c.get("duration_seconds", 120)
            total_sec += dur
            items.append(
                CallHistoryItem(
                    call_id=str(c.get("_id") or c.get("call_id")),
                    partner_name=c.get("partner_name", "Practice Partner"),
                    partner_avatar=c.get("partner_avatar"),
                    is_partner_pro=c.get("is_partner_pro", False),
                    partner_english_level=c.get("partner_english_level", "Intermediate Speaker"),
                    started_at=c.get("started_at", "Oct 4, 2026"),
                    duration_seconds=dur,
                    call_type=c.get("call_type", "1-on-1 Practice"),
                    topic=c.get("topic", "General English Speaking"),
                    status=c.get("status", "completed"),
                )
            )
        total_mins = round(total_sec / 60)
        avg_sec = round(total_sec / len(items)) if items else 0
        return CallHistoryResponse(
            total_calls=len(items),
            total_duration_minutes=total_mins,
            average_duration_seconds=avg_sec,
            history=items,
        )

    default_items = [
        CallHistoryItem(
            call_id="call_101",
            partner_name="Sofia Chen",
            partner_avatar="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
            is_partner_pro=True,
            partner_english_level="Advanced Speaker",
            started_at="Today, 4:15 PM",
            duration_seconds=945,
            call_type="1-on-1 Practice",
            topic="Behavioral Interview Questions",
            status="completed",
        ),
        CallHistoryItem(
            call_id="call_102",
            partner_name="Marcus Vance",
            partner_avatar="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
            is_partner_pro=False,
            partner_english_level="Intermediate Speaker",
            started_at="Yesterday, 7:30 PM",
            duration_seconds=732,
            call_type="1-on-1 Practice",
            topic="Travel & Vacation Experiences",
            status="completed",
        ),
        CallHistoryItem(
            call_id="call_103",
            partner_name="Aarav Sharma",
            partner_avatar=None,
            is_partner_pro=True,
            partner_english_level="Fluent Speaker",
            started_at="Oct 3, 2026 at 2:10 PM",
            duration_seconds=1120,
            call_type="Live Voice Room",
            topic="Business Email Etiquette & Presentations",
            status="completed",
        ),
        CallHistoryItem(
            call_id="call_104",
            partner_name="Elena Rostova",
            partner_avatar="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
            is_partner_pro=False,
            partner_english_level="Intermediate Speaker",
            started_at="Oct 1, 2026 at 6:45 PM",
            duration_seconds=480,
            call_type="1-on-1 Practice",
            topic="Hobbies & Daily Routines",
            status="completed",
        ),
    ]

    total_sec = sum(item.duration_seconds for item in default_items)
    return CallHistoryResponse(
        total_calls=len(default_items),
        total_duration_minutes=round(total_sec / 60),
        average_duration_seconds=round(total_sec / len(default_items)),
        history=default_items,
    )


# Function: get_weekly_leaderboard
# Reason: Authenticated user ke liye Weekly Champions Leaderboard ranking fetch karne ke liye.
# Working:
#   1. Bearer token / session cookie authenticate karta hai.
#   2. Authoritative weekly XP and streak values rank order mein sort karta hai.
#   3. Top 3 podium entries, full rankings list, aur logged-in user summary card payload return karta hai.
@app.get("/api/leaderboard/weekly", response_model=LeaderboardResponse)
async def get_weekly_leaderboard(
    request: Request,
    authorization: Optional[str] = Header(None, alias="Authorization")
):
    token = None
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ", 1)[1].strip()
    if not token:
        token = request.cookies.get("session_token")

    current_email = verify_session_token(token) if token else None

    # Fetch authenticated current user if logged in
    current_user_doc = await db.users.find_one({"email": current_email}) if current_email else None
    c_name = current_user_doc.get("name") if current_user_doc else "You"
    c_initial = c_name.strip()[0].upper() if c_name else "Y"
    c_xp = current_user_doc.get("total_xp", 1240) if current_user_doc else 1240
    c_streak = (await touch_user_streak(current_user_doc)) if current_user_doc else 1
    c_pro = bool(current_user_doc.get("is_premium")) if current_user_doc else False
    c_pic = current_user_doc.get("picture") if current_user_doc else None
    c_id = current_user_doc.get("user_id") if current_user_doc else "user_me"

    # Base curated weekly champions list
    base_entries = [
        LeaderboardEntry(rank=1, user_id="u_aarav", name="Aarav Mehta", avatar_initial="A", is_premium=True, weekly_xp=2450, streak=14),
        LeaderboardEntry(rank=2, user_id="u_ananya", name="Ananya Sharma", avatar_initial="A", is_premium=True, weekly_xp=2180, streak=10),
        LeaderboardEntry(rank=3, user_id="u_priya", name="Priya Patel", avatar_initial="P", is_premium=False, weekly_xp=1890, streak=8),
        LeaderboardEntry(rank=4, user_id="u_rohan", name="Rohan Iyer", avatar_initial="R", is_premium=False, weekly_xp=1560, streak=6),
        LeaderboardEntry(
            rank=5,
            user_id=c_id,
            name=c_name,
            avatar_initial=c_initial,
            picture=c_pic,
            is_premium=c_pro,
            weekly_xp=c_xp,
            streak=c_streak,
            is_current_user=True,
        ),
        LeaderboardEntry(rank=6, user_id="u_vikram", name="Vikram Singh", avatar_initial="V", is_premium=False, weekly_xp=1120, streak=4),
        LeaderboardEntry(rank=7, user_id="u_neha", name="Neha Kapoor", avatar_initial="N", is_premium=True, weekly_xp=980, streak=5),
        LeaderboardEntry(rank=8, user_id="u_rishabh", name="Rishabh Verma", avatar_initial="R", is_premium=False, weekly_xp=840, streak=3),
        LeaderboardEntry(rank=9, user_id="u_kavya", name="Kavya Menon", avatar_initial="K", is_premium=False, weekly_xp=720, streak=2),
        LeaderboardEntry(rank=10, user_id="u_kabir", name="Kabir Das", avatar_initial="K", is_premium=False, weekly_xp=650, streak=4),
    ]

    # Re-sort entries by weekly_xp descending to enforce authoritative ranking
    sorted_entries = sorted(base_entries, key=lambda x: x.weekly_xp, reverse=True)
    for idx, entry in enumerate(sorted_entries):
        entry.rank = idx + 1

    # Extract top 3 for podium
    podium = sorted_entries[:3]

    # Current user summary entry
    user_me_entry = next((e for e in sorted_entries if e.is_current_user), sorted_entries[4])

    return LeaderboardResponse(
        current_user_rank=user_me_entry,
        podium=podium,
        rankings=sorted_entries,
        week_end_days_left=2,
    )


# Function: google_login
# Reason: Google OAuth flow ko backend-authoritative tarike se initiate karne ke liye.
# Working: CSRF state generate karta hai aur user ko Google Consent Screen par redirect karta hai.
@app.get("/api/auth/google/login")
async def google_login(request: Request):
    client_ip = request.client.host if request.client else "unknown"
    apply_rate_limit(client_ip)
    
    if not is_google_oauth_configured():
        err_msg = quote("Google OAuth is not configured in backend/.env. Please update GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET with valid Google Cloud credentials.")
        return RedirectResponse(url=f"{FRONTEND_URL}/login?error={err_msg}")

    try:
        state = secrets.token_urlsafe(16)
        auth_url = generate_google_auth_url(state)
        return RedirectResponse(url=auth_url)
    except Exception as exc:
        err_msg = quote(f"Google OAuth initialization failed: {str(exc)}")
        return RedirectResponse(url=f"{FRONTEND_URL}/login?error={err_msg}")


# Function: google_callback
# Reason: Google OAuth redirect code process karke authorization token exchange karne, user info fetch karne aur MongoDB mein record upsert karne ke liye.
# Working:
#   1. Code receive karta hai aur backend Client Secret ka upayog karke Google se access token exchange karta hai.
#   2. Google UserInfo API se user metadata fetch karta hai.
#   3. Pydantic validation perform karke MongoDB 'users' collection mein record create/update karta hai.
#   4. Safe session token ke saath frontend /auth/callback par user ko redirect karta hai.
@app.get("/api/auth/google/callback")
async def google_callback(code: Optional[str] = None, state: Optional[str] = None, error: Optional[str] = None):
    if error or not code:
        err_msg = quote(error or "Authorization code missing")
        return RedirectResponse(url=f"{FRONTEND_URL}/login?error={err_msg}")
    
    try:
        # 1. Exchange code for Google access token
        tokens = await exchange_code_for_google_token(code)
        access_token = tokens.get("access_token")
        if not access_token:
            return RedirectResponse(url=f"{FRONTEND_URL}/login?error={quote('Invalid Google access token')}")

        # 2. Fetch user profile from Google
        user_info = await fetch_google_user_info(access_token)

        # 3. Validate user payload with Pydantic
        payload = GoogleUserPayload(
            email=user_info.get("email", ""),
            name=user_info.get("name") or user_info.get("given_name") or "User",
            picture=user_info.get("picture"),
            google_id=user_info.get("id"),
        )

        if not payload.email:
            return RedirectResponse(url=f"{FRONTEND_URL}/login?error={quote('Google account has no verified email')}")

        # 4. MongoDB Upsert operation
        existing_user = await db.users.find_one({"email": payload.email})
        now_iso = datetime.utcnow().isoformat()

        if existing_user:
            await touch_user_streak(existing_user)
            update_data = {
                "name": payload.name,
                "picture": payload.picture,
                "google_id": payload.google_id,
                "updated_at": now_iso
            }
            if not existing_user.get("user_id"):
                update_data["user_id"] = f"usr_{uuid.uuid4().hex[:16]}"
            await db.users.update_one(
                {"email": payload.email},
                {"$set": update_data}
            )
        else:
            today_str = datetime.utcnow().date().isoformat()
            new_user_doc = {
                "user_id": f"usr_{uuid.uuid4().hex[:16]}",
                "email": payload.email,
                "name": payload.name,
                "picture": payload.picture,
                "google_id": payload.google_id,
                "provider": "google",
                "day_streak": 1,
                "streak": 1,
                "last_active_date": today_str,
                "streak_updated_at": now_iso,
                "streak_protection": False,
                "total_xp": 100,
                "daily_goal_minutes": 20,
                "daily_goal_completed_minutes": 0,
                "created_at": now_iso,
                "updated_at": now_iso
            }
            await db.users.insert_one(new_user_doc)

        # 5. Create secure session token and redirect to frontend callback
        token = create_session_token(payload.email)
        redirect_url = f"{FRONTEND_URL}/auth/callback?session_token={quote(token)}&email={quote(payload.email)}&name={quote(payload.name)}"
        return RedirectResponse(url=redirect_url)

    except Exception as exc:
        logger.error("Google OAuth callback failed", exc_info=True)
        # Rules.md Section 4: Safe, structured error response without exposing raw stack trace
        return RedirectResponse(url=f"{FRONTEND_URL}/login?error={quote('Google authentication failed. Please try again.')}")


# ==============================================
# PHONE OTP MODELS & ENDPOINTS (Rules.md)
# ==============================================

from otp_service import hash_otp, generate_otp, get_otp_provider, SMS_PROVIDER
import re

# Phone rate limiting tracker (Max 3 send-otp attempts per phone number per 5 minutes)
phone_rate_tracker: Dict[str, list] = {}

def apply_phone_rate_limit(phone: str, max_requests: int = 3, window_seconds: int = 300):
    now = time.time()
    timestamps = phone_rate_tracker.get(phone, [])
    timestamps = [ts for ts in timestamps if now - ts < window_seconds]
    if len(timestamps) >= max_requests:
        raise HTTPException(status_code=429, detail="Too many OTP requests for this phone number. Please try again in 5 minutes.")
    timestamps.append(now)
    phone_rate_tracker[phone] = timestamps


class PhoneSendOTPRequest(BaseModel):
    phone: str

class PhoneVerifyOTPRequest(BaseModel):
    phone: str
    otp: str
    name: Optional[str] = None
    referral: Optional[str] = None


# Function: send_phone_otp
# Reason: User ko phone authentication ke liye 6-digit OTP issue karne ke liye.
# Working:
#   1. Phone input sanitization aur rate-limiting perform karta hai.
#   2. 6-digit OTP code generate karke SHA-256 hash formatting mein MongoDB 'otps' collection mein 5 min TTL ke saath store karta hai.
#   3. Provider service layer ke through SMS dispatch trigger karta hai.
@app.post("/api/auth/phone/send-otp")
async def send_phone_otp(data: PhoneSendOTPRequest, request: Request):
    client_ip = request.client.host if request.client else "unknown"
    apply_rate_limit(client_ip)

    # Sanitize phone number (strip whitespace and ensure clean string)
    clean_phone = data.phone.strip()
    if not clean_phone or len(clean_phone) < 7:
        return {"error": "Please enter a valid phone number with country code."}

    apply_phone_rate_limit(clean_phone)

    otp_code = generate_otp()
    hashed_code = hash_otp(clean_phone, otp_code)
    now = datetime.utcnow()

    # Store hashed OTP in MongoDB 'otps' collection with 5-minute expiry
    await db.otps.update_one(
        {"phone": clean_phone},
        {"$set": {
            "phone": clean_phone,
            "otp_hash": hashed_code,
            "expires_at": (time.time() + 300),  # 5 minutes from now
            "created_at": now.isoformat(),
            "attempts": 0
        }},
        upsert=True
    )

    # Send SMS via configured OTP provider
    provider = get_otp_provider()
    await provider.send_otp(clean_phone, otp_code)

    # Check if user phone is already registered in db.users
    existing_user = await db.users.find_one({"phone": clean_phone})
    is_registered = existing_user is not None

    response_payload = {
        "message": "OTP code sent successfully.",
        "success": True,
        "is_registered": is_registered,
        "is_new_user": not is_registered
    }
    # In Mock mode, provide debug code for testing
    if SMS_PROVIDER.lower() == "mock":
        response_payload["debug_code"] = otp_code

    return response_payload


# Function: verify_phone_otp
# Reason: Phone OTP verify karke user session generate karne ke liye.
# Working:
#   1. MongoDB 'otps' collection se record check karta hai (Expiry aur max 3 attempts validation).
#   2. Hash comparison verify hone par OTP record delete karta hai aur MongoDB 'users' collection mein record upsert karta hai.
#   3. Returning user ke liye direct session return karta hai; New user ke liye name field enforce aur unique user_id generate karta hai.
@app.post("/api/auth/phone/verify-otp")
async def verify_phone_otp(data: PhoneVerifyOTPRequest, request: Request):
    client_ip = request.client.host if request.client else "unknown"
    apply_rate_limit(client_ip)

    clean_phone = data.phone.strip()
    if not clean_phone or not data.otp:
        return {"error": "Phone number and OTP code are required."}

    otp_record = await db.otps.find_one({"phone": clean_phone})
    if not otp_record:
        return {"error": "OTP not found or expired. Please request a new code."}

    # Check attempt threshold (max 3 failed attempts)
    attempts = otp_record.get("attempts", 0)
    if attempts >= 3:
        await db.otps.delete_one({"phone": clean_phone})
        return {"error": "Maximum verification attempts exceeded. Please request a new code."}

    # Check expiry
    expires_at = otp_record.get("expires_at", 0)
    if time.time() > expires_at:
        await db.otps.delete_one({"phone": clean_phone})
        return {"error": "OTP has expired. Please request a new code."}

    # Hash comparison
    input_hash = hash_otp(clean_phone, data.otp.strip())
    if input_hash != otp_record.get("otp_hash"):
        await db.otps.update_one({"phone": clean_phone}, {"$inc": {"attempts": 1}})
        return {"error": "Invalid verification code. Please check and try again."}

    # OTP is valid! Delete record to prevent replay
    await db.otps.delete_one({"phone": clean_phone})

    # MongoDB User Lookup
    existing_user = await db.users.find_one({"phone": clean_phone})
    now_iso = datetime.utcnow().isoformat()
    user_email = existing_user.get("email") if existing_user else f"{clean_phone.replace('+', '')}@phone.acuspeak.com"

    if existing_user:
        # Returning User Flow
        day_streak_val = await touch_user_streak(existing_user)
        user_name = existing_user.get("name") or "Phone User"
        user_id = existing_user.get("user_id") or f"usr_{uuid.uuid4().hex[:16]}"
        update_data = {
            "user_id": user_id,
            "name": user_name,
            "updated_at": now_iso
        }
        await db.users.update_one({"phone": clean_phone}, {"$set": update_data})
        session_token = create_session_token(user_email)
        return {
            "message": "Phone verification successful",
            "session_token": session_token,
            "name": user_name,
            "email": user_email,
            "user_id": user_id,
            "is_registered": True,
            "is_new_user": False,
            "day_streak": day_streak_val,
        }
    else:
        # New User Onboarding Flow
        if not data.name or not data.name.strip():
            return {"error": "Name is required for new user registration."}

        user_name = data.name.strip()
        user_id = f"usr_{uuid.uuid4().hex[:16]}"
        today_str = datetime.utcnow().date().isoformat()
        new_user = {
            "user_id": user_id,
            "phone": clean_phone,
            "email": user_email,
            "name": user_name,
            "referral": data.referral.strip() if data.referral else None,
            "provider": "phone",
            "day_streak": 1,
            "streak": 1,
            "last_active_date": today_str,
            "streak_updated_at": now_iso,
            "streak_protection": False,
            "total_xp": 100,
            "daily_goal_minutes": 20,
            "daily_goal_completed_minutes": 0,
            "created_at": now_iso,
            "updated_at": now_iso
        }
        await db.users.insert_one(new_user)
        session_token = create_session_token(user_email)
        return {
            "message": "Phone registration successful",
            "session_token": session_token,
            "name": user_name,
            "email": user_email,
            "user_id": user_id,
            "is_registered": False,
            "is_new_user": True,
            "day_streak": 1,
        }

    