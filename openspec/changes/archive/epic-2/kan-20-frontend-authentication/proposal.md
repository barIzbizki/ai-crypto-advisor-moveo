## Why

The frontend has no authentication: `frontend/src/{components,context,pages}` are still empty scaffolding (from KAN-10), and there is no signup/login UI, no way to hold onto a JWT between requests, and no way to keep an unauthenticated visitor out of pages that need a logged-in user. The backend already exposes `POST /auth/register`, `POST /auth/login`, and `GET /auth/me` (KAN-11), but nothing in the frontend calls them. KAN-20 ("Frontend Authentication") covers wiring the frontend up to that API, tracked as five Jira subtasks: KAN-45 (Signup page), KAN-48 (Login page), KAN-51 (Auth Context + token persistence), KAN-56 (authenticated API client + Protected Route), and KAN-61 (frontend auth tests).

## What Changes

- Add a `SignupPage` (`frontend/src/pages/Signup.tsx`) with an email/password form, client-side validation, and inline error handling for a 400 (duplicate email) response from `POST /auth/register` (KAN-45).
- Add a `LoginPage` (`frontend/src/pages/Login.tsx`) with an email/password form, client-side validation, and inline error handling for a 401 (invalid credentials) response from `POST /auth/login` (KAN-48).
- Add an `AuthContext`/`AuthProvider` (`frontend/src/context/AuthContext.tsx`) holding the current user and access token, exposing `login`, `signup`, `logout`, and an `isAuthenticated`/loading state, and persisting the access token across page reloads (KAN-51).
- Add an authenticated API client (`frontend/src/lib/apiClient.ts`) that attaches `Authorization: Bearer <token>` to requests and a `ProtectedRoute` component (`frontend/src/components/ProtectedRoute.tsx`) that redirects unauthenticated users to `/login` (KAN-56).
- Introduce client-side routing (`react-router-dom`) with `/login`, `/signup`, and at least one protected route, wired into `frontend/src/App.tsx` (KAN-56).
- Add unit/component tests for the Signup and Login pages (validation, success, and error paths), the `AuthContext` (login/logout/persistence), and `ProtectedRoute` (redirect behavior), plus the test runner/config needed to run them (KAN-61).

## Capabilities

### New Capabilities
- `frontend-authentication`: Signup and login pages, an auth context that holds and persists the current user's session, an authenticated API client, and route protection that redirects unauthenticated users to `/login`.

### Modified Capabilities
(none — this introduces a new capability; it does not change the behavior of `backend-authentication`, `database`, or `environment-configuration`, it only consumes the existing backend auth API from the frontend)

## Impact

- Affected code: new `frontend/src/pages/Signup.tsx`, `frontend/src/pages/Login.tsx`, `frontend/src/context/AuthContext.tsx`, `frontend/src/lib/apiClient.ts`, `frontend/src/components/ProtectedRoute.tsx`; modified `frontend/src/App.tsx` (routing + `AuthProvider`), `frontend/src/main.tsx` (router setup), `frontend/package.json` (new dependencies + test scripts).
- Dependencies introduced: `react-router-dom` (routing), `react-hook-form` + `zod`/`@hookform/resolvers` (form validation — `zod` currently only present as a transitive dependency, will become a direct one), `vitest` + `@testing-library/react` + `@testing-library/jest-dom` + `jsdom` (frontend tests, none configured yet).
- No changes to the backend: consumes the existing `POST /auth/register`, `POST /auth/login`, `GET /auth/me` endpoints exactly as they exist today (KAN-11) — no new/changed backend routes or schemas.
- Frontend now requires the backend's `CORS`/base URL to be reachable from the browser; base API URL will be read from a Vite env variable (e.g. `VITE_API_BASE_URL`), documented in a new `frontend/.env.example`.
