# Acuspeak — Memory & Change Log

## Change Log

### [2026-09-20]
- Added 5 approved call screen tokens (`--on-dark-fill`, `--on-dark-border`, `--on-dark-text`, `--on-dark-accent`, `--backdrop`) to [`src/app/globals.css`](file:///c:/PRACTICE/Acuspeak/Acuspeak_web/src/app/globals.css) and [`design.md`](file:///c:/PRACTICE/Acuspeak/Acuspeak_web/design.md).
- Created call data helper [`src/lib/call.ts`](file:///c:/PRACTICE/Acuspeak/Acuspeak_web/src/lib/call.ts) with typed stubs (`getMatchedPartner`, `endCallSession`, `submitCallFeedback`, `logCall`, `reportUser`, `blockUser`, `sendFriendRequest`).
- Implemented Practice entry page [`src/app/(dashboard)/practice/page.tsx`](file:///c:/PRACTICE/Acuspeak/Acuspeak_web/src/app/%28dashboard%29/practice/page.tsx) with matched partner card, initial avatar, online badge, and "Start call" link.
- Created standalone route group `(call)` page [`src/app/(call)/practice/call/page.tsx`](file:///c:/PRACTICE/Acuspeak/Acuspeak_web/src/app/%28call%29/practice/call/page.tsx) without dashboard navbar, with search parameter sanitization and redirect fallback.
- Built interactive client call components [`CallScreen.tsx`](file:///c:/PRACTICE/Acuspeak/Acuspeak_web/src/components/call/CallScreen.tsx), [`FeedbackModal.tsx`](file:///c:/PRACTICE/Acuspeak/Acuspeak_web/src/components/call/FeedbackModal.tsx), and typed inline SVGs [`icons.tsx`](file:///c:/PRACTICE/Acuspeak/Acuspeak_web/src/components/call/icons.tsx) in `src/components/call/`.
- Created live room data library [`src/lib/rooms.ts`](file:///c:/PRACTICE/Acuspeak/Acuspeak_web/src/lib/rooms.ts) with typed async stubs (`getRooms`, `getRoom`, `leaveRoom`, `endRoom`, `removeParticipant`).
- Implemented Live Rooms dashboard page [`src/app/(dashboard)/live/page.tsx`](file:///c:/PRACTICE/Acuspeak/Acuspeak_web/src/app/%28dashboard%29/live/page.tsx) with topic chips, live badges, participant counts, and "Join room" / "Enter room" links.
- Implemented standalone route group `(call)` room screen page [`src/app/(call)/live/room/[id]/page.tsx`](file:///c:/PRACTICE/Acuspeak/Acuspeak_web/src/app/%28call%29/live/room/%5Bid%5D/page.tsx) with strict ID validation and dynamic metadata.
- Created live components [`Avatar.tsx`](file:///c:/PRACTICE/Acuspeak/Acuspeak_web/src/components/live/Avatar.tsx), [`RoomScreen.tsx`](file:///c:/PRACTICE/Acuspeak/Acuspeak_web/src/components/live/RoomScreen.tsx), and [`RoomDialog.tsx`](file:///c:/PRACTICE/Acuspeak/Acuspeak_web/src/components/live/RoomDialog.tsx) with ARIA alertdialog, focus management, animations, and dark toolbar state toggles.
- Enhanced Landing Page footer [`src/app/page.tsx`](file:///c:/PRACTICE/Acuspeak/Acuspeak_web/src/app/page.tsx) with brand description, live system status pill, product & track navigation links, support details, contact info, and copyright bar.
- Resolved browser font preload warnings by configuring `display: 'swap'` and `preload: false` on `Outfit` and `Manrope` Google font definitions in [`src/app/layout.tsx`](file:///c:/PRACTICE/Acuspeak/Acuspeak_web/src/app/layout.tsx).
- Resolved CSS Layer-Conflict Bug in [`src/app/globals.css`](file:///c:/PRACTICE/Acuspeak/Acuspeak_web/src/app/globals.css): Removed unlayered `* { margin: 0; padding: 0; }` reset and wrapped bare element styles (`html`, `body`, `h1, h2, h3, .brand`, `a`) inside `@layer base { ... }` so Tailwind v4 `@layer utilities` take precedence without being overridden by unlayered rules.
- Cleared `.next` build cache and verified TypeScript compilation (`npx tsc --noEmit`) and Next.js production build (`npm run build`) with 0 errors.
- Adjusted Landing Page footer [`src/app/page.tsx`](file:///c:/PRACTICE/Acuspeak/Acuspeak_web/src/app/page.tsx): Moved Privacy Policy, Terms of Service, and Cookie Settings into an upper footer grid column (`Legal & Policies`), and centered the copyright bar in the bottom section.

### [2026-09-21]
- Created frontend authentication service [`src/services/authService.ts`](file:///c:/PRACTICE/Acuspeak/Acuspeak_web/src/services/authService.ts) to interface with FastAPI backend `/api/login` endpoint.
- Restored requested Login UI layout in [`src/app/login/page.tsx`](file:///c:/PRACTICE/Acuspeak/Acuspeak_web/src/app/login/page.tsx) with picker modes (`picker`, `phone-enter`, `phone-otp`), Google login, and Phone OTP flows, seamlessly incorporating Email/Password authentication for backend `/api/login`.
- Implemented secure backend-authoritative Google OAuth 2.0 system in [`backend/auth.py`](file:///c:/PRACTICE/Acuspeak/Acuspeak_web/backend/auth.py) and [`backend/main.py`](file:///c:/PRACTICE/Acuspeak/Acuspeak_web/backend/main.py) with `GOOGLE_CLIENT_SECRET` isolation in `backend/.env`, `httpx` token exchange, Google UserInfo fetching, Pydantic validation, MongoDB `db.users` upsert operations, rate limiting, and safe structured error redirection.
- Added frontend callback route [`src/app/auth/callback/page.tsx`](file:///c:/PRACTICE/Acuspeak/Acuspeak_web/src/app/auth/callback/page.tsx) to store non-sensitive user state in `localStorage` and redirect to `/dashboard`.
- Implemented modular, backend-authoritative Phone OTP System: created [`backend/otp_service.py`](file:///c:/PRACTICE/Acuspeak/Acuspeak_web/backend/otp_service.py) with abstract `BaseOTPProvider` (`MockOTPProvider`, `TwilioOTPProvider` stub) and SHA-256 OTP hashing; added Pydantic models `PhoneSendOTPRequest` and `PhoneVerifyOTPRequest`, 5-minute TTL storage in MongoDB `db.otps`, max 3-attempt lockouts, phone/IP rate limiting, `/api/auth/phone/send-otp` and `/api/auth/phone/verify-otp` endpoints in [`backend/main.py`](file:///c:/PRACTICE/Acuspeak/Acuspeak_web/backend/main.py), and service helpers in [`src/services/authService.ts`](file:///c:/PRACTICE/Acuspeak/Acuspeak_web/src/services/authService.ts).
- Verified Python backend compilation and TypeScript compilation (`npx tsc --noEmit`) with 0 errors.







