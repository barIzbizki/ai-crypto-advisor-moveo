## Context

See proposal.md - Why. Relevant existing state:
- `frontend/src/App.tsx` defines routes; `ProtectedRoute` redirects unauthenticated users to `/login` based on `AuthContext`'s `status`.
- `AuthContext` (`frontend/src/context/AuthContext.tsx`) holds `user: AuthUser | null` and `status`. `AuthUser` (`frontend/src/api/auth.ts`) is currently `{ id, email, created_at }` and does not include `onboarded`, even though the backend's `GET /auth/me` already returns it (`backend/schemas/auth.py: UserRead.onboarded`).
- The backend preferences contract (`backend/schemas/preferences.py`, frozen, from epic-4/KAN-13) is: `POST /preferences` body `{ trading_strategy: string (required), risk_level?: 'low'|'medium'|'high', notification_preferences?: dict }`, returns 201 (created) / 200 (updated) / 400 (invalid) / 401 (unauthenticated). `GET /preferences` returns 200 with the same shape, or 404 if none exist.
- Existing form pattern: zod schema in `frontend/src/schemas/`, `react-hook-form` + `FormField` component, page component in `frontend/src/pages/` (see `Signup.tsx`/`Login.tsx`).
- Existing API client pattern: thin functions in `frontend/src/api/<domain>.ts` wrapping `apiClient` (see `auth.ts`).

## Goals / Non-Goals

**Goals:**
- Deliver all five KAN-58 subtasks as one cohesive frontend feature.
- Reuse existing form, API-client, and routing conventions rather than introducing new patterns.
- Keep the backend preferences contract untouched; adapt the onboarding UI's field names to it.

**Non-Goals:**
- Changing the backend preferences schema or endpoints.
- Persisting partial onboarding progress across sessions (e.g., resuming a half-finished onboarding after logout) - out of scope for this change.
- Editing preferences after onboarding is complete (a "settings" page) - not part of KAN-58's subtasks.

## Decisions

- **Field mapping (crypto assets / investor type / content types → trading_strategy / risk_level / notification_preferences)**: The onboarding UI's three step names don't match the backend's field names because the backend contract was fixed in an earlier epic. Map as follows:
  - "Investor type" step → `risk_level` (`low` | `medium` | `high`), a direct enum match.
  - "Crypto assets" and "content types" steps → merged into `notification_preferences` as a JSON object, e.g. `{ crypto_assets: string[], content_types: string[] }`. This field is an untyped `dict` on the backend, so it accepts this shape without a backend change.
  - `trading_strategy` (required by the backend) → derived automatically from the investor type selection (e.g., `"conservative"` / `"balanced"` / `"aggressive"` keyed off `risk_level`), rather than shown as its own onboarding step, since no subtask calls for a distinct "trading strategy" input.
  - Alternative considered: add a fourth onboarding step explicitly asking for "trading strategy." Rejected because none of the five Jira subtasks describe such a step, and it would expand scope beyond KAN-58's stated content (crypto assets, investor type, content types).

- **Exposing `onboarded` on `AuthUser`**: Add `onboarded: boolean` to the `AuthUser` interface in `frontend/src/api/auth.ts` since it's already returned by `GET /auth/me` and requires no backend change. `AuthContext` passes it through unchanged; no new context method is needed.

- **Redirect placement**: Implement onboarding redirect as a route-level check alongside `ProtectedRoute` rather than inside individual pages, consistent with the existing pattern where `ProtectedRoute` centralizes the authenticated/unauthenticated redirect. A new `OnboardingRoute`-style check (exact component shape decided during implementation) reads `user.onboarded` from `AuthContext` and redirects `/dashboard` → `/onboarding` (if not onboarded) or `/onboarding` → `/dashboard` (if already onboarded).

- **Step state management**: Keep onboarding step state (current step index, accumulated form values) local to the onboarding page component via `react-hook-form`, consistent with existing single-step forms - no new global state library is introduced.

## Risks / Trade-offs

- [Backend field names leak UI-specific meaning into `notification_preferences`, which is nominally about notifications] → Mitigated by treating it as an opaque preferences bag per the frozen backend contract; if this becomes confusing long-term, a backend schema change is a separate future change, not part of KAN-58.
- [Deriving `trading_strategy` automatically means users never see or confirm it] → Acceptable per subtask scope (KAN-71 only calls for crypto assets/investor type/content types); revisit only if product requirements change.
- [No persistence of in-progress onboarding state across page reloads] → Acceptable for initial delivery; a user who reloads mid-onboarding restarts from step one.
