## Purpose

Provides a production deployment of the FastAPI backend on Render with a managed Postgres database, so the deployed service is reachable, correctly configured, and running the same schema/behavior as local development.

## ADDED Requirements

### Requirement: Production Service Provisioning
The backend SHALL run as a hosted web service with a managed production Postgres database provisioned independently of any local/development database. The service SHALL start via a production-appropriate command that binds to the platform-assigned port.

#### Scenario: Production service starts successfully
- **WHEN** the hosted backend service is deployed and started
- **THEN** the process starts without error and begins accepting HTTP requests on the platform-assigned port

#### Scenario: Production database is isolated from local development
- **WHEN** the hosted backend connects to its configured database
- **THEN** it connects to the managed production database instance, not a local or development database

### Requirement: Production Configuration
The production deployment SHALL be configured entirely through environment variables — database connection string, secret key, environment name, and allowed CORS origins — with no production secrets or connection details hardcoded in source. CORS origins SHALL be restricted to the deployed frontend's origin(s) rather than defaulting to local development origins.

#### Scenario: Backend loads production configuration at startup
- **WHEN** the hosted backend starts with production environment variables set (database URL, secret key, environment, CORS origins)
- **THEN** it uses those values rather than local-development defaults

#### Scenario: CORS rejects unlisted origins
- **WHEN** a browser request to the hosted backend originates from an origin not included in the configured production CORS origins
- **THEN** the response does not grant that origin cross-origin access

#### Scenario: Missing required configuration fails startup
- **WHEN** the hosted backend starts without a required production setting (e.g. no secret key)
- **THEN** startup fails with an error rather than silently falling back to an insecure default

### Requirement: Production Schema Migration
The production database's schema SHALL be brought up to date by applying the project's version-controlled migrations, and SHALL match the schema defined by the application's ORM models.

#### Scenario: Applying migrations to a fresh production database
- **WHEN** the migration upgrade command is run against a newly provisioned, empty production database
- **THEN** all migrations apply successfully in order and the resulting schema matches the current ORM models

#### Scenario: Re-running migrations is safe
- **WHEN** the migration upgrade command is run again against a production database that already has all migrations applied
- **THEN** the command completes successfully with no schema changes and no error

### Requirement: Post-Deploy Verification
After deployment, the hosted backend's health, API documentation, and core API behavior SHALL be independently verifiable without redeploying.

#### Scenario: Health check succeeds
- **WHEN** a request is made to the hosted backend's health endpoint
- **THEN** it responds indicating the service is healthy

#### Scenario: API documentation is reachable
- **WHEN** a request is made to the hosted backend's OpenAPI documentation endpoint
- **THEN** it responds successfully with the interactive API documentation

#### Scenario: Core API endpoints work against the production database
- **WHEN** a client exercises an existing API endpoint (e.g. registering or authenticating a user) against the hosted backend
- **THEN** the request completes successfully and the effect is persisted in the production database
