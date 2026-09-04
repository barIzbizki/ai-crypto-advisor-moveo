## Purpose

Routes authenticated users to the onboarding page or the dashboard based on their `onboarded` status, covering Jira subtask KAN-88.

## ADDED Requirements

### Requirement: Redirect non-onboarded users to onboarding
The system SHALL redirect an authenticated user whose `onboarded` flag is `false` to `/onboarding` when they access a protected route other than `/onboarding`.

#### Scenario: Non-onboarded user hits a protected route
- **WHEN** an authenticated user with `onboarded: false` navigates to `/dashboard` (or any other protected route)
- **THEN** the system redirects them to `/onboarding`

#### Scenario: Non-onboarded user on onboarding page
- **WHEN** an authenticated user with `onboarded: false` navigates to `/onboarding`
- **THEN** the system renders the onboarding page without redirecting

### Requirement: Redirect onboarded users away from onboarding
The system SHALL redirect an authenticated user whose `onboarded` flag is `true` to `/dashboard` when they access `/onboarding`, including immediately after successful preferences submission.

#### Scenario: Already-onboarded user hits onboarding route
- **WHEN** an authenticated user with `onboarded: true` navigates to `/onboarding`
- **THEN** the system redirects them to `/dashboard`

#### Scenario: Redirect after successful onboarding submission
- **WHEN** a user successfully submits preferences and their session's `onboarded` status becomes `true`
- **THEN** the system navigates them to `/dashboard`

### Requirement: Onboarded status available to routing
The system SHALL expose the authenticated user's `onboarded` status (as returned by `GET /auth/me`) to the client-side routing logic.

#### Scenario: Status loaded with authenticated session
- **WHEN** a stored session is restored and the current user is fetched
- **THEN** the user's `onboarded` value is available for redirect decisions before protected routes render
