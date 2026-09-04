## Context

The backend is built with FastAPI, SQLAlchemy ORM, and PostgreSQL. JWT authentication is already implemented for protected endpoints. The User model exists and needs to be extended with an `onboarded` flag. See proposal.md for motivation.

## Goals / Non-Goals

**Goals:**
- Create a persistent UserPreferences model in the database
- Implement GET /preferences endpoint to retrieve user preferences (authenticated)
- Implement POST /preferences endpoint to create/update preferences (upsert, authenticated)
- Mark users as onboarded when preferences are first saved
- Add comprehensive service and endpoint tests
- Validate all preference data with clear error messages

**Non-Goals:**
- Frontend preferences UI (handled in separate epic)
- Advanced preference features like versioning or audit trail
- Bulk preference operations or admin management endpoints
- Real-time preference updates or webhooks

## Decisions

### Decision: UserPreferences as a separate SQLAlchemy model
**Rationale**: Separation of concerns. Preferences are a distinct domain with their own lifecycle, validation rules, and potentially complex nested data (like notification settings). A dedicated model makes the codebase clearer and allows independent testing.

**Alternatives Considered:**
- Store preferences as JSON in the User model: simpler but loses schema validation and makes queries harder
- Use a generic key-value store: overkill for this scope

### Decision: Upsert logic in POST /preferences
**Rationale**: Simplifies the client - they don't need to check if preferences exist or call different endpoints. One endpoint for create and update reduces API surface and is more intuitive for onboarding flows.

**Implementation approach**: Query for existing preferences by user_id, either create new or update existing, then set user.onboarded = true.

**Alternatives Considered:**
- Separate POST (create) and PATCH (update) endpoints: more RESTful but adds client complexity during onboarding

### Decision: Notification preferences stored as JSON
**Rationale**: Notification settings may grow over time (email, push, SMS, in-app) with different granularity per channel. JSON provides flexibility without schema migration. Validation happens at the application layer.

**Alternatives Considered:**
- Separate boolean columns for each notification type: inflexible, requires migrations for new types
- String enum field: limits extensibility

### Decision: Trade strategy is required, other fields optional
**Rationale**: Trade strategy is the core user signal needed for the system to function. Risk level and notifications are nice-to-have and can be added later or left at defaults.

**Alternatives Considered:**
- All fields required: blocks users who don't want to configure everything
- All fields optional: unclear if preferences were intentionally minimal or incomplete

### Decision: Use Alembic migration for UserPreferences table
**Rationale**: Consistent with existing database versioning strategy. Reversible and trackable in git.

### Decision: Cascade delete on User deletion
**Rationale**: Preferences are owned by a user. If the user is deleted, their preferences should be deleted too. Simplifies cleanup and prevents orphaned records.

## Risks / Trade-offs

**[Risk: User.onboarded flag couples preferences creation to onboarding status]** → Mitigation: Document clearly that onboarded=true means preferences exist, not that the full onboarding (e.g., KYC) is complete. If future business logic requires a different onboarding status, create a separate flag.

**[Risk: Notification preferences as JSON lacks schema validation at DB level]** → Mitigation: Validate structure in application code and tests. Consider JSON Schema validation in the future if needed.

**[Risk: No audit trail for preference changes]** → Mitigation: Log preference updates at the application level if auditability becomes important later.

**[Trade-off: Upsert logic hides whether a record was created or updated]** → Mitigation: Application can track this via `created_at` vs `updated_at` if needed. Client doesn't need to know the difference.

## Migration Plan

1. Write and apply Alembic migration to create user_preferences table
2. Add onboarded column to users table (if not already exists)
3. Implement PreferencesService with CRUD and upsert logic
4. Implement Pydantic schemas for request/response validation
5. Add GET and POST endpoints under /preferences route
6. Write unit tests for service
7. Write integration tests for endpoints
8. Verify no breaking changes to existing endpoints
9. Merge and deploy

Rollback: Revert Alembic migration, remove endpoints from FastAPI router.

## Open Questions

- Should GET /preferences return a 404 or an empty default preferences object if the user has not saved preferences yet? (Spec assumes 404; confirm with product/team)
- What are the specific fields within notification_preferences JSON? (Can be extended after initial implementation)
