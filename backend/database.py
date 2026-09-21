import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

# .env file se variables load karein
load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")

client = AsyncIOMotorClient(MONGO_URI)
# Default database jo URI mein mention hai use access karein
db = client["acuspeak_db"]