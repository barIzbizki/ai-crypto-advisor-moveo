## 1. Database Setup

- [x] 1.1 Create Alembic migration to add `onboarded` boolean column to users table (default false)
- [x] 1.2 Create Alembic migration to create user_preferences table with columns: id, user_id (unique FK), trading_strategy, risk_level, notification_preferences, created_at, updated_at
- [x] 1.3 Add indexes on user_id for efficient lookup
- [x] 1.4 Apply migrations locally and verify table structure

## 2. Models

- [x] 2.1 Create UserPreferences SQLAlchemy model with relationship to User
- [x] 2.2 Add one-to-one relationship from User to UserPreferences with cascade delete
- [x] 2.3 Verify User model has onboarded field (add if missing)

## 3. Schemas and Validation

- [x] 3.1 Create Pydantic request schema for preferences (PreferencesCreate/PreferencesUpdate)
- [x] 3.2 Create Pydantic response schema for preferences (PreferencesResponse)
- [x] 3.3 Add validation: trading_strategy is required, others optional
- [x] 3.4 Add validation: notification_preferences JSON must match expected structure (if defined) or accept any JSON
- [x] 3.5 Add validation: risk_level must be one of allowed values (enum)

## 4. Service Layer

- [x] 4.1 Create PreferencesService with get_by_user_id method
- [x] 4.2 Create PreferencesService.create method
- [x] 4.3 Create PreferencesService.update method
- [x] 4.4 Create PreferencesService.upsert method that creates or updates and sets user.onboarded = True
- [x] 4.5 Add error handling for database errors and validation failures

## 5. API Endpoints

- [x] 5.1 Create GET /preferences endpoint that requires JWT authentication
- [x] 5.2 Return 200 with preferences if they exist, 404 if they don't
- [x] 5.3 Return 401 if JWT is missing or invalid
- [x] 5.4 Create POST /preferences endpoint that requires JWT authentication
- [x] 5.5 POST endpoint upserts preferences and sets user.onboarded = true
- [x] 5.6 POST endpoint returns 201 Created on new preferences, 200 OK on update
- [x] 5.7 POST endpoint returns 400 Bad Request with validation errors on invalid input

## 6. Testing - Service Layer

- [x] 6.1 Write unit test for get_by_user_id (existing, non-existing)
- [x] 6.2 Write unit test for create (success, validation errors)
- [x] 6.3 Write unit test for update (success, not found, validation errors)
- [x] 6.4 Write unit test for upsert (creates new, updates existing, sets onboarded=true)
- [x] 6.5 Write unit test for unique constraint on user_id (prevent duplicate)

## 7. Testing - Endpoint Integration

- [x] 7.1 Write integration test for GET /preferences (authenticated, returns 200)
- [x] 7.2 Write integration test for GET /preferences (authenticated, not found returns 404)
- [x] 7.3 Write integration test for GET /preferences (unauthenticated returns 401)
- [x] 7.4 Write integration test for POST /preferences (creates new, returns 201)
- [x] 7.5 Write integration test for POST /preferences (updates existing, returns 200)
- [x] 7.6 Write integration test for POST /preferences (sets user.onboarded=true)
- [x] 7.7 Write integration test for POST /preferences (invalid data returns 400 with errors)
- [x] 7.8 Write integration test for POST /preferences (unauthenticated returns 401)

## 8. Documentation and Cleanup

- [x] 8.1 Update API documentation / OpenAPI schema if applicable
- [x] 8.2 Add docstrings to PreferencesService methods
- [x] 8.3 Review code for style and consistency with project conventions
- [x] 8.4 Test manual scenarios: create preferences, retrieve preferences, update preferences, unauthenticated access
