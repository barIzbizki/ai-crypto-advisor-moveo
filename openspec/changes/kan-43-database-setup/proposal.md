## Why

The backend currently has no database: `backend/models/` is an empty placeholder package left over from KAN-10 scaffolding, and there is no local Postgres instance, ORM configuration, or migration tooling. Every upcoming feature that needs to persist data (users, portfolios, AI insights, etc.) is blocked until this foundation exists. KAN-43 ("Database Setup") covers this, tracked as four Jira subtasks: KAN-54 (local Postgres via docker-compose), KAN-66 (SQLAlchemy engine/session/Base), KAN-75 (Alembic init), and KAN-80 (initial migration).

## What Changes

- Add a `postgres` service to a root/`backend` `docker-compose.yml` for local development, with a persistent volume and configurable credentials/db name via environment variables (KAN-54).
- Add SQLAlchemy as a backend dependency; configure a `core/database.py` (or similar) with an `Engine`, a `SessionLocal` factory, a declarative `Base`, and a FastAPI dependency (`get_db`) for request-scoped sessions, all driven by a `DATABASE_URL` setting (KAN-66).
- Add Alembic as a backend dependency; initialize its migration environment under `backend/alembic/`, wire `env.py` to the app's settings/`DATABASE_URL` and to the SQLAlchemy `Base.metadata` for autogenerate support (KAN-75).
- Generate and apply the initial Alembic migration (starting from an empty metadata baseline, since no models exist yet) and verify `alembic upgrade head` / `alembic downgrade base` both run cleanly against the docker-composed Postgres instance (KAN-80).

## Capabilities

### New Capabilities
- `database`: Local Postgres provisioning, SQLAlchemy engine/session/Base setup, and Alembic migration tooling that all future persistence-related backend work builds on.

### Modified Capabilities
(none — no existing capability covers persistence; `project-scaffolding` from KAN-10 only established empty placeholder directories)

## Impact

- Affected code: new `docker-compose.yml` (repo root or `backend/`), new `backend/core/database.py` (or `core/db.py`), new `backend/alembic/` directory (`env.py`, `script.py.mako`, `versions/`), new `backend/alembic.ini`, updates to `backend/requirements.txt`/`backend/pyproject.toml` (SQLAlchemy, Alembic, psycopg driver), and likely a new `backend/core/config.py` for settings if one doesn't already exist.
- Dependencies introduced: `sqlalchemy`, `alembic`, a Postgres driver (`psycopg[binary]` or `psycopg2-binary`); `postgres` Docker image at the infra level.
- No application models or API behavior yet — this change only establishes the database connection, migration tooling, and an empty baseline migration. Defining actual domain models (users, portfolios, etc.) is out of scope and belongs to later feature work.
