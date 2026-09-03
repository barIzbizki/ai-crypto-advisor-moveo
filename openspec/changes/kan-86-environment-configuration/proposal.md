## Why

The backend currently reads only a single hardcoded-default env var (`DATABASE_URL`) via a bare `Settings` class in `backend/core/config.py`, and the frontend has no environment variable handling at all — `frontend/src/api/index.ts` is an empty placeholder. There's no root-level FastAPI CORS configuration, no frontend `.env.example`, and no backend settings for CORS origins, API keys, or environment name. This blocks any frontend-to-backend integration (the dev server can't call the API without CORS) and leaves future contributors without a documented, typed source of truth for configuration. KAN-86 ("Environment & Configuration") covers this, tracked as four Jira subtasks: KAN-91 (`.env.example` files), KAN-97 (pydantic-settings backend config + Vite frontend env vars), KAN-101 (FastAPI CORS), and KAN-105 (verify secrets stay out of Git).

## What Changes

- Replace the current bare `Settings` class in `backend/core/config.py` with a `pydantic-settings` `BaseSettings` subclass that loads `DATABASE_URL`, `ENVIRONMENT`, and `CORS_ORIGINS` from the environment with typed fields and validation, reading from a `.env` file via `model_config` (KAN-97).
- Add `backend/.env.example` documenting all backend env vars (`DATABASE_URL`, `ENVIRONMENT`, `CORS_ORIGINS`) with local-dev placeholder values, superseding/complementing the existing root `.env.example` (KAN-91).
- Add `frontend/.env.example` documenting `VITE_`-prefixed frontend env vars (`VITE_API_BASE_URL`) with a local-dev placeholder value (KAN-91).
- Add a small typed frontend config module (e.g. `frontend/src/config/env.ts`) that reads `import.meta.env.VITE_API_BASE_URL` (and similar) with a sensible local-dev default, for `frontend/src/api/index.ts` and other frontend code to import instead of reading `import.meta.env` directly (KAN-97).
- Add FastAPI `CORSMiddleware` to `backend/main.py`, configured from the new `Settings.cors_origins` field (parsed from the `CORS_ORIGINS` env var) rather than hardcoded, defaulting to the local Vite dev server origin (KAN-101).
- Verify `.env` (backend and frontend) and any other secret files are excluded from Git via the existing `.gitignore` patterns, and confirm no `.env` file is currently tracked (KAN-105).

## Capabilities

### New Capabilities
- `environment-configuration`: Typed, environment-driven configuration for both backend (pydantic-settings) and frontend (Vite env vars), `.env.example` documentation for each app, FastAPI CORS wired to that configuration, and verification that real `.env` files/secrets are never committed.

### Modified Capabilities
(none — `database` from KAN-43 already owns `DATABASE_URL` itself; this change extends the *settings mechanism* around it but does not change that requirement's behavior)

## Impact

- Affected code: `backend/core/config.py` (rewritten to use `pydantic-settings`), `backend/main.py` (add `CORSMiddleware`), `backend/requirements.txt`/`backend/pyproject.toml` (add `pydantic-settings`), new `backend/.env.example`, new `frontend/.env.example`, new `frontend/src/config/env.ts` (or similar), `frontend/src/api/index.ts` (consumes the new config module).
- Dependencies introduced: `pydantic-settings` (backend). No new frontend dependencies — Vite's built-in `import.meta.env` handling is sufficient.
- No change to `DATABASE_URL`'s value or the `database` capability's behavior — only how it (and new settings) are declared/typed.
- Root `.env.example` (from KAN-43, Postgres/docker-compose vars) is left as-is; `backend/.env.example` is additive for backend-app-level vars.
