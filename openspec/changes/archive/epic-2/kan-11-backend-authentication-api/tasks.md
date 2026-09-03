## 1. User Model and Auth Schemas (KAN-23)

- [x] 1.1 Add `backend/models/user.py` with a `User` SQLAlchemy model (`id`, `email` unique/indexed, `hashed_password`, `created_at`)
- [x] 1.2 Export `User` from `backend/models/__init__.py`
- [x] 1.3 Generate an Alembic migration for the `users` table on top of `ed604e348284_baseline`
- [x] 1.4 Add `backend/schemas/auth.py` with `UserCreate` (email, password), `UserLogin` (email, password), `UserRead` (id, email, created_at), and `Token` (access_token, token_type) Pydantic schemas
- [x] 1.5 Verify `UserRead` never includes `hashed_password`

## 2. Password Hashing (KAN-24)

- [x] 2.1 Add `passlib[bcrypt]` to `backend/requirements.txt`
- [x] 2.2 Add `backend/services/security.py` with a `CryptContext`-based `hash_password(password: str) -> str` and `verify_password(plain: str, hashed: str) -> bool`
- [x] 2.3 Add unit tests verifying a hashed password is not equal to the plaintext, and that `verify_password` accepts the correct password and rejects an incorrect one

## 3. Register and Login Endpoints (KAN-26)

- [x] 3.1 Add `python-jose[cryptography]` to `backend/requirements.txt`
- [x] 3.2 Add `SECRET_KEY` (required), `ALGORITHM` (default `HS256`), and `ACCESS_TOKEN_EXPIRE_MINUTES` (default `30`) fields to `backend/core/config.py`'s `Settings`, and document them in `backend/.env.example`
- [x] 3.3 Add `create_access_token(data: dict) -> str` to `backend/services/security.py`, signing with `settings.secret_key`/`settings.algorithm` and an expiry from `settings.access_token_expire_minutes`
- [x] 3.4 Add `backend/services/auth.py` with `register_user(db, UserCreate) -> User` (rejects duplicate email) and `authenticate_user(db, email, password) -> User | None`
- [x] 3.5 Add `backend/routers/auth.py` with `POST /auth/register` (calls `register_user`, returns `UserRead`, 4xx on duplicate email) and `POST /auth/login` (calls `authenticate_user`, returns `Token`, 401 on invalid credentials)
- [x] 3.6 Include the auth router in `backend/main.py`

## 4. JWT Validation and GET /auth/me (KAN-30)

- [x] 4.1 Add `decode_access_token(token: str) -> dict` to `backend/services/security.py`, raising/returning an error on invalid or expired tokens
- [x] 4.2 Add a `get_current_user` FastAPI dependency in `backend/routers/auth.py` using `OAuth2PasswordBearer`/`HTTPBearer` to extract the token, decode it, and load the matching `User` from the database, raising 401 on any failure (missing/malformed/expired token, or user no longer exists)
- [x] 4.3 Add `GET /auth/me` using the `get_current_user` dependency, returning `UserRead` for the authenticated user

## 5. Authentication Tests (KAN-33)

- [x] 5.1 Add integration tests for `POST /auth/register`: success case, and duplicate-email rejection
- [x] 5.2 Add integration tests for `POST /auth/login`: success case (returns a token), wrong-password rejection, and unknown-email rejection
- [x] 5.3 Add integration tests for `GET /auth/me`: valid-token success, missing-token rejection, and invalid/expired-token rejection
- [x] 5.4 Verify the full test suite passes and no plaintext password or password hash appears in any response body captured by the tests
