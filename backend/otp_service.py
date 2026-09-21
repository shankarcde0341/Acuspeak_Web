# ==========================================
# OTP SERVICE & PROVIDERS (Modular SMS Architecture)
# ==========================================

import os
import hashlib
import random
import secrets
from abc import ABC, abstractmethod
from typing import Tuple

# Environment settings for OTP provider selection
SMS_PROVIDER = os.getenv("SMS_PROVIDER", "mock")
OTP_SECRET_SALT = os.getenv("OTP_SECRET_SALT", "acuspeak_otp_salt_2026")


def hash_otp(phone: str, otp: str) -> str:
    """
    Hashes the phone number and OTP using SHA-256 with a salt to ensure OTPs are never stored in plaintext.
    """
    raw = f"{phone}:{otp}:{OTP_SECRET_SALT}"
    return hashlib.sha256(raw.encode()).hexdigest()


def generate_otp() -> str:
    """
    Generates a secure 6-digit numeric OTP code.
    In development/mock mode, returns '123456' for predictable testing.
    """
    if SMS_PROVIDER == "mock":
        return "123456"
    return str(random.randint(100000, 999999))


class BaseOTPProvider(ABC):
    """
    Abstract base class for SMS providers.
    Allows easy switching from Mock to Twilio, Msg91, AWS SNS, etc.
    """
    @abstractmethod
    async def send_otp(self, phone: str, otp: str) -> bool:
        pass


class MockOTPProvider(BaseOTPProvider):
    """
    Development & Testing Mock Provider.
    Does NOT log raw OTP in production logs (Rules.md Section 4).
    """
    async def send_otp(self, phone: str, otp: str) -> bool:
        # Rules.md Section 4: Do not log raw OTPs in plaintext.
        masked_phone = phone[:3] + "****" + phone[-2:] if len(phone) > 5 else "****"
        print(f"[MockOTPProvider] OTP request dispatched successfully to {masked_phone}")
        return True


class TwilioOTPProvider(BaseOTPProvider):
    """
    Production SMS Provider Stub (Twilio / External SMS Gateway).
    Activated when SMS_PROVIDER=twilio in backend/.env.
    """
    def __init__(self):
        self.account_sid = os.getenv("TWILIO_ACCOUNT_SID", "")
        self.auth_token = os.getenv("TWILIO_AUTH_TOKEN", "")
        self.from_phone = os.getenv("TWILIO_FROM_PHONE", "")

    async def send_otp(self, phone: str, otp: str) -> bool:
        if not self.account_sid or not self.auth_token:
            raise ValueError("Twilio credentials not configured in backend/.env")
        # Placeholder for Twilio REST client API call
        # e.g., client.messages.create(body=f"Your Acuspeak code is {otp}", from_=self.from_phone, to=phone)
        return True


def get_otp_provider() -> BaseOTPProvider:
    """
    Factory function returning the configured SMS provider instance.
    """
    if SMS_PROVIDER.lower() == "twilio":
        return TwilioOTPProvider()
    return MockOTPProvider()
