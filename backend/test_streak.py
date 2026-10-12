import unittest
from datetime import datetime, date, timedelta
from unittest.mock import AsyncMock, patch

from main import compute_updated_streak, touch_user_streak


class TestStreakDynamics(unittest.TestCase):
    def test_first_time_activity_initialization(self):
        """Rule 1: First activity sets last_active_date to today, preserves min 1 streak."""
        now = datetime(2026, 10, 12, 10, 0, 0)
        streak, today_str, needs_update = compute_updated_streak(
            current_streak=None,
            last_active_date_str=None,
            streak_protection=False,
            now=now
        )
        self.assertEqual(streak, 1)
        self.assertEqual(today_str, "2026-10-12")
        self.assertTrue(needs_update)

    def test_existing_user_first_migration_preserves_streak(self):
        """Preserves existing streak value for legacy users on initial calculation."""
        now = datetime(2026, 10, 12, 12, 0, 0)
        streak, today_str, needs_update = compute_updated_streak(
            current_streak=7,
            last_active_date_str=None,
            streak_protection=False,
            now=now
        )
        self.assertEqual(streak, 7)
        self.assertEqual(today_str, "2026-10-12")
        self.assertTrue(needs_update)

    def test_same_day_activity_no_change(self):
        """Rule 2: Repeated activities on the same calendar day keep streak unchanged without extra DB writes."""
        now = datetime(2026, 10, 12, 16, 30, 0)
        streak, today_str, needs_update = compute_updated_streak(
            current_streak=5,
            last_active_date_str="2026-10-12",
            streak_protection=False,
            now=now
        )
        self.assertEqual(streak, 5)
        self.assertEqual(today_str, "2026-10-12")
        self.assertFalse(needs_update)

    def test_consecutive_day_increments_streak(self):
        """Rule 3: Activity on the next consecutive calendar day increments streak by 1."""
        now = datetime(2026, 10, 13, 9, 15, 0)
        streak, today_str, needs_update = compute_updated_streak(
            current_streak=3,
            last_active_date_str="2026-10-12",
            streak_protection=False,
            now=now
        )
        self.assertEqual(streak, 4)
        self.assertEqual(today_str, "2026-10-13")
        self.assertTrue(needs_update)

    def test_missed_one_day_resets_without_protection(self):
        """Rule 5: Missing 1 day without streak protection breaks streak, resetting to 1 today."""
        now = datetime(2026, 10, 14, 11, 0, 0)  # Missed Oct 13
        streak, today_str, needs_update = compute_updated_streak(
            current_streak=10,
            last_active_date_str="2026-10-12",
            streak_protection=False,
            now=now
        )
        self.assertEqual(streak, 1)
        self.assertEqual(today_str, "2026-10-14")
        self.assertTrue(needs_update)

    def test_missed_one_day_protected_by_streak_freeze(self):
        """Rule 4: Missing 1 day WITH streak protection preserves streak and increments it."""
        now = datetime(2026, 10, 14, 11, 0, 0)  # Missed Oct 13
        streak, today_str, needs_update = compute_updated_streak(
            current_streak=10,
            last_active_date_str="2026-10-12",
            streak_protection=True,
            now=now
        )
        self.assertEqual(streak, 11)
        self.assertEqual(today_str, "2026-10-14")
        self.assertTrue(needs_update)

    def test_missed_two_or_more_days_resets_even_with_protection(self):
        """Rule 5: Missing 2 or more days exceeds single freeze protection and resets streak to 1."""
        now = datetime(2026, 10, 15, 11, 0, 0)  # Missed Oct 13 and Oct 14
        streak, today_str, needs_update = compute_updated_streak(
            current_streak=10,
            last_active_date_str="2026-10-12",
            streak_protection=True,
            now=now
        )
        self.assertEqual(streak, 1)
        self.assertEqual(today_str, "2026-10-15")
        self.assertTrue(needs_update)

    def test_multi_day_login_sequence(self):
        """Simulates an authentic multi-day user login journey."""
        base_date = datetime(2026, 10, 1, 8, 0, 0)

        # Day 1: New signup
        s1, d1, _ = compute_updated_streak(1, None, now=base_date)
        self.assertEqual(s1, 1)

        # Day 2: Consecutive login
        d2_date = base_date + timedelta(days=1)
        s2, d2, _ = compute_updated_streak(s1, d1, now=d2_date)
        self.assertEqual(s2, 2)

        # Day 3: Consecutive login
        d3_date = base_date + timedelta(days=2)
        s3, d3, _ = compute_updated_streak(s2, d2, now=d3_date)
        self.assertEqual(s3, 3)

        # Day 3 evening: Practice again same day
        s3_again, d3_again, needs_up = compute_updated_streak(s3, d3, now=d3_date + timedelta(hours=6))
        self.assertEqual(s3_again, 3)
        self.assertFalse(needs_up)

        # Day 4: Consecutive login
        d4_date = base_date + timedelta(days=3)
        s4, d4, _ = compute_updated_streak(s3_again, d3_again, now=d4_date)
        self.assertEqual(s4, 4)

        # Day 5: Consecutive login
        d5_date = base_date + timedelta(days=4)
        s5, d5, _ = compute_updated_streak(s4, d4, now=d5_date)
        self.assertEqual(s5, 5)


class TestTouchUserStreakAsync(unittest.IsolatedAsyncioTestCase):
    async def test_touch_user_streak_db_persistence(self):
        user_doc = {
            "_id": "mock_id_123",
            "email": "learner@acuspeak.com",
            "day_streak": 2,
            "last_active_date": (date.today() - timedelta(days=1)).isoformat(),
            "streak_protection": False,
        }

        with patch("motor.motor_asyncio.AsyncIOMotorCollection.update_one", new_callable=AsyncMock) as mock_update:
            new_streak = await touch_user_streak(user_doc)
            self.assertEqual(new_streak, 3)
            self.assertEqual(user_doc["day_streak"], 3)
            self.assertEqual(user_doc["last_active_date"], datetime.utcnow().date().isoformat())
            self.assertTrue(mock_update.called)


if __name__ == "__main__":
    unittest.main()
