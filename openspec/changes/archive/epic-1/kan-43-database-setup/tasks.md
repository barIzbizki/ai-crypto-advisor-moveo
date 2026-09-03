## 1. Local Postgres Service (KAN-54)

- [x] 1.1 Add a root `docker-compose.yml` with a `postgres` service (official `postgres` image), a named persistent volume, and configurable env vars (`POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, port mapping)
- [x] 1.2 Add a `.env.example` (or similar) documenting the compose env vars with non-production placeholder values
- [x] 1.3 Verify `docker compose up -d` starts Postgres and it's reachable (e.g. `psql`/`pg_isready`) on the configured host/port
- [x] 1.4 Verify data persists across `docker compose down` / `docker compose up` (without removing the volume)

## 2. SQLAlchemy Engine, Session, and Base (KAN-66)

- [x] 2.1 Add `sqlalchemy` and a Postgres driver (`psycopg[binary]`) to `backend/requirements.txt`
- [x] 2.2 Add a minimal `backend/core/config.py` exposing a `DATABASE_URL` setting sourced from the environment
- [x] 2.3 Add `backend/core/database.py` (or `db.py`) with an `Engine`, a `SessionLocal` sessionmaker, and a declarative `Base`
- [x] 2.4 Add a `get_db` FastAPI dependency yielding a request-scoped session and ensuring it's closed afterward
- [x] 2.5 Verify the backend starts against the docker-composed Postgres and a trivial query (e.g. `SELECT 1` via `get_db`) succeeds

## 3. Alembic Initialization (KAN-75)

- [x] 3.1 Add `alembic` to `backend/requirements.txt`
- [x] 3.2 Run `alembic init` to scaffold `backend/alembic/` (`env.py`, `script.py.mako`, `versions/`) and `backend/alembic.ini`
- [x] 3.3 Wire `env.py` to read `DATABASE_URL` from `backend/core/config.py` instead of a hardcoded URL
- [x] 3.4 Wire `env.py`'s `target_metadata` to the SQLAlchemy `Base.metadata` from `backend/core/database.py`
- [x] 3.5 Verify `alembic revision --autogenerate` runs without errors (producing an empty diff, since no models exist yet)

## 4. Initial Migration (KAN-80)

- [x] 4.1 Generate the initial baseline migration (`alembic revision --autogenerate -m "baseline"`)
- [x] 4.2 Verify `alembic upgrade head` applies cleanly against a fresh docker-composed Postgres database
- [x] 4.3 Verify `alembic downgrade base` cleanly reverts
- [x] 4.4 Document the local DB + migration workflow (compose up, `alembic upgrade head`) in `README.md`
