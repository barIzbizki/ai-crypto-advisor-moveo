## 1. Database Setup

- [x] 1.1 Create `backend/models/feedback.py` with Feedback SQLAlchemy model (id, user_id FK, content_id, rating, created_at, updated_at, user relationship)
- [x] 1.2 Add composite unique constraint `UniqueConstraint("user_id", "content_id")` to Feedback model
- [x] 1.3 Update `backend/models/__init__.py` to export Feedback model
- [x] 1.4 Create Alembic migration file to create `feedback` table with all columns, FK constraint, indexes, and unique constraint
- [x] 1.5 Run migration locally to verify table structure and constraints

## 2. Schemas & Validation

- [x] 2.1 Create `backend/schemas/feedback.py` with Pydantic models: FeedbackCreate, FeedbackUpdate, FeedbackResponse
- [x] 2.2 Add validation to FeedbackCreate (required: content_id, rating; optional fields as needed)
- [x] 2.3 Add `model_config = ConfigDict(from_attributes=True)` to FeedbackResponse for ORM serialization
- [x] 2.4 Update `backend/schemas/__init__.py` to export feedback schemas

## 3. Service Layer

- [x] 3.1 Create `backend/services/feedback.py` with FeedbackService class
- [x] 3.2 Implement `FeedbackService.get_by_user_and_content(user_id, content_id)` to fetch existing vote
- [x] 3.3 Implement `FeedbackService.create(user_id, content_id, rating_data)` to insert new feedback
- [x] 3.4 Implement `FeedbackService.update(feedback_obj, rating_data)` to modify existing feedback
- [x] 3.5 Implement `FeedbackService.upsert(user_id, content_id, rating_data)` to create or update with return tuple (feedback, is_new)
- [x] 3.6 Implement `FeedbackService.get_votes_for_content(content_id)` to return all votes on a content item
- [x] 3.7 Update `backend/services/__init__.py` to export FeedbackService

## 4. API Endpoint

- [x] 4.1 Create `backend/routers/feedback.py` with APIRouter
- [x] 4.2 Define POST /feedback endpoint with JWT auth (`current_user: User = Depends(get_current_user)`)
- [x] 4.3 Parse request body as FeedbackCreate, extract user_id from current_user
- [x] 4.4 Call FeedbackService.upsert() to create or update feedback
- [x] 4.5 Query dashboard_content (if model exists) or return null placeholder for now
- [x] 4.6 Build FeedbackResponse with existing votes list + dashboard content
- [x] 4.7 Set response.status_code to 201 (create) or 200 (update) based on is_new flag
- [x] 4.8 Register feedback router in `backend/main.py` via `app.include_router(feedback.router)`

## 5. Service Layer Tests

- [x] 5.1 Create `backend/tests/test_feedback_service.py`
- [x] 5.2 Add test: create new feedback record and verify it's in DB
- [x] 5.3 Add test: update existing feedback and verify created_at unchanged, updated_at changed
- [x] 5.4 Add test: upsert on existing vote returns is_new=False
- [x] 5.5 Add test: upsert on new vote returns is_new=True
- [x] 5.6 Add test: composite unique constraint prevents duplicate (user_id, content_id) inserts
- [x] 5.7 Add test: get_votes_for_content returns all votes for a given content_id
- [x] 5.8 Add test: foreign key constraint prevents feedback with non-existent user_id

## 6. Endpoint Integration Tests

- [x] 6.1 Create `backend/tests/test_feedback_router.py`
- [x] 6.2 Add fixture/helper for registering test user and obtaining JWT token (reuse from auth tests)
- [x] 6.3 Add test: unauthenticated POST /feedback returns 401 Unauthorized
- [x] 6.4 Add test: authenticated user POSTs valid feedback, receives 201 Created
- [x] 6.5 Add test: response includes submitted feedback record with correct fields
- [x] 6.6 Add test: second POST from same user on same content returns 200 Updated (upsert)
- [x] 6.7 Add test: response includes existing votes list (initially empty on first feedback)
- [x] 6.8 Add test: multiple users can vote on same content (different user_ids, same content_id)
- [x] 6.9 Add test: invalid content_id returns 422 Unprocessable Entity with validation error
- [x] 6.10 Add test: missing required field returns 422 with field validation error
- [x] 6.11 Add test: response includes dashboard_content field (null for now, TBD structure)

## 7. Integration & Cleanup

- [x] 7.1 Run full test suite (`pytest backend/tests`) and verify all tests pass
- [x] 7.2 Verify type checking (`mypy backend` or similar if configured)
- [x] 7.3 Verify code style (`ruff check backend` or similar)
- [x] 7.4 Add docstrings to service methods explaining upsert, return values, and exceptions
- [x] 7.5 Update API documentation or README if needed (e.g., /feedback endpoint usage)
- [x] 7.6 Review & merge to feature branch, ready for PR
