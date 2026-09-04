## MODIFIED Requirements

### Requirement: POST /feedback endpoint accepts user feedback
The system SHALL provide an HTTP POST endpoint at `/feedback` that accepts user feedback submissions. The endpoint requires JWT authentication (Bearer token in Authorization header). Valid feedback is a boolean vote (`is_upvote: true` for thumbs up, `is_upvote: false` for thumbs down) on a content item identified by `content_id`. The endpoint uses upsert semantics: if the user has already voted on that content, the vote is updated; otherwise a new feedback record is created.

#### Scenario: Authenticated user submits feedback
- **WHEN** an authenticated user POSTs to `/feedback` with a valid `content_id` and `is_upvote` boolean
- **THEN** the endpoint returns HTTP 201 (if new) or 200 (if updated) and includes the submitted feedback record in the response

#### Scenario: Unauthenticated request is rejected
- **WHEN** a request to `/feedback` lacks a valid JWT token
- **THEN** the endpoint returns HTTP 401 Unauthorized with `WWW-Authenticate: Bearer` header

#### Scenario: Invalid content_id is rejected
- **WHEN** a user POSTs feedback with a missing or malformed `content_id`
- **THEN** the endpoint returns HTTP 422 Unprocessable Entity with field validation errors

#### Scenario: Non-boolean vote value is rejected
- **WHEN** a user POSTs feedback with an `is_upvote` value that is not a boolean (e.g. a number or string)
- **THEN** the endpoint returns HTTP 422 Unprocessable Entity with field validation errors

### Requirement: Feedback submission is idempotent given same content_id and rating
The system SHALL ensure that submitting identical feedback twice (same user, same content, same `is_upvote` value) is idempotent—the second request succeeds and returns the same feedback record (HTTP 200, not 201), with no additional side effects.

#### Scenario: Resubmitting identical feedback
- **WHEN** a user submits identical feedback (same `content_id`, same `is_upvote` value) twice
- **THEN** both requests succeed; the second returns HTTP 200 with the existing record, not HTTP 201

#### Scenario: Modifying a vote counts as an update
- **WHEN** a user flips their `is_upvote` value for the same `content_id`
- **THEN** the endpoint updates the record and returns HTTP 200 (update, not create)
