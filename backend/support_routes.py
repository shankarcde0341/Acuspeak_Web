import os
import re
import time
import smtplib
import logging
from typing import Optional, Dict
from datetime import datetime, timezone
from email.message import EmailMessage

from fastapi import APIRouter, HTTPException, Request
from starlette.concurrency import run_in_threadpool
from pydantic import BaseModel, Field, field_validator

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/support", tags=["Support"])

EMAIL_REGEX = re.compile(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")

# In-memory rate-limiting trackers:
# Limit: 3 submissions per 10 minutes (600 seconds) per IP AND per email
_ip_rate_tracker: Dict[str, list[float]] = {}
_email_rate_tracker: Dict[str, list[float]] = {}


def apply_support_rate_limit(ip: str, email: str, max_requests: int = 3, window_seconds: int = 600):
    now = time.time()

    # Check IP
    ip_ts = [ts for ts in _ip_rate_tracker.get(ip, []) if now - ts < window_seconds]
    if len(ip_ts) >= max_requests:
        raise HTTPException(status_code=429, detail="Too many attempts, please try again later.")

    # Check Email
    normalized_email = email.strip().lower()
    email_ts = [ts for ts in _email_rate_tracker.get(normalized_email, []) if now - ts < window_seconds]
    if len(email_ts) >= max_requests:
        raise HTTPException(status_code=429, detail="Too many attempts, please try again later.")

    # Record current attempt
    ip_ts.append(now)
    _ip_rate_tracker[ip] = ip_ts

    email_ts.append(now)
    _email_rate_tracker[normalized_email] = email_ts


class SupportRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=80)
    email: str = Field(..., max_length=254)
    phone: Optional[str] = Field(None, max_length=20)
    message: str = Field(..., min_length=10, max_length=2000)
    website: Optional[str] = Field(None, max_length=100)  # Honeypot

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 2 or len(v) > 80:
            raise ValueError("Name must be between 2 and 80 characters.")
        if re.search(r"[\r\n\x00-\x1f]", v):
            raise ValueError("Name contains invalid characters.")
        return v

    @field_validator("email")
    @classmethod
    def validate_email_clean(cls, v: str) -> str:
        v = str(v).strip()
        if len(v) > 254:
            raise ValueError("Email exceeds maximum length of 254 characters.")
        if re.search(r"[\r\n\x00-\x1f]", v):
            raise ValueError("Email contains invalid characters.")
        if not EMAIL_REGEX.match(v):
            raise ValueError("Invalid email address format.")
        return v

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return None
        v = v.strip()
        if not v:
            return None
        if re.search(r"[\r\n\x00-\x1f]", v):
            raise ValueError("Phone number contains invalid characters.")
        digits_only = re.sub(r"[^\d]", "", v)
        if len(digits_only) < 7 or len(digits_only) > 15:
            raise ValueError("Phone number must contain between 7 and 15 digits.")
        if not re.match(r"^[+\s\d\-()]{7,20}$", v):
            raise ValueError("Phone number contains invalid formatting.")
        return v

    @field_validator("message")
    @classmethod
    def validate_message(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 10 or len(v) > 2000:
            raise ValueError("Message must be between 10 and 2000 characters.")
        if "\x00" in v:
            raise ValueError("Message contains invalid characters.")
        return v

    @field_validator("website")
    @classmethod
    def clean_honeypot(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return None
        return v.strip()


class SupportResponse(BaseModel):
    success: bool
    message: str


def _send_smtp_email(
    smtp_host: str,
    smtp_port: int,
    smtp_username: str,
    smtp_password: str,
    from_email: str,
    receiver_email: str,
    user_name: str,
    user_email: str,
    user_phone: Optional[str],
    message_content: str,
):
    """Blocking SMTP sender function run inside threadpool."""
    msg = EmailMessage()
    msg["Subject"] = "[Acuspeak Support] New message"
    msg["From"] = from_email
    msg["To"] = receiver_email
    msg["Reply-To"] = user_email.replace("\r", "").replace("\n", "")

    timestamp_utc = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
    phone_display = user_phone if user_phone else "Not provided"

    body_text = (
        f"Name: {user_name}\n"
        f"Email: {user_email}\n"
        f"Phone: {phone_display}\n"
        f"Submitted At (UTC): {timestamp_utc}\n\n"
        f"Message:\n"
        f"{message_content}\n"
    )
    msg.set_content(body_text)

    with smtplib.SMTP(smtp_host, smtp_port, timeout=10) as server:
        server.starttls()
        server.login(smtp_username, smtp_password)
        server.send_message(msg)


@router.post("", response_model=SupportResponse)
@router.post("/", response_model=SupportResponse, include_in_schema=False)
async def submit_support_request(body: SupportRequest, request: Request):
    # 1. Check honeypot
    if body.website and body.website.strip():
        return SupportResponse(
            success=True,
            message="Your message has been sent successfully."
        )

    # 2. Rate limiting check
    client_ip = request.client.host if request.client else "127.0.0.1"
    apply_support_rate_limit(client_ip, body.email)

    # 3. Environment configuration check
    smtp_host = (os.getenv("SMTP_HOST") or "").strip()
    smtp_port_raw = (os.getenv("SMTP_PORT") or "").strip()
    smtp_username = (os.getenv("SMTP_USERNAME") or "").strip()
    smtp_password = (os.getenv("SMTP_PASSWORD") or "").strip()
    from_email = (os.getenv("SMTP_FROM_EMAIL") or "").strip()
    receiver_email = (os.getenv("SUPPORT_RECEIVER_EMAIL") or "").strip()

    if not all([smtp_host, smtp_port_raw, smtp_username, smtp_password, from_email, receiver_email]):
        logger.warning("Support email configuration is incomplete in backend environment.")
        raise HTTPException(
            status_code=503,
            detail="Support is temporarily unavailable"
        )

    try:
        smtp_port = int(smtp_port_raw)
    except ValueError:
        logger.warning("SMTP_PORT is not a valid integer.")
        raise HTTPException(
            status_code=503,
            detail="Support is temporarily unavailable"
        )

    # 4. Non-blocking email delivery via threadpool
    try:
        await run_in_threadpool(
            _send_smtp_email,
            smtp_host=smtp_host,
            smtp_port=smtp_port,
            smtp_username=smtp_username,
            smtp_password=smtp_password,
            from_email=from_email,
            receiver_email=receiver_email,
            user_name=body.name,
            user_email=body.email,
            user_phone=body.phone,
            message_content=body.message,
        )
    except Exception as exc:
        logger.error("Failed to send support email via SMTP: %s", str(exc), exc_info=True)
        raise HTTPException(
            status_code=502,
            detail="Unable to send email. Please try again later."
        )

    return SupportResponse(
        success=True,
        message="Your message has been sent successfully."
    )
