import base64, json, os, random, struct, time
from dotenv import load_dotenv
from Crypto.Cipher import AES

load_dotenv()
TOKEN_TTL_SECONDS = 3600

def _get_config() -> tuple[int, str]:
    app_id = os.getenv("ZEGO_APP_ID")
    secret = os.getenv("ZEGO_SERVER_SECRET")
    if not app_id or not app_id.isdigit() or not secret or len(secret) != 32:
        raise RuntimeError("Zego configuration is invalid")
    return int(app_id), secret

def get_app_id() -> int:
    return _get_config()[0]

def generate_zego_token(user_id: str, room_id: str | None = None, ttl_seconds: int = TOKEN_TTL_SECONDS) -> str:
    app_id, secret = _get_config()
    now = int(time.time())
    expire = now + ttl_seconds
    payload = {
        "app_id": app_id, "user_id": user_id,
        "nonce": random.randint(-(2**31), 2**31 - 1),
        "ctime": now, "expire": expire,
        "payload": json.dumps(
            {"room_id": room_id, "privilege": {"1": 1, "2": 1}, "stream_id_list": None},
            separators=(",", ":"),
        ) if room_id else "",
    }
    plain = json.dumps(payload, separators=(",", ":"), ensure_ascii=False).encode()
    iv = os.urandom(12)
    cipher = AES.new(secret.encode(), AES.MODE_GCM, iv)
    encrypted, tag = cipher.encrypt_and_digest(plain)
    encrypted += tag
    buf = struct.pack("!q", expire)
    buf += struct.pack("!h", len(iv)) + iv
    buf += struct.pack("!h", len(encrypted)) + encrypted
    buf += struct.pack("!b", 1)
    return "04" + base64.b64encode(buf).decode()