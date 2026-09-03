## 1. Example Environment Files (KAN-91)

- [x] 1.1 Add `backend/.env.example` documenting `DATABASE_URL`, `ENVIRONMENT`, and `CORS_ORIGINS` with local-dev placeholder values
- [x] 1.2 Add `frontend/.env.example` documenting `VITE_API_BASE_URL` with a local-dev placeholder value
- [x] 1.3 Verify copying each `.env.example` to `.env` unmodified results in a working local setup (backend starts, frontend dev server starts)

## 2. Backend Settings via pydantic-settings (KAN-97)

- [x] 2.1 Add `pydantic-settings` to `backend/requirements.txt`
- [x] 2.2 Rewrite `backend/core/config.py` as a `pydantic-settings` `BaseSettings` subclass with typed fields for `database_url`, `environment`, and `cors_origins` (parsed from a comma-separated `CORS_ORIGINS` env var into `list[str]`), loading from a `.env` file via `model_config`
- [x] 2.3 Verify `settings.database_url` still works unchanged for `backend/core/database.py` and `backend/alembic/env.py` (no other files need to change)
- [x] 2.4 Verify the backend fails to start with a clear validation error when a required setting is invalid (e.g. malformed `CORS_ORIGINS`)

## 3. Frontend Vite Environment Variables (KAN-97)

- [x] 3.1 Add a `frontend/src/config/env.ts` module reading `import.meta.env.VITE_API_BASE_URL` with a local-dev default (`http://localhost:8000`)
- [x] 3.2 Add/confirm a `vite-env.d.ts` (or extend the existing Vite client types) declaring `VITE_API_BASE_URL` for TypeScript
- [x] 3.3 Wire `frontend/src/api/index.ts` to use `frontend/src/config/env.ts` for the backend base URL instead of a hardcoded value
- [x] 3.4 Verify the frontend dev server starts and resolves the configured API base URL both with and without `VITE_API_BASE_URL` set

## 4. FastAPI CORS (KAN-101)

- [x] 4.1 Add `CORSMiddleware` to `backend/main.py`, configured from `settings.cors_origins`
- [x] 4.2 Set the default `CORS_ORIGINS` value (in settings and `.env.example`) to the local Vite dev server origin (`http://localhost:5173`)
- [x] 4.3 Verify a request from the local frontend dev server origin succeeds with CORS headers permitting it
- [x] 4.4 Verify a request from an origin not in `CORS_ORIGINS` is rejected by CORS

## 5. Verify Secrets Excluded from Git (KAN-105)

- [x] 5.1 Confirm `.gitignore`'s existing `.env` / `.env.local` / `.env.*.local` patterns cover `backend/.env` and `frontend/.env` (create a local `backend/.env` and `frontend/.env` and confirm `git status` does not list them)
- [x] 5.2 Run `git log --all --full-history -- '**/.env'` (and equivalent for any other secret-bearing filenames) to confirm no real `.env` file was ever committed
- [x] 5.3 Document the `.env.example` → `.env` setup step for both apps in `README.md`
