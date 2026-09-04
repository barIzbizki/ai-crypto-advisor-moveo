## Purpose

Lets a person create an account, log in, stay signed in across page reloads, and keeps pages that require a signed-in user unreachable to anyone who is not authenticated.

## ADDED Requirements

### Requirement: Signup Form
The system SHALL present a signup form collecting an email and password, SHALL validate the input client-side before submission, and SHALL show the server's rejection reason when registration fails.

#### Scenario: Successful signup
- **WHEN** a person submits the signup form with a valid, unused email and a valid password
- **THEN** the system creates the account, signs the person in, and navigates them away from the signup form

#### Scenario: Invalid input blocked before submission
- **WHEN** a person submits the signup form with a malformed email or a password that fails validation
- **THEN** the system shows a validation error next to the offending field(s) and does not submit the form

#### Scenario: Duplicate email rejected
- **WHEN** a person submits the signup form with an email that is already registered
- **THEN** the system shows an error indicating the email is already in use and the person remains on the signup form, signed out

### Requirement: Login Form
The system SHALL present a login form collecting an email and password, SHALL validate the input client-side before submission, and SHALL show an error when authentication fails without revealing whether the email or the password was wrong.

#### Scenario: Successful login
- **WHEN** a person submits the login form with the email and password of a registered account
- **THEN** the system signs the person in and navigates them to the page they originally requested, or a default landing page

#### Scenario: Invalid input blocked before submission
- **WHEN** a person submits the login form with a malformed email or an empty password
- **THEN** the system shows a validation error next to the offending field(s) and does not submit the form

#### Scenario: Invalid credentials rejected
- **WHEN** a person submits the login form with an email/password combination that the server rejects
- **THEN** the system shows a generic invalid-credentials error and the person remains on the login form, signed out

### Requirement: Session Persistence
The system SHALL keep a person signed in across page reloads within the same browser as long as their access token remains valid, and SHALL treat an expired or otherwise rejected token as signed out.

#### Scenario: Session survives a page reload
- **WHEN** a signed-in person reloads or revisits the application in the same browser before their token expires
- **THEN** the system restores their signed-in session without requiring them to log in again

#### Scenario: Expired or invalid token clears the session
- **WHEN** the application makes a request using a stored token and the server rejects it as expired or invalid
- **THEN** the system signs the person out and clears the stored session

### Requirement: Sign Out
The system SHALL let a signed-in person sign out, clearing their session so they are treated as unauthenticated afterward.

#### Scenario: Sign out clears the session
- **WHEN** a signed-in person triggers sign out
- **THEN** the system clears the stored session and subsequent requests are made as an unauthenticated visitor

### Requirement: Authenticated Requests
The system SHALL attach the signed-in person's credentials to every request made to an endpoint that requires authentication, and SHALL make no such request when no one is signed in.

#### Scenario: Authenticated request includes credentials
- **WHEN** a signed-in person triggers an action that calls an endpoint requiring authentication
- **THEN** the request includes the current session's credentials

### Requirement: Protected Routes
The system SHALL restrict designated routes to signed-in people and SHALL redirect an unauthenticated visitor who requests such a route to the login page, returning them to the originally requested route after a successful login.

#### Scenario: Unauthenticated visitor redirected
- **WHEN** a visitor who is not signed in requests a route designated as protected
- **THEN** the system redirects them to the login page instead of rendering the protected route

#### Scenario: Authenticated visitor allowed through
- **WHEN** a signed-in person requests a route designated as protected
- **THEN** the system renders that route

#### Scenario: Return to originally requested route after login
- **WHEN** a visitor is redirected to the login page from a protected route and then successfully logs in
- **THEN** the system navigates them to the route they originally requested
