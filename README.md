# AI Crypto Advisor

A personalized crypto investor dashboard. Users complete a short onboarding quiz, then see daily AI-curated content (market news, coin prices, an AI insight of the day, and a crypto meme) tailored to their preferences, with thumbs up/down feedback on each section.

## Project Structure

```
.
├── frontend/   # Vite + React + TypeScript app
│   └── src/
│       ├── pages/       # Route-level views
│       ├── components/  # Reusable UI components
│       ├── api/         # Backend API client calls
│       └── context/     # React context providers
└── backend/    # FastAPI app
    ├── routers/   # API route handlers
    ├── models/    # DB models
    ├── schemas/   # Pydantic request/response schemas
    ├── services/  # Business logic
    └── core/      # Config, DB session, shared setup
```

## Prerequisites

- Node.js 20+ and npm
- Python 3.12+
- Docker (for the local Postgres database)

## Setup & Run

### Database

```bash
cp .env.example .env   # adjust values if needed
docker compose up -d
```

Starts a local Postgres instance at `localhost:5432` (database `ai_crypto_advisor`). Then, after installing backend dependencies (see Backend below), with the venv active:

```bash
cd backend
alembic upgrade head
```

Applies all migrations. Other commands (run from `backend/` with the venv active):
- `alembic revision --autogenerate -m "<message>"` — generate a migration from model changes
- `alembic downgrade base` — revert all migrations
- `docker compose down` — stop Postgres (data is kept in a Docker volume; add `-v` to also delete it)

### Frontend

```bash
cd frontend
cp .env.example .env   # adjust values if needed
npm install
npm run dev
```

Runs the dev server at http://localhost:5173.

Other scripts:
- `npm run build` — type-check and build for production
- `npm run lint` — run ESLint
- `npm run format` — format with Prettier
- `npm run format:check` — check formatting without writing

### Backend

```bash
cd backend
cp .env.example .env   # adjust values if needed
python -m venv .venv
.venv\Scripts\activate      # Windows
# source .venv/bin/activate  # macOS/Linux
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Runs the API at http://localhost:8000 (health check at `/health`).

Other commands (run from `backend/` with the venv active):
- `ruff check .` — lint
- `black .` — format
- `pytest` — run tests
