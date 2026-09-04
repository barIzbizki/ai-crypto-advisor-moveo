## Why

The FastAPI backend (auth API from KAN-11, SQLAlchemy/Alembic/Postgres from KAN-43) currently only runs locally against a docker-composed Postgres instance. There is no hosted environment for the frontend, QA, or stakeholders to hit. KAN-12 ("Backend Deployment") covers standing up a production deployment on Render, tracked as four Jira subtasks: KAN-38 (prepare the app and provision the Render web service/Postgres), KAN-41 (configure production env vars, CORS, and start command), KAN-44 (run Alembic migrations against the production database), and KAN-47 (verify the deployed backend).

## What Changes

- Prepare `backend/` for production: a Render-compatible start command (`uvicorn main:app` bound to `$PORT`), confirm `requirements.txt` has no local-only/dev-only assumptions, and add any Render config (`render.yaml` or dashboard-documented settings) (KAN-38).
- Provision a Render web service for the backend and a managed Render Postgres database, replacing the local docker-composed Postgres as the target for the deployed environment (KAN-38).
- Configure production environment variables on the Render service — `DATABASE_URL` (Render Postgres connection string), `SECRET_KEY`, `ENVIRONMENT=production`, `CORS_ORIGINS` (scoped to the deployed frontend origin(s) only) — and set the service's start command (KAN-41).
- Run the existing Alembic migrations (`ed604e348284_baseline`, `56d7176e5550_add_users_table`) against the production database so its schema matches `backend/models/` (KAN-44).
- Verify the deployed backend: `/health` returns healthy, `/docs` (OpenAPI/Swagger UI) is reachable, and the existing auth endpoints (`routers/auth.py`) work end-to-end against the production database (KAN-47).

## Capabilities

### New Capabilities
- `backend-deployment`: Production deployment of the FastAPI backend to Render — service/database provisioning, production configuration (env vars, CORS, start command), running migrations against the production database, and post-deploy verification.

### Modified Capabilities
(none — this change deploys the existing `backend-authentication` and `database` capabilities as-is; it does not change their requirements)

## Impact

- Affected code: `backend/main.py` (CORS origins driven by production `CORS_ORIGINS`), `backend/core/config.py` (production values for `database_url`, `environment`, `cors_origins`, `secret_key`), possibly a new `backend/render.yaml` or `Procfile`-equivalent start command, `README.md` (deployment section).
- Affected infrastructure: new Render web service, new Render managed Postgres database (production), production environment variable configuration in the Render dashboard/`render.yaml`.
- No application code behavior changes — `backend-authentication` and `database` capabilities are deployed unchanged. `alembic upgrade head` is run against a new (production) database rather than local docker-compose.
- Out of scope: frontend deployment (tracked separately), CI/CD automation of deploys (manual/dashboard-triggered deploy is acceptable for this change unless a later change requests automation), custom domain/TLS beyond Render's default.
