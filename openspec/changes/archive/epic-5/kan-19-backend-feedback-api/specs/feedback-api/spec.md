## Purpose

Provides an API endpoint for authenticated users to submit, update, and retrieve feedback (votes) on dashboard content, enabling the system to track user preferences and improve recommendations.

## ADDED Requirements

### Requirement: POST /feedback endpoint accepts user feedback
The system SHALL provide an HTTP POST endpoint at `/feedback` that accepts user feedback submissions. The endpoint requires JWT authentication (Bearer token in Authorization header). Valid feedback includes a rating or vote on a content item identified by `content_id`. The endpoint uses upsert semantics: if the user has already voted on that content, the vote is updated; otherwise a new feedback record is created.

#### Scenario: Authenticated user submits feedback
- **WHEN** an authenticated user POSTs to `/feedback` with valid `content_id` and rating
- **THEN** the endpoint returns HTTP 201 (if new) or 200 (if updated) and includes the submitted feedback record in the response

#### Scenario: Unauthenticated request is rejected
- **WHEN** a request to `/feedback` lacks a valid JWT token
- **THEN** the endpoint returns HTTP 401 Unauthorized with `WWW-Authenticate: Bearer` header

#### Scenario: Invalid content_id is rejected
- **WHEN** a user POSTs feedback with a missing or malformed `content_id`
- **THEN** the endpoint returns HTTP 422 Unprocessable Entity with field validation errors

### Requirement: POST /feedback response includes existing votes and dashboard content
The system SHALL return, in the HTTP response body, a list of all existing feedback votes (from all users) for the same `content_id`, along with associated dashboard content details. This allows clients to display aggregate feedback and content information after submission.

#### Scenario: Response includes vote aggregates
- **WHEN** a user submits feedback on a content item
- **THEN** the response includes: the submitted feedback record, count/list of other votes on the same content, and dashboard content metadata (name, type, etc.)

#### Scenario: Empty vote list for new content
- **WHEN** a user submits the first feedback for a content item
- **THEN** the response includes the new feedback record and an empty list of other votes, plus dashboard content details

### Requirement: Feedback endpoint enforces user+content uniqueness
The system SHALL prevent duplicate feedback: a user can vote on a given content item only once. Attempting to submit a second vote without an update (MODIFIED payload) raises a constraint error.

#### Scenario: Upsert prevents duplicate independent submissions
- **WHEN** the same user submits feedback twice for the same content with identical payloads (not an update)
- **THEN** the second submission updates the existing record instead of creating a duplicate (upsert behavior)

#### Scenario: Database constraint blocks broken upsert logic
- **WHEN** the application fails and attempts to insert a duplicate (user_id, content_id) pair without checking first
- **THEN** the database raises an integrity constraint error (composite unique constraint on user_id + content_id)

### Requirement: Feedback submission is idempotent given same content_id and rating
The system SHALL ensure that submitting identical feedback twice (same user, same content, same rating) is idempotent—the second request succeeds and returns the same feedback record (HTTP 200, not 201), with no additional side effects.

#### Scenario: Resubmitting identical feedback
- **WHEN** a user submits identical feedback (same content_id, same rating) twice
- **THEN** both requests succeed; the second returns HTTP 200 with the existing record, not HTTP 201

#### Scenario: Modifying a vote counts as an update
- **WHEN** a user changes their rating for the same content_id
- **THEN** the endpoint updates the record and returns HTTP 200 (update, not create)
