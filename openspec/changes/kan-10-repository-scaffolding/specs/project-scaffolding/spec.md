## Purpose

Defines the baseline repository structure, dev tooling, and configuration that the AI Crypto Advisor frontend and backend are built on, so later feature work starts from a consistent, lint-clean, documented codebase.

## ADDED Requirements

### Requirement: Frontend Application Scaffold
The system SHALL provide a `/frontend` application scaffolded with Vite, React, and TypeScript, organized into `pages/`, `components/`, `api/`, and `context/` directories.

#### Scenario: Frontend dev server starts successfully
- **WHEN** a developer runs the frontend install and dev-server commands from `/frontend`
- **THEN** the Vite dev server starts without errors and serves a React application

#### Scenario: Frontend directory structure is in place
- **WHEN** a developer inspects `/frontend/src`
- **THEN** `pages/`, `components/`, `api/`, and `context/` directories exist, each ready to hold their respective code

#### Scenario: TypeScript compiles cleanly
- **WHEN** a developer runs the TypeScript build/type-check command from `/frontend`
- **THEN** it completes with no type errors on the scaffolded code

### Requirement: Backend Application Scaffold
The system SHALL provide a `/backend` application scaffolded with FastAPI, organized into `routers/`, `models/`, `schemas/`, `services/`, and `core/` directories.

#### Scenario: Backend server starts successfully
- **WHEN** a developer runs the backend install and server-start commands from `/backend`
- **THEN** the FastAPI server starts without errors and responds on a health/root endpoint

#### Scenario: Backend directory structure is in place
- **WHEN** a developer inspects `/backend`
- **THEN** `routers/`, `models/`, `schemas/`, `services/`, and `core/` directories exist, each ready to hold their respective code

### Requirement: Linting and Formatting Tooling
The system SHALL provide linting and formatting for both applications: ESLint and Prettier for the frontend, Ruff and Black for the backend, each invocable via a single command.

#### Scenario: Frontend lint and format run cleanly
- **WHEN** a developer runs the lint and format commands from `/frontend` on the freshly scaffolded code
- **THEN** ESLint reports no errors and Prettier reports no unformatted files

#### Scenario: Backend lint and format run cleanly
- **WHEN** a developer runs the lint and format commands from `/backend` on the freshly scaffolded code
- **THEN** Ruff reports no errors and Black reports no unformatted files

### Requirement: Repository Configuration and Documentation
The system SHALL provide a root `.gitignore` that excludes standard frontend and backend build/dependency artifacts, and a `README.md` describing the project, its structure, and how to set up and run it.

#### Scenario: Build and dependency artifacts are ignored
- **WHEN** a developer installs dependencies and builds both `/frontend` and `/backend`
- **THEN** `git status` shows no generated artifacts (e.g. `node_modules/`, `dist/`, `__pycache__/`, virtual environments) as untracked or staged

#### Scenario: README documents setup
- **WHEN** a new developer opens `README.md`
- **THEN** it describes the project, the `/frontend` and `/backend` structure, and the commands to install dependencies and run both applications locally
