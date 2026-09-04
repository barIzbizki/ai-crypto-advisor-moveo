## 1. Onboarding page structure (KAN-71)

- [x] 1.1 Create `frontend/src/pages/Onboarding.tsx` with local step state (crypto assets → investor type → content types)
- [x] 1.2 Create step-specific input components (or sections within the page) for crypto assets (multi-select), investor type (single-select), and content types (multi-select)
- [x] 1.3 Add "Next" / "Back" navigation controls that move between steps and preserve entered values
- [x] 1.4 Show a "Submit" action instead of "Next" on the final step
- [x] 1.5 Add `/onboarding` route in `frontend/src/App.tsx`
- [x] 1.6 Export `OnboardingPage` from `frontend/src/pages/index.ts`

## 2. Onboarding validation (KAN-77)

- [x] 2.1 Add zod schema(s) in `frontend/src/schemas/onboarding.ts` for each step's required inputs (e.g., at least one crypto asset, an investor type selection, at least one content type)
- [x] 2.2 Wire step schemas into `react-hook-form` (or per-step validation calls) so "Next" is blocked until the current step is valid
- [x] 2.3 Surface validation errors per field using the existing `FormField` error pattern
- [x] 2.4 Validate all steps together before allowing final submission

## 3. Preferences API client and submission (KAN-83)

- [x] 3.1 Create `frontend/src/api/preferences.ts` with a `submitPreferences` function following the `auth.ts` pattern (uses `apiClient`, takes the auth token)
- [x] 3.2 Implement the field mapping from design.md: investor type → `risk_level`, crypto assets + content types → `notification_preferences`, derived value → `trading_strategy`
- [x] 3.3 Call `submitPreferences` from the onboarding page's final-step submit handler
- [x] 3.4 Add loading state: disable submit and show a loading indicator while the request is in flight
- [x] 3.5 Handle 400 responses by displaying returned validation errors on the page
- [x] 3.6 Handle network/5xx errors by displaying a retryable error message
- [x] 3.7 Handle 401 responses consistently with existing auth-expiry handling

## 4. Onboarded-status-based redirects (KAN-88)

- [x] 4.1 Add `onboarded: boolean` to the `AuthUser` interface in `frontend/src/api/auth.ts`
- [x] 4.2 Confirm `AuthContext` passes `onboarded` through unchanged on login and on session restore (`getCurrentUser`)
- [x] 4.3 Add a route guard (alongside/extending `ProtectedRoute`) that redirects authenticated, non-onboarded users from other protected routes to `/onboarding`
- [x] 4.4 Add a route guard that redirects authenticated, already-onboarded users away from `/onboarding` to `/dashboard`
- [x] 4.5 After successful preferences submission, update the in-memory user/`onboarded` state and navigate to `/dashboard`

## 5. Frontend tests (KAN-94)

- [x] 5.1 Write `Onboarding.test.tsx` covering step navigation (next/back) and per-step validation blocking
- [x] 5.2 Write tests for the final-step submission flow: success, 400 validation error, network/5xx error, loading state
- [x] 5.3 Write tests for `frontend/src/api/preferences.ts` request/response mapping
- [x] 5.4 Write tests for the onboarding redirect guard: non-onboarded user redirected to `/onboarding`, onboarded user redirected away from `/onboarding`
- [x] 5.5 Update or add `AuthContext` tests to cover `onboarded` being read from `/auth/me` and exposed on the user object
