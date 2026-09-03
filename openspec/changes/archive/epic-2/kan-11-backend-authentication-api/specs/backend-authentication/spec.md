## Purpose

Lets a client register an account, log in to receive a bearer token, and use that token to identify itself as a specific user on subsequent requests to the backend API.

## ADDED Requirements

### Requirement: User Registration
The system SHALL allow a client to register a new user with an email and password via `POST /auth/register`, storing the password only in hashed form, and SHALL reject registration with an email that is already in use.

#### Scenario: Successful registration
- **WHEN** a client submits `POST /auth/register` with a unique email and a password
- **THEN** the system creates a user record with the password stored as a hash (never in plain text) and returns the created user's public fields (excluding the password/hash) with a 2xx status

#### Scenario: Duplicate email rejected
- **WHEN** a client submits `POST /auth/register` with an email that already belongs to an existing user
- **THEN** the system rejects the request with a 4xx error and does not create a second user record

### Requirement: User Login
The system SHALL allow a registered user to authenticate with their email and password via `POST /auth/login`, and SHALL issue a signed JWT access token on success.

#### Scenario: Successful login
- **WHEN** a client submits `POST /auth/login` with an email and password matching a registered user
- **THEN** the system returns a signed JWT access token and a token type, with a 2xx status

#### Scenario: Invalid credentials rejected
- **WHEN** a client submits `POST /auth/login` with an email that does not exist, or a password that does not match the registered user's password
- **THEN** the system rejects the request with a 401 error and does not issue a token

### Requirement: Password Storage
The system SHALL never persist or return a user's plaintext password. Passwords SHALL be verified only via a one-way hash comparison.

#### Scenario: Password hash never exposed
- **WHEN** any API response includes user data (registration, current-user lookup, or otherwise)
- **THEN** the response does not contain the plaintext password or the password hash

### Requirement: Authenticated Current-User Lookup
The system SHALL provide `GET /auth/me`, which returns the profile of the user identified by a valid bearer token, and SHALL reject the request if the token is missing, malformed, expired, or otherwise invalid.

#### Scenario: Valid token returns current user
- **WHEN** a client calls `GET /auth/me` with a valid, non-expired access token for a registered user in the `Authorization` header
- **THEN** the system returns that user's public profile fields with a 2xx status

#### Scenario: Missing or invalid token rejected
- **WHEN** a client calls `GET /auth/me` with no `Authorization` header, a malformed token, or an expired/invalid token
- **THEN** the system rejects the request with a 401 error and does not return any user data
