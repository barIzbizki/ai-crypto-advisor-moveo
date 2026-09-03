## 1. Frontend Scaffold (KAN-15)

- [x] 1.1 Scaffold `/frontend` with Vite's React + TypeScript template
- [x] 1.2 Create `src/pages/`, `src/components/`, `src/api/`, `src/context/` directories with placeholder/index files
- [x] 1.3 Verify `npm install` and the Vite dev server run cleanly from `/frontend`
- [x] 1.4 Verify the TypeScript build/type-check command passes with no errors

## 2. Backend Scaffold (KAN-22)

- [x] 2.1 Scaffold `/backend` with a FastAPI app entrypoint
- [x] 2.2 Create `routers/`, `models/`, `schemas/`, `services/`, `core/` directories with placeholder/`__init__.py` files
- [x] 2.3 Add a health/root endpoint and verify the server starts and responds
- [x] 2.4 Add a `requirements.txt` (or `pyproject.toml`) pinning FastAPI and its ASGI server

## 3. Linting & Formatting (KAN-29)

- [x] 3.1 Add and configure ESLint + Prettier in `/frontend`, wired to a single `lint`/`format` script
- [x] 3.2 Add and configure Ruff + Black in `/backend`, wired to a single `lint`/`format` command
- [x] 3.3 Run both lint/format commands against the freshly scaffolded code and fix any reported issues

## 4. Repository Configuration & Docs (KAN-37)

- [x] 4.1 Add a root `.gitignore` covering frontend (`node_modules/`, `dist/`, etc.) and backend (`__pycache__/`, venvs, etc.) artifacts
- [x] 4.2 Expand `README.md` with project overview, `/frontend` + `/backend` structure, and setup/run instructions for both apps
- [x] 4.3 Confirm `git status` is clean of build/dependency artifacts after installing and building both apps
