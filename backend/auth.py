# ==========================================
# IMPORTS AND REASONS (Import karne ki wajah)
# ==========================================

import os
import secrets
import hmac
import hashlib
import time
import httpx
from urllib.parse import urlencode
from passlib.context import CryptContext
from dotenv import load_dotenv

# .env variables load karein
load_dotenv()

# Google OAuth Credentials & Configs (Strictly backend side par secret parameters)
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET", "")
GOOGLE_REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI", "http://localhost:8000/api/auth/google/callback")
JWT_SECRET = os.getenv("JWT_SECRET", "acuspeak_default_secret_key_2026")


# ==========================================
# SETUP (Password Hashing Configuration)
# ==========================================

# CryptContext initialize karein: 'bcrypt' hashing algorithm configuration ke saath setup kiya gaya hai.
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# ==========================================
# FUNCTIONS (Functions and their workings)
# ==========================================

# Function: verify_password
# Reason: Login ke waqt user dwara diye gaye password ko database mein saved hashed password se verify karne ke liye.
# Working: User ka input (plain_password) aur database ka stored hash (hashed_password) ko compare karta hai. Match hone par True, warna False return karta hai.
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


# Function: get_password_hash
# Reason: User registration ya signup ke waqt plain password ko database mein securely store karne se pehle hash karne ke liye.
# Working: Plain-text password leta hai aur bcrypt algorithm ka use karke secure hashed string return karta hai.
def get_password_hash(password):
    return pwd_context.hash(password)


# Function: generate_google_auth_url
# Reason: Google consent screen redirect URL generate karne ke liye backend par secret keys securely hold karte hue.
# Working: Google Accounts OAuth 2.0 endpoint ke liye query params (client_id, redirect_uri, scope, state, response_type) construct karke URL return karta hai.
def generate_google_auth_url(state: str) -> str:
    params = {
        "client_id": GOOGLE_CLIENT_ID,
        "redirect_uri": GOOGLE_REDIRECT_URI,
        "response_type": "code",
        "scope": "openid email profile",
        "state": state,
        "access_type": "offline",
        "prompt": "select_account",
    }
    return f"https://accounts.google.com/o/oauth2/v2/auth?{urlencode(params)}"


# Function: exchange_code_for_google_token
# Reason: Google authorization code ko access token mein exchange karne ke liye server-to-server HTTP request se.
# Working: Client Secret backend par rakhte hue Google token URL ('https://oauth2.googleapis.com/token') par async POST request bhejta hai.
async def exchange_code_for_google_token(code: str) -> dict:
    payload = {
        "code": code,
        "client_id": GOOGLE_CLIENT_ID,
        "client_secret": GOOGLE_CLIENT_SECRET,
        "redirect_uri": GOOGLE_REDIRECT_URI,
        "grant_type": "authorization_code",
    }
    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.post("https://oauth2.googleapis.com/token", data=payload)
        if response.status_code != 200:
            raise Exception(f"Google token exchange failed: {response.text}")
        return response.json()


# Function: fetch_google_user_info
# Reason: Verified user email, name aur profile picture Google UserInfo API se fetch karne ke liye.
# Working: Access token ke saath Google UserInfo endpoint ('https://www.googleapis.com/oauth2/v2/userinfo') par GET request bhejta hai.
async def fetch_google_user_info(access_token: str) -> dict:
    headers = {"Authorization": f"Bearer {access_token}"}
    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.get("https://www.googleapis.com/oauth2/v2/userinfo", headers=headers)
        if response.status_code != 200:
            raise Exception(f"Failed to fetch Google user info: {response.text}")
        return response.json()


# Function: create_session_token
# Reason: Authenticated user ke liye safe server-signed session token create karne ke liye.
# Working: User email, timestamp aur secret signature ko combine karke hex session token return karta hai.
def create_session_token(email: str) -> str:
    timestamp = str(int(time.time()))
    raw_str = f"{email}:{timestamp}"
    signature = hmac.new(JWT_SECRET.encode(), raw_str.encode(), hashlib.sha256).hexdigest()
    return f"{raw_str}:{signature}"


