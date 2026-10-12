import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

# .env file se variables load karein
load_dotenv()

MONGO_URI = os.getenv("MONGO_URI") or os.getenv("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "acuspeak")

client = AsyncIOMotorClient(MONGO_URI)
# Access the configured database
db = client[DB_NAME]

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
