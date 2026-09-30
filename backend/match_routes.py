import hashlib
import secrets
import time
from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Header, HTTPException, Request
from pydantic import BaseModel
from pymongo import ReturnDocument

from auth import verify_session_token
from database import db

router = APIRouter(prefix="/api/match", tags=["Matchmaking"])

# In-memory rate limiting trackers
_match_join_rate_tracker: dict[str, list[float]] = {}
_match_general_rate_tracker: dict[str, list[float]] = {}


def _apply_match_join_rate_limit(user_identifier: str, max_requests: int = 1, window_seconds: float = 3.0):
    now = time.time()
    timestamps = _match_join_rate_tracker.get(user_identifier, [])
    timestamps = [ts for ts in timestamps if now - ts < window_seconds]
    if len(timestamps) >= max_requests:
        raise HTTPException(status_code=429, detail="Too many match join requests. Please wait a few seconds.")
    timestamps.append(now)
    _match_join_rate_tracker[user_identifier] = timestamps


def _apply_match_general_rate_limit(user_identifier: str, max_requests: int = 10, window_seconds: float = 60.0):
    now = time.time()
    timestamps = _match_general_rate_tracker.get(user_identifier, [])
    timestamps = [ts for ts in timestamps if now - ts < window_seconds]
    if len(timestamps) >= max_requests:
        raise HTTPException(status_code=429, detail="Too many requests. Please try again later.")
    timestamps.append(now)
    _match_general_rate_tracker[user_identifier] = timestamps


# ---------------------------------------------------------------------------
# PYDANTIC RESPONSE MODELS
# ---------------------------------------------------------------------------

class PartnerInfo(BaseModel):
    id: str
    name: str


class MatchResponse(BaseModel):
    status: str  # "searching" | "matched" | "idle"
    room_id: Optional[str] = None
    partner: Optional[PartnerInfo] = None


class CancelResponse(BaseModel):
    message: str
    status: str = "idle"


# ---------------------------------------------------------------------------
# ENDPOINTS
# ---------------------------------------------------------------------------

@router.post("/join", response_model=MatchResponse)
async def join_matchmaking(
    request: Request,
    authorization: Optional[str] = Header(None, alias="Authorization"),
):
    # 1. Authorization check
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Authentication required")

    raw_token = authorization.split(" ", 1)[1].strip()
    email = verify_session_token(raw_token)
    if not email:
        raise HTTPException(status_code=401, detail="Invalid or expired session token")

    # 2. Rate limit: 1 request / 3 seconds per user
    _apply_match_join_rate_limit(email)

    now = datetime.utcnow()
    cutoff_time = now - timedelta(seconds=130)
    user_id = "u_" + hashlib.sha256(email.lower().encode("utf-8")).hexdigest()[:16]

    # Set current user state to searching (with $setOnInsert for safe upsert if user is new)
    await db.users.update_one(
        {"email": email},
        {
            "$set": {
                "matchmaking_status": "searching",
                "matchmaking_room_id": None,
                "matchmaking_started_at": now,
                "updated_at": now.isoformat()
            },
            "$setOnInsert": {
                "email": email,
                "name": "User",
                "user_id": user_id,
                "created_at": now.isoformat()
            }
        },
        upsert=True
    )

    new_room_id = "room_" + secrets.token_urlsafe(12)

    # Atomic find_one_and_update to claim an available searching partner
    matched_partner = await db.users.find_one_and_update(
        {
            "email": {"$ne": email},
            "matchmaking_status": "searching",
            "matchmaking_started_at": {"$gte": cutoff_time}
        },
        {"$set": {
            "matchmaking_status": "in_call",
            "matchmaking_room_id": new_room_id,
            "updated_at": now.isoformat()
        }},
        return_document=ReturnDocument.AFTER
    )

    if matched_partner:
        # Match found! Set current user to in_call with the same room_id
        await db.users.update_one(
            {"email": email},
            {"$set": {
                "matchmaking_status": "in_call",
                "matchmaking_room_id": new_room_id,
                "updated_at": now.isoformat()
            }}
        )

        partner_email = matched_partner["email"]
        partner_id = "u_" + hashlib.sha256(partner_email.lower().encode("utf-8")).hexdigest()[:16]
        partner_name = matched_partner.get("name", "User")

        return MatchResponse(
            status="matched",
            room_id=new_room_id,
            partner=PartnerInfo(id=partner_id, name=partner_name)
        )

    # No match found yet — remain in searching state
    return MatchResponse(status="searching")


@router.get("/status", response_model=MatchResponse)
async def get_matchmaking_status(
    request: Request,
    authorization: Optional[str] = Header(None, alias="Authorization"),
):
    # 1. Authorization check
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Authentication required")

    raw_token = authorization.split(" ", 1)[1].strip()
    email = verify_session_token(raw_token)
    if not email:
        raise HTTPException(status_code=401, detail="Invalid or expired session token")

    # 2. Rate limit: 10 requests / 60s
    _apply_match_general_rate_limit(email)

    user_doc = await db.users.find_one({"email": email})
    if not user_doc:
        return MatchResponse(status="idle")

    status = user_doc.get("matchmaking_status", "idle")
    room_id = user_doc.get("matchmaking_room_id")

    if status == "in_call" and room_id:
        partner_doc = await db.users.find_one({
            "matchmaking_room_id": room_id,
            "email": {"$ne": email}
        })

        if partner_doc:
            partner_email = partner_doc["email"]
            partner_id = "u_" + hashlib.sha256(partner_email.lower().encode("utf-8")).hexdigest()[:16]
            partner_name = partner_doc.get("name", "User")
            return MatchResponse(
                status="matched",
                room_id=room_id,
                partner=PartnerInfo(id=partner_id, name=partner_name)
            )

        return MatchResponse(status="idle")

    if status == "searching":
        return MatchResponse(status="searching")

    return MatchResponse(status="idle")


@router.post("/cancel", response_model=CancelResponse)
async def cancel_matchmaking(
    request: Request,
    authorization: Optional[str] = Header(None, alias="Authorization"),
):
    # 1. Authorization check
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Authentication required")

    raw_token = authorization.split(" ", 1)[1].strip()
    email = verify_session_token(raw_token)
    if not email:
        raise HTTPException(status_code=401, detail="Invalid or expired session token")

    # 2. Rate limit: 10 requests / 60s
    _apply_match_general_rate_limit(email)

    user_doc = await db.users.find_one({"email": email})
    now_iso = datetime.utcnow().isoformat()

    if not user_doc:
        return CancelResponse(message="Matchmaking cancelled successfully", status="idle")

    room_id = user_doc.get("matchmaking_room_id")

    # Reset current user to idle
    await db.users.update_one(
        {"email": email},
        {"$set": {
            "matchmaking_status": "idle",
            "matchmaking_room_id": None,
            "updated_at": now_iso
        }}
    )

    # If user was in a call, reset partner too so partner isn't stuck
    if room_id:
        await db.users.update_many(
            {"matchmaking_room_id": room_id},
            {"$set": {
                "matchmaking_status": "idle",
                "matchmaking_room_id": None,
                "updated_at": now_iso
            }}
        )

    return CancelResponse(message="Matchmaking cancelled successfully", status="idle")
