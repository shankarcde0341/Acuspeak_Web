import hashlib
import re
import secrets
import time
from datetime import datetime
from typing import Optional, List, Dict

from fastapi import APIRouter, Header, HTTPException, Query, Request
from pydantic import BaseModel, Field

from auth import verify_session_token
from database import db
from zego_service import TOKEN_TTL_SECONDS, generate_zego_token, get_app_id

router = APIRouter(prefix="/api/live", tags=["Live Rooms"])

# In-memory rate limiting trackers
_live_create_rate_tracker: Dict[str, list[float]] = {}
_live_token_rate_tracker: Dict[str, list[float]] = {}
_live_join_rate_tracker: Dict[str, list[float]] = {}


def _apply_live_rate_limit(
    tracker: Dict[str, list[float]],
    user_id: str,
    max_requests: int = 5,
    window_seconds: float = 60.0,
    action_name: str = "requests",
):
    now = time.time()
    timestamps = tracker.get(user_id, [])
    timestamps = [ts for ts in timestamps if now - ts < window_seconds]
    if len(timestamps) >= max_requests:
        raise HTTPException(
            status_code=429,
            detail=f"Too many {action_name}. Please wait a moment and try again.",
        )
    timestamps.append(now)
    tracker[user_id] = timestamps


def _extract_auth_user(
    request: Request,
    authorization: Optional[str] = None,
) -> tuple[str, str]:
    """
    Extracts and verifies session token from Authorization header or cookie.
    Returns: (email, user_id)
    """
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

    user_id = "u_" + hashlib.sha256(email.lower().encode("utf-8")).hexdigest()[:16]
    return email, user_id


# ==============================================================================
# PYDANTIC MODELS
# ==============================================================================


class CreateLiveRoomRequest(BaseModel):
    title: str = Field(min_length=3, max_length=100)
    topic: str = Field(min_length=2, max_length=50)
    description: Optional[str] = Field(default="", max_length=300)
    max_participants: int = Field(default=12, ge=2, le=50)


class LiveRoomParticipant(BaseModel):
    user_id: str
    name: str
    role: str = "listener"  # "host" | "speaker" | "listener"
    joined_at: str
    is_muted: bool = False
    is_cam_on: bool = False


class LiveRoomSummary(BaseModel):
    room_id: str
    title: str
    topic: str
    description: Optional[str] = ""
    host_id: str
    host_name: str
    max_participants: int = 12
    participant_count: int = 1
    is_host: bool = False
    created_at: str
    status: str = "active"


class LiveRoomDetail(LiveRoomSummary):
    participants: List[LiveRoomParticipant] = []
    is_user_joined: bool = False
    my_role: Optional[str] = None


class LiveRoomsResponse(BaseModel):
    rooms: List[LiveRoomSummary]
    total: int
    page: int
    limit: int


class JoinLiveRoomResponse(BaseModel):
    success: bool
    room: LiveRoomDetail
    my_role: str
    message: str = "Joined room successfully"


class LiveZegoTokenRequest(BaseModel):
    room_id: str = Field(pattern=r"^[A-Za-z0-9_-]{1,64}$")


class LiveZegoTokenResponse(BaseModel):
    app_id: int
    user_id: str
    user_name: str
    token: str
    expires_in: int
    room_id: str


class KickParticipantRequest(BaseModel):
    target_user_id: str


class ParticipantStateRequest(BaseModel):
    is_muted: Optional[bool] = None
    is_cam_on: Optional[bool] = None
    role: Optional[str] = None


# ==============================================================================
# SEEDING INITIAL ROOMS HELPER
# ==============================================================================


async def _ensure_seed_rooms():
    """Populates initial community rooms if none are active."""
    count = await db.live_rooms.count_documents({"status": "active"})
    if count > 0:
        return

    now_iso = datetime.utcnow().isoformat()
    seed_rooms = [
        {
            "room_id": "room_live_demo_daily",
            "title": "Morning Small Talk & Daily Idioms",
            "topic": "Daily English",
            "description": "Casual morning conversation to build fluency and natural vocabulary.",
            "max_participants": 12,
            "host_id": "u_host_aarav",
            "host_name": "Aarav Mehta",
            "host_email": "aarav.host@acuspeak.internal",
            "status": "active",
            "created_at": now_iso,
            "participants": [
                {
                    "user_id": "u_host_aarav",
                    "name": "Aarav Mehta",
                    "role": "host",
                    "joined_at": now_iso,
                    "is_muted": False,
                    "is_cam_on": True,
                },
                {
                    "user_id": "u_demo_ananya",
                    "name": "Ananya Sharma",
                    "role": "speaker",
                    "joined_at": now_iso,
                    "is_muted": False,
                    "is_cam_on": False,
                },
                {
                    "user_id": "u_demo_vikram",
                    "name": "Vikram Singh",
                    "role": "listener",
                    "joined_at": now_iso,
                    "is_muted": True,
                    "is_cam_on": False,
                },
            ],
            "participant_count": 3,
            "kicked_user_ids": [],
        },
        {
            "room_id": "room_live_demo_interview",
            "title": "Mock Job Interview & Executive Q&A",
            "topic": "Interview English",
            "description": "Simulated technical & behavioral interviews with live instant feedback.",
            "max_participants": 8,
            "host_id": "u_host_neha",
            "host_name": "Neha Kapoor",
            "host_email": "neha.host@acuspeak.internal",
            "status": "active",
            "created_at": now_iso,
            "participants": [
                {
                    "user_id": "u_host_neha",
                    "name": "Neha Kapoor",
                    "role": "host",
                    "joined_at": now_iso,
                    "is_muted": False,
                    "is_cam_on": True,
                },
                {
                    "user_id": "u_demo_rishabh",
                    "name": "Rishabh Verma",
                    "role": "speaker",
                    "joined_at": now_iso,
                    "is_muted": False,
                    "is_cam_on": True,
                },
            ],
            "participant_count": 2,
            "kicked_user_ids": [],
        },
        {
            "room_id": "room_live_demo_pitch",
            "title": "Startup Pitching & Business Negotiations",
            "topic": "Business English",
            "description": "Practice presenting pitch decks, negotiating contracts, and speaking with impact.",
            "max_participants": 10,
            "host_id": "u_host_rohan",
            "host_name": "Rohan Iyer",
            "host_email": "rohan.host@acuspeak.internal",
            "status": "active",
            "created_at": now_iso,
            "participants": [
                {
                    "user_id": "u_host_rohan",
                    "name": "Rohan Iyer",
                    "role": "host",
                    "joined_at": now_iso,
                    "is_muted": False,
                    "is_cam_on": False,
                }
            ],
            "participant_count": 1,
            "kicked_user_ids": [],
        },
    ]

    for doc in seed_rooms:
        await db.live_rooms.update_one(
            {"room_id": doc["room_id"]},
            {"$setOnInsert": doc},
            upsert=True,
        )


# ==============================================================================
# ENDPOINTS
# ==============================================================================


@router.post("/rooms/create", response_model=LiveRoomDetail)
async def create_live_room(
    payload: CreateLiveRoomRequest,
    request: Request,
    authorization: Optional[str] = Header(None, alias="Authorization"),
):
    """
    Authoritatively creates a new live voice/video room in MongoDB live_rooms collection.
    Creator is set as host.
    """
    email, user_id = _extract_auth_user(request, authorization)
    _apply_live_rate_limit(_live_create_rate_tracker, user_id, max_requests=6, window_seconds=60, action_name="room creations")

    user_doc = await db.users.find_one({"email": email})
    host_name = user_doc.get("name") if user_doc and user_doc.get("name") else "Host"

    room_id = f"room_live_{secrets.token_hex(6)}"
    now_iso = datetime.utcnow().isoformat()

    host_participant = {
        "user_id": user_id,
        "name": host_name,
        "role": "host",
        "joined_at": now_iso,
        "is_muted": False,
        "is_cam_on": False,
    }

    room_doc = {
        "room_id": room_id,
        "title": payload.title.strip(),
        "topic": payload.topic.strip(),
        "description": (payload.description or "").strip(),
        "max_participants": payload.max_participants,
        "host_id": user_id,
        "host_name": host_name,
        "host_email": email,
        "status": "active",
        "created_at": now_iso,
        "participants": [host_participant],
        "participant_count": 1,
        "kicked_user_ids": [],
    }

    await db.live_rooms.insert_one(room_doc)

    # Track user activity stats
    await db.users.update_one(
        {"email": email},
        {
            "$inc": {"live_rooms_created": 1, "live_rooms_joined": 1},
            "$addToSet": {"created_room_ids": room_id},
        },
    )

    return LiveRoomDetail(
        room_id=room_id,
        title=room_doc["title"],
        topic=room_doc["topic"],
        description=room_doc["description"],
        host_id=user_id,
        host_name=host_name,
        max_participants=room_doc["max_participants"],
        participant_count=1,
        is_host=True,
        created_at=now_iso,
        status="active",
        participants=[LiveRoomParticipant(**host_participant)],
        is_user_joined=True,
        my_role="host",
    )


@router.get("/rooms", response_model=LiveRoomsResponse)
async def get_live_rooms(
    request: Request,
    topic: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=50),
    authorization: Optional[str] = Header(None, alias="Authorization"),
):
    """
    Returns active live rooms with topic filtering, search, pagination, and participant counts.
    """
    await _ensure_seed_rooms()

    # Identify caller if logged in
    caller_id = None
    try:
        _, caller_id = _extract_auth_user(request, authorization)
    except Exception:
        pass

    query_filter: Dict[str, object] = {"status": "active"}

    if topic and topic.strip() and topic.strip().lower() != "all":
        query_filter["topic"] = {"$regex": f"^{re.escape(topic.strip())}$", "$options": "i"}

    if search and search.strip():
        term = re.escape(search.strip())
        query_filter["$or"] = [
            {"title": {"$regex": term, "$options": "i"}},
            {"host_name": {"$regex": term, "$options": "i"}},
            {"topic": {"$regex": term, "$options": "i"}},
        ]

    total = await db.live_rooms.count_documents(query_filter)
    skip = (page - 1) * limit

    cursor = db.live_rooms.find(query_filter).sort("created_at", -1).skip(skip).limit(limit)
    room_docs = await cursor.to_list(length=limit)

    summaries: List[LiveRoomSummary] = []
    for doc in room_docs:
        part_count = len(doc.get("participants", []))
        summaries.append(
            LiveRoomSummary(
                room_id=doc["room_id"],
                title=doc["title"],
                topic=doc["topic"],
                description=doc.get("description", ""),
                host_id=doc["host_id"],
                host_name=doc.get("host_name", "Host"),
                max_participants=doc.get("max_participants", 12),
                participant_count=part_count,
                is_host=bool(caller_id and doc["host_id"] == caller_id),
                created_at=doc.get("created_at", ""),
                status=doc.get("status", "active"),
            )
        )

    return LiveRoomsResponse(
        rooms=summaries,
        total=total,
        page=page,
        limit=limit,
    )


@router.get("/rooms/{room_id}", response_model=LiveRoomDetail)
async def get_live_room_detail(
    room_id: str,
    request: Request,
    authorization: Optional[str] = Header(None, alias="Authorization"),
):
    """
    Fetches real-time detail of a specific room, including participant list and caller's role.
    """
    await _ensure_seed_rooms()

    caller_id = None
    try:
        _, caller_id = _extract_auth_user(request, authorization)
    except Exception:
        pass

    room = await db.live_rooms.find_one({"room_id": room_id})
    if not room or room.get("status") != "active":
        raise HTTPException(status_code=404, detail="Room not found or has ended.")

    participants_data = room.get("participants", [])
    participants = [
        LiveRoomParticipant(
            user_id=p.get("user_id", ""),
            name=p.get("name", "User"),
            role=p.get("role", "listener"),
            joined_at=p.get("joined_at", ""),
            is_muted=p.get("is_muted", False),
            is_cam_on=p.get("is_cam_on", False),
        )
        for p in participants_data
    ]

    is_host = bool(caller_id and room.get("host_id") == caller_id)
    my_part = next((p for p in participants if p.user_id == caller_id), None)
    my_role = my_part.role if my_part else ("host" if is_host else None)

    return LiveRoomDetail(
        room_id=room["room_id"],
        title=room["title"],
        topic=room["topic"],
        description=room.get("description", ""),
        host_id=room["host_id"],
        host_name=room.get("host_name", "Host"),
        max_participants=room.get("max_participants", 12),
        participant_count=len(participants),
        is_host=is_host,
        created_at=room.get("created_at", ""),
        status=room.get("status", "active"),
        participants=participants,
        is_user_joined=my_part is not None,
        my_role=my_role,
    )


@router.post("/rooms/{room_id}/join", response_model=JoinLiveRoomResponse)
async def join_live_room(
    room_id: str,
    request: Request,
    authorization: Optional[str] = Header(None, alias="Authorization"),
):
    """
    Authoritatively checks capacity, membership, and joins the user to the live room.
    """
    email, user_id = _extract_auth_user(request, authorization)
    _apply_live_rate_limit(_live_join_rate_tracker, user_id, max_requests=10, window_seconds=30, action_name="join requests")

    room = await db.live_rooms.find_one({"room_id": room_id})
    if not room or room.get("status") != "active":
        raise HTTPException(status_code=404, detail="Room not found or has already ended.")

    # Check if user was kicked
    kicked_list = room.get("kicked_user_ids", [])
    if user_id in kicked_list:
        raise HTTPException(
            status_code=403,
            detail="You were removed from this room by the host and cannot rejoin.",
        )

    participants = room.get("participants", [])
    existing = next((p for p in participants if p.get("user_id") == user_id), None)

    max_p = room.get("max_participants", 12)
    if not existing and len(participants) >= max_p:
        raise HTTPException(
            status_code=400,
            detail=f"Room is full (maximum capacity {max_p} participants reached).",
        )

    user_doc = await db.users.find_one({"email": email})
    user_name = user_doc.get("name") if user_doc and user_doc.get("name") else "Participant"

    is_host = room.get("host_id") == user_id
    role = "host" if is_host else "speaker"

    if not existing:
        now_iso = datetime.utcnow().isoformat()
        new_part = {
            "user_id": user_id,
            "name": user_name,
            "role": role,
            "joined_at": now_iso,
            "is_muted": False,
            "is_cam_on": False,
        }
        await db.live_rooms.update_one(
            {"room_id": room_id},
            {
                "$push": {"participants": new_part},
                "$inc": {"participant_count": 1},
            },
        )
        participants.append(new_part)

    # Track user participation in db.users
    await db.users.update_one(
        {"email": email},
        {
            "$inc": {"live_rooms_joined": 1},
            "$addToSet": {"joined_room_ids": room_id},
        },
    )

    updated_room = await db.live_rooms.find_one({"room_id": room_id})
    updated_parts = [
        LiveRoomParticipant(
            user_id=p.get("user_id", ""),
            name=p.get("name", "User"),
            role=p.get("role", "listener"),
            joined_at=p.get("joined_at", ""),
            is_muted=p.get("is_muted", False),
            is_cam_on=p.get("is_cam_on", False),
        )
        for p in updated_room.get("participants", [])
    ]

    return JoinLiveRoomResponse(
        success=True,
        my_role=role if not existing else existing.get("role", role),
        room=LiveRoomDetail(
            room_id=room_id,
            title=updated_room["title"],
            topic=updated_room["topic"],
            description=updated_room.get("description", ""),
            host_id=updated_room["host_id"],
            host_name=updated_room.get("host_name", "Host"),
            max_participants=updated_room.get("max_participants", 12),
            participant_count=len(updated_parts),
            is_host=is_host,
            created_at=updated_room.get("created_at", ""),
            status=updated_room.get("status", "active"),
            participants=updated_parts,
            is_user_joined=True,
            my_role=role,
        ),
        message="Joined room successfully",
    )


@router.post("/zego/token", response_model=LiveZegoTokenResponse)
async def get_live_zego_token(
    body: LiveZegoTokenRequest,
    request: Request,
    authorization: Optional[str] = Header(None, alias="Authorization"),
):
    """
    Securely generates short-lived ZegoCloud Token04 using backend-stored AES-GCM encryption.
    Credentials and AppSign remain completely secret on the server.
    """
    email, user_id = _extract_auth_user(request, authorization)
    _apply_live_rate_limit(_live_token_rate_tracker, user_id, max_requests=12, window_seconds=60, action_name="token requests")

    # Authorize room
    room = await db.live_rooms.find_one({"room_id": body.room_id})
    if not room or room.get("status") != "active":
        raise HTTPException(status_code=404, detail="Room is not active or does not exist.")

    if user_id in room.get("kicked_user_ids", []):
        raise HTTPException(status_code=403, detail="User is banned from this room.")

    user_doc = await db.users.find_one({"email": email})
    user_name = user_doc.get("name") if user_doc and user_doc.get("name") else "Me"

    try:
        app_id = get_app_id()
        token = generate_zego_token(user_id=user_id, room_id=body.room_id)
        return LiveZegoTokenResponse(
            app_id=app_id,
            user_id=user_id,
            user_name=user_name,
            token=token,
            expires_in=TOKEN_TTL_SECONDS,
            room_id=body.room_id,
        )
    except RuntimeError as re_err:
        raise HTTPException(status_code=500, detail=str(re_err))
    except Exception:
        raise HTTPException(status_code=500, detail="Voice service token generation failed.")


@router.post("/rooms/{room_id}/leave")
async def leave_live_room(
    room_id: str,
    request: Request,
    authorization: Optional[str] = Header(None, alias="Authorization"),
):
    """
    Removes user from live room participants. If host leaves and terminates, status is updated.
    """
    _, user_id = _extract_auth_user(request, authorization)

    room = await db.live_rooms.find_one({"room_id": room_id})
    if not room:
        return {"success": True, "message": "Room already inactive."}

    # If room is active, remove participant
    await db.live_rooms.update_one(
        {"room_id": room_id},
        {
            "$pull": {"participants": {"user_id": user_id}},
            "$inc": {"participant_count": -1},
        },
    )

    # Prevent negative participant counts
    await db.live_rooms.update_one(
        {"room_id": room_id, "participant_count": {"$lt": 0}},
        {"$set": {"participant_count": 0}},
    )

    return {"success": True, "message": "Left room successfully."}


@router.post("/rooms/{room_id}/end")
async def end_live_room(
    room_id: str,
    request: Request,
    authorization: Optional[str] = Header(None, alias="Authorization"),
):
    """
    Host-only endpoint to terminate a room, updating MongoDB status authoritatively.
    """
    email, user_id = _extract_auth_user(request, authorization)

    room = await db.live_rooms.find_one({"room_id": room_id})
    if not room:
        raise HTTPException(status_code=404, detail="Room not found.")

    # Server-side validation of host privileges
    if room.get("host_id") != user_id and room.get("host_email") != email:
        raise HTTPException(
            status_code=403,
            detail="Forbidden: Only the room host can terminate this room.",
        )

    await db.live_rooms.update_one(
        {"room_id": room_id},
        {
            "$set": {
                "status": "ended",
                "ended_at": datetime.utcnow().isoformat(),
                "participant_count": 0,
            }
        },
    )

    return {"success": True, "message": "Room ended successfully."}


@router.post("/rooms/{room_id}/kick")
async def kick_live_participant(
    room_id: str,
    payload: KickParticipantRequest,
    request: Request,
    authorization: Optional[str] = Header(None, alias="Authorization"),
):
    """
    Host-only authoritative participant removal endpoint.
    """
    email, user_id = _extract_auth_user(request, authorization)

    room = await db.live_rooms.find_one({"room_id": room_id})
    if not room or room.get("status") != "active":
        raise HTTPException(status_code=404, detail="Active room not found.")

    if room.get("host_id") != user_id and room.get("host_email") != email:
        raise HTTPException(
            status_code=403,
            detail="Forbidden: Only the room host can remove participants.",
        )

    if payload.target_user_id == room.get("host_id"):
        raise HTTPException(status_code=400, detail="Cannot remove the host.")

    await db.live_rooms.update_one(
        {"room_id": room_id},
        {
            "$pull": {"participants": {"user_id": payload.target_user_id}},
            "$addToSet": {"kicked_user_ids": payload.target_user_id},
            "$inc": {"participant_count": -1},
        },
    )

    await db.live_rooms.update_one(
        {"room_id": room_id, "participant_count": {"$lt": 0}},
        {"$set": {"participant_count": 0}},
    )

    return {"success": True, "message": "Participant removed."}


@router.post("/rooms/{room_id}/participant-state")
async def update_participant_state(
    room_id: str,
    payload: ParticipantStateRequest,
    request: Request,
    authorization: Optional[str] = Header(None, alias="Authorization"),
):
    """
    Updates local participant media state (mic/cam/role) in room document.
    """
    _, user_id = _extract_auth_user(request, authorization)

    update_fields: Dict[str, object] = {}
    if payload.is_muted is not None:
        update_fields["participants.$.is_muted"] = payload.is_muted
    if payload.is_cam_on is not None:
        update_fields["participants.$.is_cam_on"] = payload.is_cam_on
    if payload.role in ("speaker", "listener"):
        update_fields["participants.$.role"] = payload.role

    if update_fields:
        await db.live_rooms.update_one(
            {"room_id": room_id, "participants.user_id": user_id},
            {"$set": update_fields},
        )

    return {"success": True}
