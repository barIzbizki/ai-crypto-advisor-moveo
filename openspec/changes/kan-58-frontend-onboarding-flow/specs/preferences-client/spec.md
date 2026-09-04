## Purpose

Submits the onboarding page's selections to the backend `POST /preferences` endpoint and surfaces loading and error states while doing so, covering Jira subtask KAN-83.

## ADDED Requirements

### Requirement: Submit preferences on onboarding completion
The system SHALL submit the user's onboarding selections to `POST /preferences` when the user completes the final onboarding step, mapping investor type to `risk_level`, crypto assets and content types into `notification_preferences`, and a derived value into the required `trading_strategy` field.

#### Scenario: Successful submission
- **WHEN** the user submits a valid, complete set of onboarding selections
- **THEN** the system sends a `POST /preferences` request with the mapped fields and, on a 200 or 201 response, treats onboarding as complete

#### Scenario: Submission validation error
- **WHEN** `POST /preferences` responds with 400 Bad Request
- **THEN** the system displays the returned validation error(s) to the user without leaving the onboarding page

#### Scenario: Submission auth error
- **WHEN** `POST /preferences` responds with 401 Unauthorized
- **THEN** the system treats the user as unauthenticated and does not treat onboarding as complete

### Requirement: Loading and error state during submission
The system SHALL indicate a loading state while the preferences submission request is in flight and SHALL display an error message if the request fails for a reason other than validation (e.g., network failure or 5xx response).

#### Scenario: Loading state shown
- **WHEN** the user submits onboarding selections
- **THEN** the system disables the submit action and shows a loading indicator until the request resolves

#### Scenario: Network or server error surfaced
- **WHEN** the preferences submission request fails due to a network error or a 5xx response
- **THEN** the system stops the loading state, displays an error message, and allows the user to retry submission
