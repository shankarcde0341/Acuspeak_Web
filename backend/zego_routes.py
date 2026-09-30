import hashlib
import time
from typing import Optional

from fastapi import APIRouter, Header, HTTPException, Request
from pydantic import BaseModel, Field

from auth import verify_session_token
from zego_service import TOKEN_TTL_SECONDS, generate_zego_token, get_app_id

router = APIRouter(prefix="/api/zego", tags=["Zego"])

# In-memory rate limiting tracker for zego token requests
_zego_rate_tracker: dict[str, list[float]] = {}


def _apply_zego_rate_limit(user_identifier: str, max_requests: int = 10, window_seconds: int = 60):
    now = time.time()
    timestamps = _zego_rate_tracker.get(user_identifier, [])
    timestamps = [ts for ts in timestamps if now - ts < window_seconds]
    if len(timestamps) >= max_requests:
        raise HTTPException(status_code=429, detail="Too many token requests. Please try again later.")
    timestamps.append(now)
    _zego_rate_tracker[user_identifier] = timestamps


class ZegoTokenRequest(BaseModel):
    room_id: str = Field(pattern=r"^[A-Za-z0-9_-]{1,64}$")


class ZegoTokenResponse(BaseModel):
    app_id: int
    user_id: str
    token: str
    expires_in: int


@router.post("/token", response_model=ZegoTokenResponse)
async def get_zego_token(
    body: ZegoTokenRequest,
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

    # 2. Rate limit AFTER authentication
    _apply_zego_rate_limit(email)

    # 3. Generate safe user_id (raw email is not exposed)
    user_id = "u_" + hashlib.sha256(email.lower().encode("utf-8")).hexdigest()[:16]

    # 4. Generate Zego Token04
    try:
        app_id = get_app_id()
        token = generate_zego_token(user_id=user_id, room_id=body.room_id)
        return ZegoTokenResponse(
            app_id=app_id,
            user_id=user_id,
            token=token,
            expires_in=TOKEN_TTL_SECONDS,
        )
    except RuntimeError:
        raise HTTPException(status_code=500, detail="Voice service unavailable")
    except Exception:
        raise HTTPException(status_code=500, detail="Voice service unavailable")
