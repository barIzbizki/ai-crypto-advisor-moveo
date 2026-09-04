## Why

New users can sign up and log in, but there is no way to capture their investing preferences on the frontend. The backend preferences API (`GET`/`POST /preferences`) and the `onboarded` flag on the user already exist and are done, but nothing in the UI collects preferences, submits them, or routes users based on onboarding status. This is Jira epic **KAN-58 (Frontend Onboarding Flow)**, covering subtasks **KAN-71, KAN-77, KAN-83, KAN-88, KAN-94**.

## What Changes

- **KAN-71**: Add a multi-step `/onboarding` page that collects crypto assets, investor type, and content-type preferences across steps, with step navigation (next/back).
- **KAN-77**: Add client-side validation for each onboarding step so users cannot advance or submit with invalid/incomplete input.
- **KAN-83**: Add a frontend preferences API client and wire the onboarding page's final step to `POST /preferences`, with loading and error states while the request is in flight.
- **KAN-88**: Add redirect logic: authenticated users with `onboarded: false` are routed to `/onboarding`; onboarded users who hit `/onboarding` (or complete it) are routed to `/dashboard`. Requires exposing the `onboarded` flag through `AuthContext`, which the frontend currently drops from the `/auth/me` response.
- **KAN-94**: Add frontend tests (Vitest + Testing Library) for the onboarding page, its validation, the preferences API client, and the redirect logic.
- Introduce a field-mapping decision (documented in `design.md`): the onboarding UI's "crypto assets" and "content types" steps map into `notification_preferences` (a free-form JSON object), and "investor type" maps into `risk_level`, with a fixed `trading_strategy` value derived from the selections, since the backend schema (`trading_strategy` required string, `risk_level` optional enum, `notification_preferences` optional dict) is already built and frozen.

## Capabilities

### New Capabilities
- `onboarding-flow`: The multi-step onboarding page (steps, navigation, per-step and submit-time validation).
- `preferences-client`: Frontend API integration for reading and submitting preferences (loading/error states, request/response mapping to the backend schema).
- `onboarding-redirect`: Route-level logic that sends users to `/onboarding` or `/dashboard` based on their `onboarded` status.

### Modified Capabilities
- None. There is no existing frontend spec for auth/routing under `openspec/specs/` to modify; `AuthContext`'s exposure of `onboarded` is implementation detail supporting the new `onboarding-redirect` capability, not a change to a previously specified capability.

## Impact

- **Frontend routing**: `frontend/src/App.tsx` gains an `/onboarding` route and updated redirect rules on `/dashboard` and `/`.
- **Frontend auth**: `frontend/src/api/auth.ts` (`AuthUser` type) and `frontend/src/context/AuthContext.tsx` must read and expose the `onboarded` field already returned by `GET /auth/me`.
- **Frontend API layer**: New `frontend/src/api/preferences.ts` client (mirrors `auth.ts`, uses `apiClient`).
- **Frontend pages/components**: New onboarding page(s) under `frontend/src/pages/`, new form components/schemas under `frontend/src/components/` and `frontend/src/schemas/`, following the existing `Login`/`Signup` + `FormField` + zod pattern.
- **Tests**: New `.test.tsx` files following existing colocated Vitest + Testing Library conventions.
- **Backend**: No changes. `preferences-api` (epic-4/KAN-13) is treated as a stable, frozen contract.
