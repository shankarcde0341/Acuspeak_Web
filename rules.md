# AI Agent Rules

These rules must be read and followed by every AI agent before modifying or executing anything in this repository.

## 1. Security & Environment Isolation

* **Never expose secrets to the frontend.** MongoDB URI, DB credentials, JWT secrets, API keys, Stripe/Firebase/OpenAI/etc. keys must remain in the FastAPI backend `.env`.
* Frontend may use only explicitly exposed public configuration such as the backend API URL.
* Browser → FastAPI API → MongoDB. **Frontend must never connect directly to MongoDB.**
* Access secrets only through server-side environment variables (`os.environ` / `os.getenv`).
* Never commit `.env`, credentials, tokens, or private keys.
* Before adding a dependency, check whether the task can be solved with existing code or standard TypeScript/Python. Avoid dependency bloat.

## 2. API & Backend Security

* FastAPI is the authoritative backend for authentication, authorization, business logic, XP, streaks, user data and database operations.
* Every API endpoint must validate authentication and authorization where required.
* Validate all incoming request data using **Pydantic models**. Never trust client input.
* Apply rate limiting to sensitive/high-abuse endpoints such as authentication, OTP, profile updates, speaking rooms and public APIs.
* Never trust frontend-calculated XP, levels, streaks, permissions or other security-sensitive values.
* Use proper CORS configuration. Do not use unrestricted `*` in production when credentials are involved.

## 3. Database Rules

* MongoDB must be accessed **only from the FastAPI backend**.
* Keep database connection/configuration in server-side code.
* Use clear schemas/models and validate data before database operations.
* Do not expose MongoDB errors, queries, connection details or internal database structure to the frontend.
* Avoid unnecessary schema changes. Any database/schema migration or structural change requires explicit user confirmation before implementation.

## 4. Error Handling & Logging

* Never expose raw Python/FastAPI/MongoDB stack traces to users.
* Return safe, structured API error responses.
* Do not log passwords, OTPs, tokens, API keys, MongoDB credentials or sensitive personal data.
* Use Python's structured logging or the project's existing logging/monitoring system instead of debug `print()` statements in production code.
* Frontend must handle loading, error, empty and offline states gracefully.
* Use React Error Boundaries for unexpected client-side crashes.

## 5. Frontend Architecture

* Keep server-only logic, secrets and database code completely outside the client bundle.
* Use TypeScript strictly. Avoid `any`; define proper interfaces/types.
* Keep API calls inside a clear API/service layer rather than scattering raw requests throughout UI components.
* Use client-side code only where interactivity/browser APIs require it.
* Do not duplicate backend business logic in the frontend.
* Do not expose internal backend routes, file structure or implementation details unnecessarily.

## 6. Live Voice Rooms

* Room creation, access, permissions and participant authorization must be validated by the backend.
* Never trust client-provided room permissions or host status.
* Signaling/authentication tokens must be short-lived and securely issued by the backend.
* Use encrypted transport and the security mechanisms provided by the selected WebRTC/voice provider.
* Rate-limit room creation, joining and related abuse-prone actions.
* Do not store raw voice recordings unless explicitly required by the product specification.

## 7. Authentication & Authorization

* Authentication must be handled through the backend.
* Passwords/credentials must never be stored in plaintext.
* Authorization must be checked server-side for every protected resource.
* Frontend route protection is only a UX layer; it is **not** a security boundary.
* Session/JWT/token handling must follow secure storage and expiration practices appropriate to the web platform.

## 8. AI Agent Coding Rules

* Do not guess business logic. Inspect existing code, `prd.md`, architecture and related documentation first.
* Do not unnecessarily modify unrelated files or functionality.
* Keep implementations simple and maintainable.
* Write comments only for non-obvious logic.
* Preserve existing API contracts unless a change is explicitly required.
* Before changing security middleware, authentication flow or database structure, ask for explicit user confirmation.
* After meaningful changes, run the relevant type checks, linting and tests where available.
* After succesfull changes update `memory.md` Change Log describing the change.

## 9. Production Safety

* Development-only debugging code, test credentials and temporary bypasses must not reach production.
* Do not disable authentication, authorization, CORS, validation, rate limiting or security checks to make an issue "work".
* Production configuration must come from environment variables/secrets management.
* Dependencies must be reviewed before installation and kept updated when security fixes are required.

## 10. Documentation & Change Tracking

* This file must remain at the repository root as `rules.md`.
* AI agents must read this file before making repository changes.
* When rules are changed, update this file in-place.
* Add a dated entry to `memory.md` Change Log describing the rule change.
* When architecture, API contracts or security behavior changes, update the relevant project documentation.

## Core Principle

**Security first, backend authoritative, minimal dependencies, strict validation, clear frontend/backend separation, and no guessing by AI agents.**
