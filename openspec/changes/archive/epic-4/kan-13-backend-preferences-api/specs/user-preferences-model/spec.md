## Purpose

Defines the database model and schema for persisting user preferences including trading strategy, risk tolerance, and notification settings. Each user has at most one preferences record.

## ADDED Requirements

### Requirement: UserPreferences database model
The system SHALL have a `UserPreferences` database model with the following attributes: id (primary key), user_id (foreign key to User, unique), trading_strategy (string, required), risk_level (string, optional), notification_preferences (JSON, optional), created_at (timestamp), updated_at (timestamp).

#### Scenario: UserPreferences table structure
- **WHEN** the database migration is applied
- **THEN** a user_preferences table exists with all required columns and user_id is unique

#### Scenario: User can have at most one preferences record
- **WHEN** attempting to create a second preferences record for the same user
- **THEN** the system enforces the unique constraint on user_id and prevents the insert

### Requirement: Alembic migration for UserPreferences
The system SHALL include an Alembic migration that creates the `user_preferences` table with appropriate indexes and constraints. The migration is version-controlled and can be rolled forward and backward.

#### Scenario: Migration can be applied
- **WHEN** Alembic upgrade is run
- **THEN** the user_preferences table is created with all columns and indexes

#### Scenario: Migration can be rolled back
- **WHEN** Alembic downgrade is run
- **THEN** the user_preferences table is dropped

### Requirement: Relationship between User and UserPreferences
The system SHALL establish a one-to-one relationship between User and UserPreferences models. Deleting a User SHALL cascade-delete their associated preferences (or prevent deletion if preferences exist, depending on business rule).

#### Scenario: User to preferences relationship
- **WHEN** a User is created, they may optionally have a UserPreferences record
- **THEN** the relationship is enforced at the database level via foreign key

#### Scenario: Data integrity on delete
- **WHEN** a User is deleted who has associated preferences
- **THEN** the system handles the cascade appropriately (delete or prevent)

### Requirement: Preferences persistence
UserPreferences records SHALL be persistent, searchable by user_id, and support efficient retrieval and update operations.

#### Scenario: Preferences can be retrieved by user
- **WHEN** a preferences record exists for a user_id
- **THEN** the system can efficiently query and retrieve it

#### Scenario: Preferences can be updated
- **WHEN** a preferences record exists
- **THEN** the system can update any field(s) and persist the changes
