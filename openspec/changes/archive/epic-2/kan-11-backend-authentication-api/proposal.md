## Why

The backend has no authentication: `backend/models`, `backend/schemas`, `backend/routers`, and `backend/services` are all empty scaffolding (from KAN-10), and there is no `User` table, no password hashing, no JWT issuance, and no way for a client to identify itself to the API. This blocks every future feature that needs to know who is calling it (e.g. per-user portfolios/watchlists). KAN-11 ("Backend Authentication API") covers this, tracked as five Jira subtasks: KAN-23 (User model + schemas), KAN-24 (password hashing), KAN-26 (register/login endpoints issuing JWTs), KAN-30 (JWT validation dependency + `GET /auth/me`), and KAN-33 (auth tests).

## What Changes

- Add a `User` SQLAlchemy model (`backend/models/user.py`) with `id`, `email` (unique), `hashed_password`, `created_at`, and a corresponding Alembic migration (KAN-23).
- Add Pydantic request/response schemas (`backend/schemas/auth.py`): `UserCreate`/`UserLogin` (request) and `UserRead`/`Token` (response), ensuring `hashed_password` is never serialized out (KAN-23).
- Add a password hashing service (`backend/services/security.py`) using `passlib[bcrypt]` with `hash_password`/`verify_password` helpers (KAN-24).
- Add JWT helpers (`backend/services/security.py`) using `python-jose` to create and decode signed access tokens, with a new `SECRET_KEY`/`ALGORITHM`/`ACCESS_TOKEN_EXPIRE_MINUTES` settings on `backend/core/config.py` (KAN-26).
- Add an auth service (`backend/services/auth.py`) and router (`backend/routers/auth.py`) implementing `POST /auth/register` (create user, hash password, return `UserRead`) and `POST /auth/login` (verify credentials, issue JWT `Token`), wired into `backend/main.py` (KAN-26).
- Add a `get_current_user` FastAPI dependency (`backend/routers/auth.py` or `backend/core/security.py`) that validates the JWT from the `Authorization: Bearer` header and loads the corresponding `User`, and a protected `GET /auth/me` endpoint returning the caller's `UserRead` (KAN-30).
- Add unit tests for the password hashing and JWT helpers, and integration tests for `POST /auth/register`, `POST /auth/login` (success + wrong-password), and `GET /auth/me` (with and without a valid token), using FastAPI's `TestClient` (KAN-33).

## Capabilities

### New Capabilities
- `backend-authentication`: User registration, login, JWT issuance/validation, and an authenticated "current user" endpoint for the FastAPI backend.

### Modified Capabilities
(none — this introduces a new capability; it does not change the behavior of `environment-configuration` or `database`, though it adds new settings fields and a new table/migration within those existing mechanisms)

## Impact

- Affected code: new `backend/models/user.py`, new `backend/schemas/auth.py`, new `backend/services/security.py`, new `backend/services/auth.py`, new `backend/routers/auth.py`, new Alembic migration under `backend/alembic/versions/`; modified `backend/core/config.py` (add JWT settings), `backend/main.py` (include auth router), `backend/requirements.txt`/`backend/pyproject.toml` (add `passlib[bcrypt]`, `python-jose[cryptography]`), `backend/.env.example` (document `SECRET_KEY`, `ALGORITHM`, `ACCESS_TOKEN_EXPIRE_MINUTES`).
- Dependencies introduced: `passlib[bcrypt]` (password hashing), `python-jose[cryptography]` (JWT).
- New database table: `users` (via a new Alembic migration on top of the existing `ed604e348284_baseline` migration).
- No changes to existing `database` or `environment-configuration` requirements — only additive settings and a new table.
