## Purpose

Exposes the authenticated user's typed preferences for both writing (onboarding submission) and reading (Dashboard personalization).

## ADDED Requirements

### Requirement: POST /preferences accepts typed preference fields
The system SHALL provide an HTTP POST endpoint at `/preferences` that requires JWT authentication and accepts `investor_type`, `crypto_assets`, and `content_types`. The endpoint uses upsert semantics keyed by the authenticated user: a first submission creates the record and marks the user onboarded; a later submission updates the existing record.

#### Scenario: First submission creates preferences and onboards the user
- **WHEN** an authenticated user with no existing preferences POSTs valid `investor_type`, `crypto_assets`, and `content_types`
- **THEN** the endpoint returns HTTP 201, persists the record, and marks the user as onboarded

#### Scenario: Later submission updates existing preferences
- **WHEN** an authenticated user who already has preferences POSTs new values
- **THEN** the endpoint returns HTTP 200 and the stored record reflects the new values

#### Scenario: Invalid payload is rejected
- **WHEN** a POST to `/preferences` omits a required field or supplies an invalid `investor_type`
- **THEN** the endpoint returns HTTP 422 Unprocessable Entity with field validation errors

#### Scenario: Unauthenticated request is rejected
- **WHEN** a request to `/preferences` lacks a valid JWT token
- **THEN** the endpoint returns HTTP 401 Unauthorized

### Requirement: GET /preferences returns the current user's preferences
The system SHALL provide an HTTP GET endpoint at `/preferences` that requires JWT authentication and returns the authenticated user's stored `investor_type`, `crypto_assets`, and `content_types`.

#### Scenario: Onboarded user retrieves their preferences
- **WHEN** an authenticated, onboarded user GETs `/preferences`
- **THEN** the endpoint returns HTTP 200 with their `investor_type`, `crypto_assets`, and `content_types`

#### Scenario: Not-yet-onboarded user has no preferences
- **WHEN** an authenticated user who has not completed onboarding GETs `/preferences`
- **THEN** the endpoint returns HTTP 404 Not Found

#### Scenario: Unauthenticated request is rejected
- **WHEN** a request to `/preferences` lacks a valid JWT token
- **THEN** the endpoint returns HTTP 401 Unauthorized
</content>
