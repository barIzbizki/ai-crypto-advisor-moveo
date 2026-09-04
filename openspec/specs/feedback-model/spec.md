# feedback-model Specification

## Purpose
TBD - added by archiving change kan-65-frontend-voting-ui. Update Purpose after archive.

## Requirements

### Requirement: Feedback table stores user votes on content
The system SHALL create a `feedback` table in the database with columns: `id` (primary key), `user_id` (foreign key to `users.id`), `content_id` (string identifier for dashboard content), `is_upvote` (boolean vote field — `true` for a thumbs-up vote, `false` for a thumbs-down vote), `created_at` (timestamp), and `updated_at` (timestamp). Each row represents one user's vote on one content item.

#### Scenario: New feedback record is persisted
- **WHEN** a new feedback vote is created for a user and content item
- **THEN** the database stores the record with auto-generated `id`, `created_at`, and `updated_at` timestamps

#### Scenario: Feedback is retrieved by user and content
- **WHEN** querying for feedback by user_id and content_id
- **THEN** the database returns at most one record (enforced by unique constraint)
</content>
