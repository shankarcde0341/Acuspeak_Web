import os
import unittest
from unittest.mock import patch
from fastapi.testclient import TestClient

from main import app
from support_routes import _ip_rate_tracker, _email_rate_tracker

client = TestClient(app)


class TestSupportAPI(unittest.TestCase):
    def setUp(self):
        _ip_rate_tracker.clear()
        _email_rate_tracker.clear()

    def test_support_success(self):
        payload = {
            "name": "Test User",
            "email": "testuser@example.com",
            "phone": "+1234567890",
            "message": "Hello! I need help with speaking practice.",
            "website": ""
        }

        with patch("support_routes._send_smtp_email") as mock_smtp:
            response = client.post("/api/support", json=payload)
            self.assertEqual(response.status_code, 200)
            data = response.json()
            self.assertTrue(data["success"])
            self.assertEqual(data["message"], "Your message has been sent successfully.")
            self.assertTrue(mock_smtp.called)

    def test_support_invalid_email(self):
        payload = {
            "name": "Test User",
            "email": "not-an-email",
            "phone": "+1234567890",
            "message": "Hello! I need help with speaking practice."
        }
        response = client.post("/api/support", json=payload)
        self.assertEqual(response.status_code, 422)

    def test_support_short_message(self):
        payload = {
            "name": "Test User",
            "email": "testuser@example.com",
            "message": "Short"
        }
        response = client.post("/api/support", json=payload)
        self.assertEqual(response.status_code, 422)

    def test_support_honeypot_filled(self):
        payload = {
            "name": "Spam Bot",
            "email": "spambot@example.com",
            "message": "Buy cheap products now online!",
            "website": "http://spam-link.com"
        }

        with patch("support_routes._send_smtp_email") as mock_smtp:
            response = client.post("/api/support", json=payload)
            self.assertEqual(response.status_code, 200)
            data = response.json()
            self.assertTrue(data["success"])
            self.assertFalse(mock_smtp.called)

    def test_support_rate_limit(self):
        payload = {
            "name": "Rate Limit User",
            "email": "ratelimit@example.com",
            "message": "Testing rate limiting on support endpoint."
        }

        with patch("support_routes._send_smtp_email"):
            for i in range(3):
                res = client.post("/api/support", json=payload)
                self.assertEqual(res.status_code, 200)

            # 4th request should fail with 429
            res_4th = client.post("/api/support", json=payload)
            self.assertEqual(res_4th.status_code, 429)
            self.assertIn("Too many attempts", res_4th.json()["detail"])

    def test_support_missing_smtp_config(self):
        payload = {
            "name": "Config User",
            "email": "configuser@example.com",
            "message": "Testing missing environment config handling."
        }

        with patch.dict(os.environ, {"SMTP_HOST": ""}):
            response = client.post("/api/support", json=payload)
            self.assertEqual(response.status_code, 503)
            self.assertEqual(response.json()["detail"], "Support is temporarily unavailable")

    def test_support_smtp_failure(self):
        payload = {
            "name": "Failure User",
            "email": "failuser@example.com",
            "message": "Testing SMTP exception handling during email send."
        }

        with patch("support_routes._send_smtp_email", side_effect=Exception("SMTP Connection Refused")):
            response = client.post("/api/support", json=payload)
            self.assertEqual(response.status_code, 502)
            self.assertEqual(response.json()["detail"], "Unable to send email. Please try again later.")


if __name__ == "__main__":
    unittest.main()
