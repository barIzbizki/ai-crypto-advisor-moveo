## Purpose

Defines the Feedback database model and storage contract, enabling persistent storage of user votes on content with appropriate uniqueness and referential integrity constraints.

## ADDED Requirements

### Requirement: Feedback table stores user votes on content
The system SHALL create a `feedback` table in the database with columns: `id` (primary key), `user_id` (foreign key to `users.id`), `content_id` (string identifier for dashboard content), `rating` or equivalent vote field, `created_at` (timestamp), and `updated_at` (timestamp). Each row represents one user's vote on one content item.

#### Scenario: New feedback record is persisted
- **WHEN** a new feedback vote is created for a user and content item
- **THEN** the database stores the record with auto-generated `id`, `created_at`, and `updated_at` timestamps

#### Scenario: Feedback is retrieved by user and content
- **WHEN** querying for feedback by user_id and content_id
- **THEN** the database returns at most one record (enforced by unique constraint)

### Requirement: Composite unique constraint prevents duplicate user+content feedback
The system SHALL enforce a unique constraint on the pair (`user_id`, `content_id`) to ensure a user can vote on a given content item at most once. Any attempt to insert or update a record that violates this constraint raises an integrity error.

#### Scenario: Duplicate vote attempt is rejected
- **WHEN** attempting to insert feedback with a (user_id, content_id) pair that already exists
- **THEN** the database raises an integrity constraint violation error

#### Scenario: Different users can vote on same content
- **WHEN** two different users submit feedback on the same content item
- **THEN** both records are stored successfully with the same content_id but different user_ids

#### Scenario: Same user can vote on different content
- **WHEN** a user submits feedback on multiple different content items
- **THEN** all records are stored successfully with the same user_id but different content_ids

### Requirement: Foreign key to users table enforces referential integrity
The system SHALL define `user_id` as a foreign key pointing to `users.id` with cascade delete. If a user is deleted, all their feedback records are automatically removed.

#### Scenario: User deletion cascades to feedback
- **WHEN** a user account is deleted from the database
- **THEN** all feedback records with that user_id are automatically deleted

#### Scenario: Orphaned feedback cannot be inserted
- **WHEN** attempting to insert feedback with a user_id that does not exist in the users table
- **THEN** the database raises a foreign key constraint error

### Requirement: Feedback model tracks temporal metadata
The system SHALL record `created_at` (immutable timestamp of creation) and `updated_at` (timestamp updated on every modification) for each feedback record. Both use server time (timezone-aware) and update automatically without application intervention.

#### Scenario: Timestamps auto-populate on creation
- **WHEN** a new feedback record is inserted
- **THEN** `created_at` and `updated_at` are both set to the current server time

#### Scenario: Updated_at changes on vote modification
- **WHEN** an existing feedback record's rating is updated
- **THEN** `updated_at` changes to the current server time, but `created_at` remains unchanged
