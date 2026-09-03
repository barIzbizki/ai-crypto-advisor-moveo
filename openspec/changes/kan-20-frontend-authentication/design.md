## Context

See proposal.md - Why. The frontend is a bare Vite + React 19 + TypeScript scaffold (`frontend/src/App.tsx`/`main.tsx` still the Vite template; `components`, `context`, `pages` are empty barrel stubs from KAN-10). No router, HTTP client, form library, or test runner is installed. The backend (KAN-11, merged) exposes exactly three endpoints the frontend must integrate with, with no cookie support and no refresh tokens:
- `POST /auth/register` — `{email, password}` → 201 `{id, email, created_at}`, 400 on duplicate email
- `POST /auth/login` — `{email, password}` → 200 `{access_token, token_type: "bearer"}`, 401 on invalid credentials
- `GET /auth/me` — `Authorization: Bearer <token>` → 200 `{id, email, created_at}`, 401 if missing/invalid/expired

## Goals / Non-Goals

**Goals:**
- Let a person sign up, log in, stay signed in across a reload, and sign out, using only the three existing backend endpoints.
- Keep at least one route reachable only to signed-in people, redirecting anyone else to `/login`.
- Establish the auth/session/routing scaffolding (`AuthContext`, `apiClient`, `ProtectedRoute`, router) that later frontend features (e.g. dashboards) will build on.

**Non-Goals:**
- No refresh tokens, silent re-authentication, or "remember me" beyond what the access token's own expiry allows — the backend issues short-lived access tokens only.
- No logout endpoint call — the backend has none; sign-out is purely a client-side session clear.
- No role-based access control — `ProtectedRoute` only distinguishes signed-in vs. not, matching the backend's `get_current_user` (identity, not authorization).
- No password reset, email verification, or social login — out of scope for KAN-20, matching backend scope (KAN-11).

## Decisions

- **Routing: `react-router-dom`.** The only realistic choice for a `ProtectedRoute`-with-redirect pattern in a React SPA; no router is installed yet, so this is a net-new dependency, not a replacement.
- **Form handling: `react-hook-form` + `zod` (via `@hookform/resolvers`).** `zod` is already present in `frontend/package-lock.json`, but only as a transitive dependency (e.g. `zod-validation-error`) — not something app code should import without declaring it directly, so it is promoted to a direct dependency. `react-hook-form` keeps validation logic declarative and out of component state, and pairs with `zod` schemas that can be unit-tested independently of the UI. Alternative considered: hand-rolled `useState` + manual validation — rejected, it is what KAN-45/KAN-48 would otherwise reimplement per form with more surface for bugs.
- **Token persistence: `localStorage`, read into `AuthContext` state on load.** The backend issues a bearer token with no cookie support, so a client-side store is required; `localStorage` (vs. an in-memory-only store) is what makes "session survives a page reload" possible at all. Trade-off: `localStorage` is readable by any script on the page, so an XSS vulnerability elsewhere in the app could exfiltrate the token — accepted for this change since the backend does not offer an httpOnly-cookie-based alternative; revisiting token transport is a candidate for a future change if the backend adds cookie support.
- **Auth state: React Context (`AuthContext`), not a separate state library.** The auth state surface is small (current user, token, loading flag, login/signup/logout actions) and consumed broadly; Context avoids adding a state-management dependency (Redux/Zustand) for a problem this size.
- **Session restore on load calls `GET /auth/me`, not just trusting the stored token.** A token can expire or be invalidated server-side between visits; validating it against `/auth/me` on app start is the only way to satisfy "expired or invalid token clears the session" without waiting for the first protected-resource call to fail.
- **API client: a thin wrapper (`frontend/src/lib/apiClient.ts`) around `fetch`, not a full HTTP library (`axios`).** The request surface is small (three endpoints today); a small wrapper that injects `Authorization: Bearer <token>` and a JSON base URL keeps the dependency footprint down. Revisit if the request surface grows materially.
- **Test runner: `vitest` + `@testing-library/react` + `@testing-library/jest-dom` + `jsdom`.** Standard pairing for a Vite project; `vitest` reuses the existing Vite config/transform pipeline instead of introducing a second build pipeline (e.g. Jest + ts-jest/babel).
- **API base URL via `VITE_API_BASE_URL`.** Vite only exposes env vars prefixed `VITE_` to client code; documented in a new `frontend/.env.example`, consistent with how `backend/.env.example` documents backend settings (KAN-86).

## Risks / Trade-offs

- [Token in `localStorage` is vulnerable to XSS exfiltration] → No httpOnly-cookie option exists on the backend today; mitigated only by general XSS hygiene (React's default escaping, no `dangerouslySetInnerHTML` of untrusted content) — not further mitigated in this change.
- [No refresh token means a session silently expires mid-use] → Access-token expiry is a backend setting (`ACCESS_TOKEN_EXPIRE_MINUTES`, default 30 min per KAN-11); an expired token surfaces as a 401 on the next authenticated request, which `apiClient`/`AuthContext` treat as "signed out" rather than crashing — acceptable for this change's scope.
- [Login error message must not distinguish "unknown email" from "wrong password"] → The backend already returns a single generic 401 for both cases (KAN-11), so the frontend cannot leak that distinction even if it wanted to; no additional mitigation needed.

## Migration Plan

Net-new capability with no prior frontend auth state to migrate from and no backend changes. Rollout is just shipping the new pages/routes; rollback is reverting the change (no data migration, no backend coordination required).
