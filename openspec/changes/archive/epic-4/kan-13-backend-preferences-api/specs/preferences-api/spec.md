## Purpose

Enables authenticated users to manage their preferences (trading strategy, risk level, notifications, etc.) through REST API endpoints that are protected by JWT authentication.

## ADDED Requirements

### Requirement: GET /preferences endpoint
The system SHALL provide a `GET /preferences` endpoint that retrieves the authenticated user's preferences. The endpoint requires a valid JWT token in the Authorization header.

#### Scenario: User successfully retrieves preferences
- **WHEN** an authenticated user makes a GET request to `/preferences` with a valid JWT token
- **THEN** the system returns a 200 response with the user's preferences JSON object

#### Scenario: Unauthenticated request is rejected
- **WHEN** a request is made to `/preferences` without a valid JWT token
- **THEN** the system returns a 401 Unauthorized response

#### Scenario: Preferences not found
- **WHEN** an authenticated user who has not yet saved preferences makes a GET request
- **THEN** the system returns a 404 Not Found response

### Requirement: POST /preferences endpoint (upsert)
The system SHALL provide a `POST /preferences` endpoint that creates or updates the authenticated user's preferences. If preferences do not exist, they are created. If they exist, they are updated. The endpoint requires a valid JWT token and SHALL set the user's `onboarded` flag to `true` upon successful save.

#### Scenario: User creates preferences for the first time
- **WHEN** an authenticated user POSTs valid preference data to `/preferences` without existing preferences
- **THEN** the system creates a new preference record and returns 201 Created with the saved preferences, and sets user.onboarded = true

#### Scenario: User updates existing preferences
- **WHEN** an authenticated user POSTs valid preference data to `/preferences` with existing preferences
- **THEN** the system updates the preference record and returns 200 OK with the updated preferences

#### Scenario: Unauthenticated request is rejected
- **WHEN** a POST request is made to `/preferences` without a valid JWT token
- **THEN** the system returns a 401 Unauthorized response

#### Scenario: Invalid preference data is rejected
- **WHEN** an authenticated user POSTs invalid or malformed preference data
- **THEN** the system returns a 400 Bad Request response with validation error details

### Requirement: Preferences data model
Preferences SHALL include fields for: trading strategy, risk tolerance/level, notification preferences, and any other user-configurable settings. All fields except strategy are optional. Strategy is required.

#### Scenario: Valid preferences with required fields
- **WHEN** preference data includes the required trading strategy field
- **THEN** the system accepts the data as valid

#### Scenario: Missing required strategy field
- **WHEN** preference data omits the required trading strategy field
- **THEN** the system rejects the data with validation error

#### Scenario: Optional fields can be omitted
- **WHEN** preference data omits optional fields like notifications or risk level
- **THEN** the system accepts the data without those fields

### Requirement: Request and response validation
The system SHALL validate all incoming preference requests using a schema. Response data SHALL conform to the same schema. Invalid requests receive detailed validation error messages.

#### Scenario: Schema validation on request
- **WHEN** a POST request contains data that violates the preferences schema
- **THEN** the system returns 400 Bad Request with field-level validation errors

#### Scenario: Response follows schema
- **WHEN** preferences are successfully saved or retrieved
- **THEN** the response JSON conforms to the preferences schema
