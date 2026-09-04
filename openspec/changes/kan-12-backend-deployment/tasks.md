## 1. Prepare App and Provision Render Service/Database (KAN-38)

- [x] 1.1 Confirm `backend/main.py` and `backend/requirements.txt` have no local-only assumptions (e.g. hardcoded `localhost` URLs, dev-only dependencies) that would break in production
- [x] 1.2 Decide and document the production start command (`uvicorn main:app --host 0.0.0.0 --port $PORT`)
- [x] 1.3 Create a Render account/project (if not already present) and provision a new Render Web Service pointed at the `backend/` directory of this repository
- [x] 1.4 Provision a Render managed Postgres database instance for production
- [x] 1.5 Confirm the web service can reach the managed Postgres instance (same region, or otherwise network-accessible)

## 2. Configure Production Environment Variables, CORS, and Start Command (KAN-41)

- [x] 2.1 Set the Render web service's start command to the one decided in 1.2
- [x] 2.2 Set `DATABASE_URL` on the Render web service to the managed Postgres instance's connection string (using the `postgresql+psycopg://` scheme expected by `backend/core/config.py`)
- [x] 2.3 Generate a fresh `SECRET_KEY` for production (e.g. `python -c "import secrets; print(secrets.token_hex(32))"`) and set it on the Render web service — never reuse the local/dev value
- [x] 2.4 Set `ENVIRONMENT=production` on the Render web service
- [ ] 2.5 Set `CORS_ORIGINS` on the Render web service to the deployed frontend's origin(s) only (not `http://localhost:5173`)
- [x] 2.6 Verify `ALGORITHM` and `ACCESS_TOKEN_EXPIRE_MINUTES` are set or left at their existing defaults intentionally
- [x] 2.7 Trigger a deploy and verify the service starts successfully with the above configuration (check Render logs for startup errors, e.g. a missing `SECRET_KEY`)

## 3. Run Alembic Migrations in Production (KAN-44)

- [x] 3.1 Obtain the production `DATABASE_URL` and run `alembic upgrade head` against it (from a local shell with the URL exported, or via Render's shell/one-off job feature)
- [x] 3.2 Verify both existing migrations (`ed604e348284_baseline`, `56d7176e5550_add_users_table`) applied successfully and the `users` table exists in production
- [x] 3.3 Verify re-running `alembic upgrade head` against the now-migrated production database is a no-op (no errors, no further changes)
- [x] 3.4 Document the production migration command and when to run it (e.g. README deployment section)

## 4. Verify Deployed Backend (KAN-47)

- [x] 4.1 Request the deployed `/health` endpoint and confirm it returns a healthy status
- [x] 4.2 Request the deployed `/docs` endpoint and confirm the OpenAPI/Swagger UI loads
- [x] 4.3 Exercise the deployed auth endpoints (register and login, per `backend/routers/auth.py`) end-to-end and confirm the created user is persisted in the production database
- [x] 4.4 Confirm a CORS request from an origin not in the configured `CORS_ORIGINS` is not granted cross-origin access
- [x] 4.5 Record the deployed backend's URL (e.g. in README or shared with the frontend team) for downstream configuration
