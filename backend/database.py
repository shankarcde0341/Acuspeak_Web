import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

# .env file se variables load karein
load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")

client = AsyncIOMotorClient(MONGO_URI)
# Default database jo URI mein mention hai use access karein
db = client["acuspeak"]

"""
MongoDB Collections & Fields Reference:

Collection: users
- email: str (unique)
- name: str
- password: str (hashed)
- provider: str ("email" | "google" | "phone")
- google_id: str | None
- phone: str | None
- created_at: str (ISO)
- updated_at: str (ISO)
- matchmaking_status: str ("idle" | "searching" | "in_call") [default: "idle"]
- matchmaking_room_id: str | None
- matchmaking_started_at: datetime | None
"""
