## Context

See proposal.md - Why. Relevant constraints: backend is FastAPI on Python 3.12 with dependencies pinned directly in `backend/requirements.txt` (no `pydantic-settings` yet); the existing `backend/core/config.py` `Settings` class only reads `DATABASE_URL` via bare `os.environ.get`. Frontend is Vite + React + TypeScript with no environment variable handling at all yet (`frontend/src/api/index.ts` is an empty placeholder). A root `.env.example` already exists for Postgres/docker-compose vars from KAN-43 and is out of scope here. `.gitignore` already ignores `.env`, `.env.local`, and `.env.*.local` at the repo root, which covers files placed at `backend/.env` and `frontend/.env` too since Git patterns without a leading `/` match at any depth.

## Goals / Non-Goals

**Goals:**
- One conventional place per app (`backend/core/config.py`, a new `frontend/src/config/env.ts`) that all other code imports instead of reading `os.environ` / `import.meta.env` directly.
- CORS origins configurable per environment without editing `backend/main.py`.
- Zero risk of a real secret being committed, verified rather than assumed.

**Non-Goals:**
- Secrets management/vaulting (e.g. AWS Secrets Manager, Vault) — out of scope for local-dev-stage project.
- Per-environment config files (`.env.production`, `.env.staging`) — only local dev is set up now; the mechanism (pydantic-settings, Vite env vars) supports this later without redesign.
- Adding new business-logic settings (API keys for external services, feature flags) beyond what's needed to prove the mechanism — added when the features that need them land.

## Decisions

- **`pydantic-settings` `BaseSettings` for the backend**, replacing the bare `Settings` class. Gives typed fields, validation, and built-in `.env` file loading (`model_config = SettingsConfigDict(env_file=".env")`) instead of hand-rolled `os.environ.get` calls. Alternative considered: keep plain `os.environ` reads — rejected, since KAN-97 explicitly asks for pydantic-settings and it scales better once more settings (API keys, feature flags) are added later.
- **`CORS_ORIGINS` as a single env var holding a comma-separated list**, parsed into `list[str]` by a pydantic field validator. Keeps `.env` files simple (one line) versus requiring JSON-array syntax in an env var. Default value is the local Vite dev server origin (`http://localhost:5173`).
- **Vite's built-in `import.meta.env` with `VITE_`-prefixed vars**, no extra library. Vite already statically replaces these at build time and type-checks them via `vite-env.d.ts`; introducing a runtime env-loading library would be unnecessary for a static SPA build. A thin `frontend/src/config/env.ts` wrapper centralizes the one variable needed now (`VITE_API_BASE_URL`) and its local-dev default (`http://localhost:8000`), so call sites don't reference `import.meta.env` directly.
- **`backend/.env.example` as a new, additive file** (not merged into the existing root `.env.example`), scoped to backend-app-level settings (`DATABASE_URL`, `ENVIRONMENT`, `CORS_ORIGINS`) as distinct from the root file's docker-compose/Postgres-provisioning vars. Keeps each file scoped to what actually reads it, matching the eventual `backend/.env` / `frontend/.env` split pydantic-settings and Vite each expect.
- **KAN-105 verification is a checklist step, not new code**: confirm existing `.gitignore` patterns (`.env`, `.env.local`, `.env.*.local`) already cover `backend/.env` and `frontend/.env`, and run a history check (`git log --all --full-history -- '**/.env'`) to confirm nothing was ever committed. No `.gitignore` change is expected unless the check finds a gap.

## Risks / Trade-offs

- [A comma-separated `CORS_ORIGINS` env var is less expressive than per-environment JSON config] → Acceptable for the current single-environment (local dev) scope; revisit if a staging/prod environment with multiple origins is introduced.
- [Centralizing frontend env access in `frontend/src/config/env.ts` requires developers to remember to import it instead of using `import.meta.env` directly] → Low risk at current codebase size; can be enforced later with an ESLint rule if it becomes a real problem.
- [Rewriting `backend/core/config.py` changes the existing `settings.database_url` access pattern used by KAN-43's `backend/core/database.py`] → Keep the attribute name compatible (`settings.database_url`) so `database.py` and `alembic/env.py` need no changes beyond the import already in place.

## Migration Plan

No production data or deployed environments exist yet, so there is no rollout/rollback in the deploy sense. Rollback of this change is reverting the modified files (`backend/core/config.py`, `backend/main.py`) and removing the new files (`backend/.env.example`, `frontend/.env.example`, `frontend/src/config/env.ts`); no persisted state is affected.
