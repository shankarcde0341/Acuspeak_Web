# ==========================================
# IMPORTS AND REASONS 
# ==========================================

import os
import secrets
import time
from typing import Optional, Dict
from datetime import datetime
from urllib.parse import quote

# FastAPI: Python mein modern, fast aur async web APIs banane ke liye main framework hai.
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import RedirectResponse
from fastapi.middleware.cors import CORSMiddleware

# Pydantic BaseModel: Client se aane wale request data ko validate aur structure karne ke liye.
from pydantic import BaseModel, EmailStr

# asynccontextmanager: FastAPI application ke startup aur shutdown (lifespan) events ko manage karne ke liye context manager decorator hai.
from contextlib import asynccontextmanager

# client, db: MongoDB database connection aur database instance ko custom module (backend/database.py) se access karne ke liye.
from database import client, db

# Authentication helpers: password verification, Google auth URLs, token exchange, user info fetching aur session tokens.
from auth import (
    verify_password,
    generate_google_auth_url,
    exchange_code_for_google_token,
    fetch_google_user_info,
    create_session_token,
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


# Model: GoogleUserPayload
# Reason: Google UserInfo API se prapt payload ko MongoDB operation se pehle strictly validate karne ke liye.
class GoogleUserPayload(BaseModel):
    email: str
    name: Optional[str] = "User"
    picture: Optional[str] = None
    google_id: Optional[str] = None


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
        
    session_token = create_session_token(user["email"])
    return {
        "message": "Login successful",
        "email": user["email"],
        "name": user.get("name", "User"),
        "session_token": session_token
    }


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
            await db.users.update_one(
                {"email": payload.email},
                {"$set": {
                    "name": payload.name,
                    "picture": payload.picture,
                    "google_id": payload.google_id,
                    "updated_at": now_iso
                }}
            )
        else:
            new_user_doc = {
                "email": payload.email,
                "name": payload.name,
                "picture": payload.picture,
                "google_id": payload.google_id,
                "provider": "google",
                "created_at": now_iso,
                "updated_at": now_iso
            }
            await db.users.insert_one(new_user_doc)

        # 5. Create secure session token and redirect to frontend callback
        token = create_session_token(payload.email)
        redirect_url = f"{FRONTEND_URL}/auth/callback?session_token={quote(token)}&email={quote(payload.email)}&name={quote(payload.name)}"
        return RedirectResponse(url=redirect_url)

    except Exception as exc:
        print(f"Google OAuth Callback Exception: {exc}")
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

    response_payload = {
        "message": "OTP code sent successfully.",
        "success": True
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
#   3. Session token return karta hai.
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

    # MongoDB User Upsert
    existing_user = await db.users.find_one({"phone": clean_phone})
    now_iso = datetime.utcnow().isoformat()
    user_name = data.name or (existing_user.get("name") if existing_user else "Phone User")
    user_email = f"{clean_phone.replace('+', '')}@phone.acuspeak.com"

    if existing_user:
        await db.users.update_one(
            {"phone": clean_phone},
            {"$set": {
                "name": user_name,
                "updated_at": now_iso
            }}
        )
    else:
        new_user = {
            "phone": clean_phone,
            "email": user_email,
            "name": user_name,
            "referral": data.referral or None,
            "provider": "phone",
            "created_at": now_iso,
            "updated_at": now_iso
        }
        await db.users.insert_one(new_user)

    session_token = create_session_token(user_email)
    return {
        "message": "Phone verification successful",
        "session_token": session_token,
        "name": user_name,
        "email": user_email
    }

    