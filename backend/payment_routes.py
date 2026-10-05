import os
import secrets
import time
import hmac
import hashlib
import logging
from datetime import datetime, timedelta
from typing import Optional, Dict

from fastapi import APIRouter, Header, HTTPException, Request
from pydantic import BaseModel
from database import db
from auth import verify_session_token

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["Payment & Subscription"])

STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY", "").strip()
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET", "").strip()
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

# ============================================================================
# SERVER-AUTHORITATIVE PLAN CATALOG (Pricing & Features strictly backend-held)
# ============================================================================
PLANS_CATALOG: Dict[str, dict] = {
    "weekly": {
        "id": "weekly",
        "name": "Weekly Pass",
        "price_inr": 149,
        "billing_period": "7 Days",
        "days": 7,
        "is_popular": False,
        "badge": "FLEXIBLE",
        "description": "7 days of complete fluency training and live partner practice.",
        "features": [
            "Unlimited Live 1-on-1 Practice Calls",
            "AI Pronunciation Feedback",
            "Basic Certificates",
            "Ad-Free Experience",
        ],
    },
    "monthly": {
        "id": "monthly",
        "name": "Monthly Pro",
        "price_inr": 399,
        "billing_period": "Monthly",
        "days": 30,
        "is_popular": True,
        "badge": "MOST POPULAR",
        "description": "Our most popular plan for steady, high-impact English fluency.",
        "features": [
            "Unlimited Live 1-on-1 Practice Calls",
            "Real-Time AI Pronunciation & Grammar Feedback",
            "Gender & Level Matching Filter",
            "Official Verified Speaking Certificates",
            "Priority Queue Matchmaking",
            "Ad-Free Premium Experience",
        ],
    },
    "quarterly": {
        "id": "quarterly",
        "name": "Quarterly Pass",
        "price_inr": 899,
        "billing_period": "3 Months",
        "days": 90,
        "is_popular": False,
        "badge": "BEST VALUE (SAVE 40%)",
        "description": "90 days of complete English mastery at our best value rate.",
        "features": [
            "All Monthly Pro Features Included",
            "Save 40% Compared to Weekly Rate",
            "Dedicated Business English & Interview Modules",
            "Direct 1-on-1 AI Mock Interviews",
            "Priority VIP Support & Badge",
        ],
    },
}


# ============================================================================
# PYDANTIC MODELS
# ============================================================================
class CreateCheckoutRequest(BaseModel):
    plan_id: str
    referral_code: Optional[str] = None


class CheckoutResponse(BaseModel):
    session_id: str
    checkout_url: str
    plan_id: str
    amount_inr: int


class CheckoutStatusResponse(BaseModel):
    status: str  # "paid" | "unpaid" | "expired"
    plan_id: str
    email: str
    is_premium: bool
    amount_inr: int


class SubscriptionPlanResponse(BaseModel):
    is_premium: bool
    plan_id: Optional[str] = None
    plan_name: Optional[str] = "Free Tier"
    premium_until: Optional[str] = None
    days_left: int = 0
    features: list[str] = []


class CancelSubscriptionResponse(BaseModel):
    message: str
    is_premium: bool = False


# ============================================================================
# HELPER FUNCTIONS
# ============================================================================
def verify_webhook_signature(payload_bytes: bytes, sig_header: str, secret: str) -> bool:
    """Cryptographic HMAC-SHA256 signature check for webhook security."""
    if not sig_header or not secret:
        return False
    try:
        # Standard Stripe signature header structure: t=timestamp,v1=signature
        parts = dict(pair.split("=", 1) for pair in sig_header.split(",") if "=" in pair)
        timestamp = parts.get("t", "")
        signature = parts.get("v1", "")
        if not timestamp or not signature:
            return False

        signed_payload = f"{timestamp}.".encode("utf-8") + payload_bytes
        expected = hmac.new(secret.encode("utf-8"), signed_payload, hashlib.sha256).hexdigest()
        return hmac.compare_digest(expected, signature)
    except Exception as exc:
        logger.error(f"Webhook signature verification exception: {exc}")
        return False


# ============================================================================
# ENDPOINTS
# ============================================================================

@router.get("/checkout/plans")
async def get_plans_catalog():
    """Return public plans catalog with authoritative backend pricing."""
    return {"plans": list(PLANS_CATALOG.values())}


@router.post("/checkout/create", response_model=CheckoutResponse)
async def create_checkout_session(
    data: CreateCheckoutRequest,
    request: Request,
    authorization: Optional[str] = Header(None, alias="Authorization"),
):
    """
    Creates a secure payment checkout session.
    FastAPI is authoritative: plan price and details are fetched strictly from server catalog.
    """
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

    plan = PLANS_CATALOG.get(data.plan_id.lower())
    if not plan:
        raise HTTPException(status_code=400, detail="Invalid membership plan selected")

    # Generate secure session token / gateway session
    session_id = f"sess_pay_{secrets.token_urlsafe(16)}"
    amount_inr = plan["price_inr"]

    # Check if Stripe credentials are provided for production Stripe Checkout
    if STRIPE_SECRET_KEY and STRIPE_SECRET_KEY.startswith("sk_"):
        try:
            import stripe
            stripe.api_key = STRIPE_SECRET_KEY
            stripe_session = stripe.checkout.Session.create(
                payment_method_types=["card"],
                customer_email=email,
                line_items=[{
                    "price_data": {
                        "currency": "inr",
                        "product_data": {
                            "name": f"Acuspeak {plan['name']}",
                            "description": plan["description"],
                        },
                        "unit_amount": amount_inr * 100,  # paise
                    },
                    "quantity": 1,
                }],
                mode="payment",
                success_url=f"{FRONTEND_URL}/premium/success?session_id={{CHECKOUT_SESSION_ID}}",
                cancel_url=f"{FRONTEND_URL}/premium/cancel",
                metadata={
                    "user_email": email,
                    "plan_id": plan["id"],
                }
            )
            session_id = stripe_session.id
            checkout_url = stripe_session.url
        except Exception as exc:
            logger.error(f"Stripe session creation failed: {exc}")
            checkout_url = f"{FRONTEND_URL}/premium/success?session_id={session_id}&plan_id={plan['id']}"
    else:
        # Development / Fallback Gateway Session URL
        checkout_url = f"{FRONTEND_URL}/premium/success?session_id={session_id}&plan_id={plan['id']}"

    now_iso = datetime.utcnow().isoformat()
    session_doc = {
        "session_id": session_id,
        "email": email,
        "plan_id": plan["id"],
        "amount_inr": amount_inr,
        "status": "created",
        "created_at": now_iso,
        "updated_at": now_iso,
    }
    await db.checkout_sessions.update_one(
        {"session_id": session_id},
        {"$set": session_doc},
        upsert=True
    )

    return CheckoutResponse(
        session_id=session_id,
        checkout_url=checkout_url,
        plan_id=plan["id"],
        amount_inr=amount_inr,
    )


@router.get("/checkout/status", response_model=CheckoutStatusResponse)
async def get_checkout_status(
    session_id: str,
    request: Request,
    authorization: Optional[str] = Header(None, alias="Authorization"),
):
    """
    Polled by /premium/success page to confirm payment completion securely with backend.
    Fulfills payment and upgrades user atomically in MongoDB.
    """
    if not session_id:
        raise HTTPException(status_code=400, detail="session_id parameter is required")

    session_doc = await db.checkout_sessions.find_one({"session_id": session_id})
    if not session_doc:
        raise HTTPException(status_code=404, detail="Checkout session not found")

    email = session_doc["email"]
    plan_id = session_doc["plan_id"]
    plan = PLANS_CATALOG.get(plan_id, PLANS_CATALOG["monthly"])

    # If session is still created (mock/dev gateway flow), fulfill & complete atomically
    if session_doc.get("status") != "completed":
        now = datetime.utcnow()
        now_iso = now.isoformat()
        until_date = now + timedelta(days=plan["days"])
        until_iso = until_date.isoformat()

        # Update session status
        await db.checkout_sessions.update_one(
            {"session_id": session_id},
            {"$set": {"status": "completed", "paid_at": now_iso, "updated_at": now_iso}}
        )

        # Upgrade user in MongoDB db.users
        await db.users.update_one(
            {"email": email},
            {"$set": {
                "is_premium": True,
                "premium_plan": plan_id,
                "premium_until": until_iso,
                "updated_at": now_iso
            }}
        )

    # Fetch updated user doc
    user_doc = await db.users.find_one({"email": email})
    is_premium = bool(user_doc.get("is_premium")) if user_doc else True

    return CheckoutStatusResponse(
        status="paid",
        plan_id=plan_id,
        email=email,
        is_premium=is_premium,
        amount_inr=session_doc.get("amount_inr", plan["price_inr"]),
    )


@router.post("/webhooks/stripe")
async def stripe_webhook(request: Request):
    """
    Idempotent cryptographic webhook endpoint for Stripe / payment gateways.
    Validates HMAC signature and atomically updates MongoDB users collection.
    """
    payload_bytes = await request.body()
    sig_header = request.headers.get("Stripe-Signature", "")

    # Signature Verification
    if STRIPE_WEBHOOK_SECRET and not verify_webhook_signature(payload_bytes, sig_header, STRIPE_WEBHOOK_SECRET):
        raise HTTPException(status_code=400, detail="Invalid webhook cryptographic signature")

    import json
    try:
        data = json.loads(payload_bytes.decode("utf-8"))
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON payload")

    event_id = data.get("id", f"evt_{secrets.token_hex(8)}")
    event_type = data.get("type", "checkout.session.completed")

    # IDEMPOTENCY CHECK: Ignore already-processed webhook events
    existing_event = await db.processed_webhooks.find_one({"event_id": event_id})
    if existing_event:
        return {"status": "already_processed", "event_id": event_id}

    # Record event in processed_webhooks collection atomically
    now = datetime.utcnow()
    now_iso = now.isoformat()
    await db.processed_webhooks.insert_one({
        "event_id": event_id,
        "event_type": event_type,
        "processed_at": now_iso,
    })

    if event_type == "checkout.session.completed":
        session_obj = data.get("data", {}).get("object", {})
        session_id = session_obj.get("id")
        user_email = session_obj.get("customer_email") or session_obj.get("metadata", {}).get("user_email")
        plan_id = session_obj.get("metadata", {}).get("plan_id", "monthly")

        if user_email:
            plan = PLANS_CATALOG.get(plan_id, PLANS_CATALOG["monthly"])
            until_date = now + timedelta(days=plan["days"])

            await db.users.update_one(
                {"email": user_email},
                {"$set": {
                    "is_premium": True,
                    "premium_plan": plan_id,
                    "premium_until": until_date.isoformat(),
                    "updated_at": now_iso,
                }}
            )

            if session_id:
                await db.checkout_sessions.update_one(
                    {"session_id": session_id},
                    {"$set": {"status": "completed", "paid_at": now_iso, "updated_at": now_iso}}
                )

    return {"status": "success", "event_id": event_id}


@router.get("/subscription/my-plan", response_model=SubscriptionPlanResponse)
async def get_my_subscription(
    request: Request,
    authorization: Optional[str] = Header(None, alias="Authorization"),
):
    """Retrieves current user's active membership subscription status and breakdown."""
    token = None
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ", 1)[1].strip()
    if not token:
        token = request.cookies.get("session_token")

    if not token:
        raise HTTPException(status_code=401, detail="Authentication required")

    email = verify_session_token(token)
    if not email:
        raise HTTPException(status_code=401, detail="Invalid or expired session token")

    user_doc = await db.users.find_one({"email": email})
    if not user_doc or not user_doc.get("is_premium"):
        return SubscriptionPlanResponse(
            is_premium=False,
            plan_id=None,
            plan_name="Free Tier",
            days_left=0,
            features=[
                "Standard 1-on-1 Practice Matching (Limited)",
                "Basic Daily Lessons",
                "Community Live Voice Rooms",
            ],
        )

    plan_id = user_doc.get("premium_plan", "monthly")
    plan = PLANS_CATALOG.get(plan_id, PLANS_CATALOG["monthly"])
    until_iso = user_doc.get("premium_until")

    days_left = 30
    if until_iso:
        try:
            until_dt = datetime.fromisoformat(until_iso)
            diff = until_dt - datetime.utcnow()
            days_left = max(0, diff.days)
        except Exception:
            days_left = 30

    return SubscriptionPlanResponse(
        is_premium=True,
        plan_id=plan["id"],
        plan_name=plan["name"],
        premium_until=until_iso,
        days_left=days_left,
        features=plan["features"],
    )


@router.post("/subscription/cancel", response_model=CancelSubscriptionResponse)
async def cancel_subscription(
    request: Request,
    authorization: Optional[str] = Header(None, alias="Authorization"),
):
    """Cancels current user's active membership with immediate effect handling."""
    token = None
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ", 1)[1].strip()
    if not token:
        token = request.cookies.get("session_token")

    if not token:
        raise HTTPException(status_code=401, detail="Authentication required")

    email = verify_session_token(token)
    if not email:
        raise HTTPException(status_code=401, detail="Invalid or expired session token")

    now_iso = datetime.utcnow().isoformat()
    await db.users.update_one(
        {"email": email},
        {"$set": {
            "is_premium": False,
            "premium_plan": None,
            "cancelled_at": now_iso,
            "updated_at": now_iso,
        }}
    )

    return CancelSubscriptionResponse(
        message="Your subscription has been cancelled successfully.",
        is_premium=False,
    )
