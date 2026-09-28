import os
from dotenv import load_dotenv

load_dotenv()

app_id = os.getenv("ZEGO_APP_ID")
secret = os.getenv("ZEGO_SERVER_SECRET")

print("APP_ID set:", bool(app_id), "| numeric:", bool(app_id and app_id.isdigit()))
print("SECRET set:", bool(secret), "| length:", len(secret) if secret else 0)
