## Why

The AI Crypto Advisor repo is currently blank (only an empty `README.md` is tracked). Before any onboarding, dashboard, or AI-insight feature work (KAN-4's other stories) can begin, the frontend and backend project skeletons, dev tooling, and repo hygiene files need to exist. KAN-10 ("Repository & Project Scaffolding") covers this foundational setup, tracked as four Jira subtasks: KAN-15 (frontend scaffold), KAN-22 (backend scaffold), KAN-29 (linting/formatting), and KAN-37 (`.gitignore` + README).

## What Changes

- Scaffold `/frontend` with Vite + React + TypeScript, including `pages/`, `components/`, `api/`, and `context/` directories (KAN-15).
- Scaffold `/backend` with FastAPI, including `routers/`, `models/`, `schemas/`, `services/`, and `core/` directories (KAN-22).
- Configure linting and formatting: ESLint + Prettier for the frontend, Ruff + Black for the backend, each runnable via a single command (KAN-29).
- Add a root `.gitignore` covering both stacks' build/dependency artifacts, and expand `README.md` with project overview, structure, and setup/run instructions (KAN-37).

## Capabilities

### New Capabilities
- `project-scaffolding`: The baseline repository structure, tooling, and configuration that all later frontend/backend feature work builds on — frontend app skeleton, backend app skeleton, linting/formatting setup, and repo-level configuration (`.gitignore`, README).

### Modified Capabilities
(none — repo is currently blank, no existing capabilities to modify)

## Impact

- Affected code: entire repository (currently empty aside from `README.md`); introduces `/frontend` and `/backend` top-level directories, root `.gitignore`, and an expanded `README.md`.
- Dependencies introduced: Vite, React, TypeScript, ESLint, Prettier (frontend); FastAPI, Ruff, Black (backend).
- No runtime APIs or data yet — this change only establishes structure and tooling, not application behavior.
