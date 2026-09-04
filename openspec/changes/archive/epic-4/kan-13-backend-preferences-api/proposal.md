## Why

Users need a way to configure and persist their preferences during onboarding and after. Currently, the system has no API or data model to store user preferences like trading strategy, risk tolerance, or notification settings. This blocks the onboarding flow and prevents users from customizing their experience.

## What Changes

- Add a `UserPreferences` database model with Alembic migration to store preferences for each user
- Create request/response schemas with validation for preferences data
- Implement a `POST /preferences` endpoint (upsert) to create or update preferences and mark the user as onboarded
- Implement a `GET /preferences` endpoint (protected by JWT) to retrieve the user's preferences
- Add comprehensive service and endpoint tests

## Capabilities

### New Capabilities
- `preferences-api`: REST API endpoints for managing user preferences (GET /preferences, POST /preferences)
- `user-preferences-model`: Database model and schema for storing user preferences

### Modified Capabilities
- `user-model`: The User model will have an `onboarded` flag that is set to `true` when preferences are first created

## Impact

- **Database**: New `user_preferences` table via Alembic migration
- **Backend API**: Two new endpoints under `/preferences` path
- **Authentication**: Preferences endpoints require valid JWT token
- **Onboarding Flow**: Enables completion of user onboarding when preferences are saved
- **User Model**: Adds `onboarded` boolean flag (will be set by preferences endpoint)
