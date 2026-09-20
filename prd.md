# Acuspeak — Product Requirements Document

**Product:** Acuspeak
**Type:** Spoken English Learning Web App
**Frontend:** TypeScript
**Backend:** Python + FastAPI
**Database:** MongoDB

## 1. Product Goal

Acuspeak ka primary goal users ko **real-world English speaking practice** provide karna hai.

Platform ka focus sirf grammar/vocabulary learning par nahi, balki:

* Speaking confidence
* Fluency
* Practical conversation
* Pronunciation
* Real-world communication

par hona chahiye.

---

## 2. User Authentication & Profile

Users ke liye:

* Registration
* Login / Logout
* User profile
* English proficiency level
* Learning goal
* Profile settings

hona chahiye.

User ki authentication aur authorization backend ke through manage hogi.

---

## 3. Structured English Lessons

Platform mein level-based structured lessons honge:

```text
A1 → A2 → B1 → B2 → C1
```

Lessons mein include ho sakta hai:

* Vocabulary
* Useful phrases
* Example conversations
* Grammar/context explanation
* Practice exercises
* Speaking task
* Quiz

Har lesson completion ke baad progress save aur XP reward hona chahiye.

---

## 4. Real-World Scenario Learning

Learning ka major focus **real-life situations** par hoga.

Examples:

* Restaurant mein order karna
* Airport conversation
* Hotel booking
* Shopping
* Job interview
* Office meeting
* Introducing yourself
* Asking for directions
* Customer support
* Social conversation

User ko scenario ke context mein English bolne ki practice karni hogi.

Typical flow:

```text
Scenario
→ Useful Expressions
→ Example Conversation
→ Guided Practice
→ Role Play
→ Speaking Practice
```

---

## 5. Live Voice Rooms

Users real people ke saath English practice karne ke liye live voice rooms join/create kar sakenge.

Core features:

* Browse rooms
* Create room
* Join/leave room
* Voice communication
* Participant list
* Host controls
* Mute/unmute
* Speaker/listener roles
* Report/block user

Voice functionality ke liye suitable real-time voice provider/WebRTC solution use kiya ja sakta hai.

---

## 6. Speaking Test & Progress

Platform users ko structured speaking tests provide karega.

Test mein:

* Questions
* Speaking prompts
* Real-world scenarios
* Timed responses

ho sakte hain.

Result mein useful speaking indicators dikhaye ja sakte hain:

* Fluency
* Pronunciation
* Vocabulary
* Grammar
* Overall speaking level

Results ke basis par user ko improvement areas aur recommended practice dikhani chahiye.

---

## 7. XP, Levels & Streak

Learning activities ko gamify karne ke liye:

* XP
* User levels
* Daily goals
* Daily streak
* Achievements

use kiye jayenge.

XP activities:

* Lesson completion
* Quiz
* Speaking practice
* Speaking test
* Challenges

XP, streak aur rewards **backend-controlled** hone chahiye; frontend par directly trust nahi karna hai.

---

## 8. Friends, Challenges & Leaderboard

Users social learning kar sakenge.

### Friends

* Search users
* Send request
* Accept/reject request
* Remove friend
* Block user

### Challenges

Examples:

* 7-day speaking challenge
* Vocabulary challenge
* Conversation challenge

### Leaderboard

Users ko activity/XP ke basis par leaderboard dikhaya ja sakta hai:

* Daily
* Weekly
* Monthly
* All-time

---

## 9. Technical Architecture

Basic architecture:

```text
TypeScript Web App
        ↓
   FastAPI REST API
        ↓
      MongoDB
```

Rules:

* Frontend MongoDB se directly connect nahi karega.
* MongoDB credentials sirf backend mein rahenge.
* Backend business logic ka authoritative layer hoga.
* Frontend mein database/API secret keys nahi honi chahiye.
* Frontend aur backend ke beech explicit API contracts use honge.

Future integrations ke liye architecture extensible hona chahiye, jaise:

* AI services
* Voice provider
* Payment provider
* Error monitoring
* Notifications

---

## 10. MVP Priority & Development Principle

### MVP mein priority:

1. Authentication
2. User profile/onboarding
3. Structured lessons
4. Real-world scenarios
5. XP & streak
6. Speaking practice/test
7. Live voice rooms
8. Friends
9. Leaderboard
10. Basic challenges

### Development Principle

AI Agent ko implementation ke time:

* Existing functionality unnecessarily modify nahi karni hai.
* Business logic guess nahi karna hai.
* Backend ko authoritative source maana jayega.
* Secrets frontend mein nahi rakhne hain.
* Har feature ke loading, error aur empty states handle karne hain.
* Unnecessary dependencies add nahi karni hain.
* Ambiguous requirement par existing documentation/code check karke clarification lena hai.

**Core Product Principle:**

> Acuspeak ka primary purpose users ko consistently **real-world English bolne ki practice** karwana hai. Gamification aur social features learning experience ko support karenge, replace nahi.
