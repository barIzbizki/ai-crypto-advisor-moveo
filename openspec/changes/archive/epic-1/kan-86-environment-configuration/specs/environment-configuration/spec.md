## Purpose

Provides a typed, environment-driven configuration mechanism for both the backend and frontend applications, documented example env files, backend CORS behavior derived from that configuration, and a guarantee that real secrets never enter version control.

## ADDED Requirements

### Requirement: Backend Typed Settings
The backend SHALL expose a single typed settings object, populated from environment variables (optionally via a local `.env` file), covering at minimum the database connection string, the running environment name, and the allowed CORS origins. Missing required settings SHALL cause the application to fail fast at startup rather than fail later with an unclear error.

#### Scenario: Backend starts with valid environment variables
- **WHEN** the backend application starts with all required environment variables set to valid values
- **THEN** the application starts successfully and the settings object reflects the provided values

#### Scenario: Backend uses documented defaults in local development
- **WHEN** the backend application starts with only the variables documented in `backend/.env.example` set (no additional configuration)
- **THEN** the application starts successfully using those values, suitable for local development

#### Scenario: Backend fails fast on invalid configuration
- **WHEN** the backend application starts with a required environment variable set to a value that fails validation (e.g. malformed CORS origins list)
- **THEN** the application fails to start and reports a clear validation error identifying the offending setting

### Requirement: Frontend Typed Environment Configuration
The frontend SHALL read build-time configuration (at minimum the backend API base URL) from `VITE_`-prefixed environment variables through a single shared configuration module, rather than reading `import.meta.env` ad hoc throughout the codebase. A local-development default SHALL be applied when an optional variable is not set.

#### Scenario: Frontend builds with an explicit API base URL
- **WHEN** the frontend is built or run in development with `VITE_API_BASE_URL` set
- **THEN** application code that needs the backend's base URL receives the configured value

#### Scenario: Frontend falls back to a local-development default
- **WHEN** the frontend is run in development without `VITE_API_BASE_URL` set
- **THEN** application code receives a sensible local-development default (pointing at the local backend) instead of an undefined or empty value

### Requirement: Documented Example Environment Files
Each application (backend and frontend) SHALL provide an example environment file listing every environment variable it reads, with a placeholder or local-development-safe value, so a new contributor can create a working local `.env` by copying it.

#### Scenario: New contributor sets up the backend
- **WHEN** a contributor copies `backend/.env.example` to `backend/.env` without modification
- **THEN** the backend starts successfully against a locally available database

#### Scenario: New contributor sets up the frontend
- **WHEN** a contributor copies `frontend/.env.example` to `frontend/.env` without modification
- **THEN** the frontend dev server starts and is configured to call the local backend's default address

### Requirement: CORS Configured from Settings
The backend SHALL enforce CORS restrictions based on an allow-list of origins sourced from its typed settings, rather than a hardcoded value, so the allowed origins can differ between local development and other environments without a code change. Requests from an origin not in the configured allow-list SHALL be rejected by CORS.

#### Scenario: Configured origin is allowed
- **WHEN** a browser at an origin listed in the backend's configured CORS origins makes a cross-origin request to the backend API
- **THEN** the response includes CORS headers permitting that origin

#### Scenario: Unconfigured origin is rejected
- **WHEN** a browser at an origin NOT listed in the backend's configured CORS origins makes a cross-origin request to the backend API
- **THEN** the browser blocks the response due to missing CORS permission for that origin

#### Scenario: Local frontend dev server works out of the box
- **WHEN** the backend is started with only the CORS configuration documented in `backend/.env.example`
- **THEN** the local Vite frontend dev server's default origin is included in the allowed origins

### Requirement: Secrets Excluded from Version Control
Real environment files containing environment-specific values or secrets (as opposed to `.env.example` files) SHALL be excluded from version control, and no such file SHALL exist in the project's Git history.

#### Scenario: A newly created local .env file is ignored by Git
- **WHEN** a contributor creates a `backend/.env` or `frontend/.env` file locally
- **THEN** `git status` does not list that file as untracked or stageable

#### Scenario: No .env file is tracked in the repository
- **WHEN** the repository's tracked files are inspected
- **THEN** no `.env` (or equivalent secret-bearing) file is present, only `.env.example` files
