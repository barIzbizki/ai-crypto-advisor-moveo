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

## Setup & Run

### Frontend

```bash
cd frontend
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
