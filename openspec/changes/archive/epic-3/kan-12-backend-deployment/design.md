## Context

See proposal.md - Why. Relevant constraints: `backend/main.py` runs FastAPI via `uvicorn`, reads all settings through `backend/core/config.py` (`pydantic-settings`, `.env`-backed, `SECRET_KEY` has no default so it is required), and already has two Alembic migrations (`ed604e348284_baseline`, `56d7176e5550_add_users_table`) plus a `/health` endpoint (`backend/routers/health.py`). Locally, Postgres runs via the root `docker-compose.yml`. There is no existing `render.yaml`, `Procfile`, or CI/CD deploy pipeline in the repo.

## Goals / Non-Goals

**Goals:**
- Get the existing backend (unmodified in behavior) running on Render against a Render-managed production Postgres database.
- Keep production configuration entirely in environment variables, consistent with the existing `core/config.py` pattern.
- Make the production database schema reproducible via the existing Alembic migrations rather than manual SQL.
- Leave a verifiable, documented way to confirm the deploy worked (health, docs, auth flow).

**Non-Goals:**
- Frontend deployment — tracked separately.
- Automated CI/CD (auto-deploy on push, migration-on-deploy hooks) — Render's dashboard-triggered deploy plus a manually run migration command is sufficient for this change; automation can be a later change if needed.
- Custom domains, TLS certificates beyond Render's default `*.onrender.com`, autoscaling, or multi-region — out of scope.
- Observability/monitoring/alerting infrastructure beyond Render's built-in logs — out of scope.

## Decisions

- **Render for both the web service and the managed Postgres database.** Keeps the whole backend stack on one platform with a single dashboard for logs, env vars, and the database connection string, rather than splitting hosting (e.g. app on Render, DB on a separate provider) which would add cross-provider network/latency and credential-management complexity for no benefit at this stage.
- **Start command `uvicorn main:app --host 0.0.0.0 --port $PORT`, no `render.yaml` required initially.** Render injects `$PORT`; configuring the start command directly in the Render dashboard is simpler than maintaining a `render.yaml` for a single service, and matches how `backend/main.py` already exposes `app`. A `render.yaml` can be added later if infra-as-code becomes a priority — not needed for a single-service deploy.
- **Production config via Render's environment variable dashboard, reusing `backend/core/config.py` unchanged.** `Settings` already reads `DATABASE_URL`, `ENVIRONMENT`, `CORS_ORIGINS`, `SECRET_KEY` from the environment (via `.env`/`pydantic-settings`), and `SECRET_KEY` already has no insecure default — no code changes needed, only setting production values (Render's Postgres connection string, a freshly generated secret, `ENVIRONMENT=production`, and the deployed frontend's origin(s) for CORS).
- **Migrations run manually via `alembic upgrade head`** (from a local shell pointed at the production `DATABASE_URL`, or Render's shell/one-off job feature) rather than wiring migrations into the start command or a deploy hook. Running migrations as part of every service start risks concurrent-start races if Render ever scales the service to multiple instances; a deliberate, explicit migration step is safer for a small team and matches the KAN-44 subtask being a distinct, verifiable step.
- **Verification is manual (curl/browser against `/health`, `/docs`, and an auth endpoint)**, not an automated smoke-test suite. This is a one-time deployment setup change; adding automated post-deploy smoke tests is disproportionate scope for standing up the first environment and can follow later if repeated deploys warrant it.

## Risks / Trade-offs

- [Manual migration step could be forgotten before/after a deploy, leaving the app and schema out of sync] → Document the exact migration command and when to run it (README deployment section); KAN-44's verification step (KAN-47) catches drift by exercising an endpoint that touches the `users` table.
- [CORS misconfigured too permissively (e.g. left as local defaults) would allow unintended origins] → `core/config.py`'s `split_cors_origins` validator already rejects non-`http(s)://` values; the production value must be set explicitly to the deployed frontend origin(s) as part of KAN-41, not left at the `http://localhost:5173` default.
- [Render free/starter tier services can spin down on inactivity, causing a slow first request] → Acceptable for an initial deployment; note it during KAN-47 verification so a slow first response isn't mistaken for a failure. Upgrading tier is a future decision, not part of this change.
- [No automated deploy pipeline means production can drift from `main` if someone forgets to trigger a deploy] → Acceptable trade-off for this change (see Non-Goals); Render's dashboard shows the deployed commit, making drift visible.

## Migration Plan

1. Provision the Render Postgres database and web service (KAN-38).
2. Set production environment variables and start command on the web service (KAN-41).
3. Deploy the service from the target branch/commit.
4. Run `alembic upgrade head` against the production `DATABASE_URL` (KAN-44).
5. Verify `/health`, `/docs`, and an auth endpoint against the deployed service (KAN-47).

Rollback: Render retains previous deploys and supports redeploying an earlier commit from the dashboard. Since this change introduces no new migrations beyond the two already merged, a rollback of the deploy does not require a corresponding `alembic downgrade` unless a future change adds migrations after this one ships.
