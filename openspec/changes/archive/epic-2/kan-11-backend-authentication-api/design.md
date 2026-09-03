## Context

See proposal.md - Why. The backend has FastAPI + SQLAlchemy 2.0 + Alembic already wired up (`backend/core/database.py`, `backend/alembic/`), plus a `pydantic-settings` `Settings` class (`backend/core/config.py`) from KAN-86. `backend/models`, `backend/schemas`, `backend/routers`, `backend/services` exist as empty packages from KAN-10 scaffolding. There is one prior migration, `ed604e348284_baseline`.

## Goals / Non-Goals

**Goals:**
- Add a `users` table and the minimal register/login/me flow needed to identify a caller.
- Reuse the existing settings/database/migration mechanisms rather than introducing new ones.

**Non-Goals:**
- No refresh tokens, token revocation/blacklisting, email verification, or password reset flow — out of scope for KAN-11.
- No role-based access control or scopes — `get_current_user` only proves identity, not authorization.
- No OAuth/social login.

## Decisions

- **Password hashing: `passlib[bcrypt]`.** Widely used with FastAPI, handles salt generation and constant-time comparison internally. Alternative considered: hand-rolled `bcrypt` calls — rejected, `passlib` gives a `CryptContext` that's easy to swap schemes with later.
- **JWT: `python-jose[cryptography]`.** Standard pairing with FastAPI's own security docs; produces/validates HS256-signed tokens. Alternative considered: `PyJWT` — equally valid, `python-jose` chosen only for consistency with FastAPI's reference implementation; no functional requirement favors one over the other.
- **Token transport: OAuth2 password-bearer style, `Authorization: Bearer <token>` header**, via FastAPI's `OAuth2PasswordBearer`/`HTTPBearer` dependency — not cookies. Keeps the API stateless and framework-idiomatic; frontend integration (if any) is out of scope for this change.
- **New settings on `Settings`**: `SECRET_KEY` (required, no default — must fail fast if unset outside tests), `ALGORITHM` (default `HS256`), `ACCESS_TOKEN_EXPIRE_MINUTES` (default `30`). Documented in `backend/.env.example`.
- **`User` model fields**: `id` (PK), `email` (unique, indexed), `hashed_password`, `created_at`. No `updated_at`/`is_active`/etc. — YAGNI until a subtask needs them.
- **Login identifier is email**, not a separate username field — matches the Jira subtask wording ("auth request/response schemas") and avoids a redundant field.
- **New migration on top of `ed604e348284_baseline`** rather than editing the baseline, since the baseline is already applied/archived (KAN-43).

## Risks / Trade-offs

- [`SECRET_KEY` missing or weak in production] → Settings field has no default and pydantic-settings will fail startup if unset; `.env.example` documents it must be a long random value, never the example placeholder, in real deployments.
- [bcrypt has a 72-byte input limit] → Not a practical concern for typical passwords; not mitigated further in this change.
- [No token revocation] → Accepted for this change's scope (30-minute default expiry limits exposure); revocation/refresh tokens are a candidate for a future change.

## Migration Plan

- Add the Alembic migration for the `users` table; apply via the existing `alembic upgrade head` workflow. No data backfill needed (new table, no existing rows). Rollback is a standard `alembic downgrade -1`.
