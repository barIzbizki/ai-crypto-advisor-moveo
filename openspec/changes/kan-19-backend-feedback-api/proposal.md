## Why

Users need to vote on and provide feedback for content displayed in the dashboard (recommendations, coins, etc.). This feedback enables the system to learn from user interactions and improve recommendation quality. The Feedback API complements the completed Preferences API and Authentication system to provide a complete onboarding and personalization flow.

## What Changes

- **New Database Model**: `Feedback` table with `user_id` and `content_id` (unique constraint on user+content pair to ensure one vote per user per content item)
- **Database Migration**: Alembic migration to create the `feedback` table with appropriate constraints and indexes
- **Feedback Schemas**: Pydantic models for `FeedbackCreate`, `FeedbackUpdate`, and `FeedbackResponse` with validation
- **Service Layer**: `FeedbackService` with methods for create, update, upsert, and fetching votes with associated dashboard content
- **API Endpoint**: `POST /feedback` (JWT-protected) that accepts a feedback submission, returns existing votes for that content + dashboard content details
- **Testing**: Comprehensive service layer and endpoint integration tests covering auth, validation, upsert behavior, and constraint enforcement

## Capabilities

### New Capabilities

- `feedback-api`: POST /feedback endpoint for submitting/updating user feedback votes on content, returning existing votes with dashboard content
- `feedback-model`: Feedback database model with composite unique constraint on user_id + content_id

### Modified Capabilities

- `user-model`: Add one-to-many relationship from User to Feedback (cascade delete orphans)

## Impact

**Backend Code**:
- `backend/models/feedback.py` (new)
- `backend/schemas/feedback.py` (new)
- `backend/services/feedback.py` (new)
- `backend/routers/feedback.py` (new)
- `backend/models/user.py` (add relationship)
- `backend/alembic/versions/` (new migration)
- `backend/tests/test_feedback_service.py` (new)
- `backend/tests/test_feedback_router.py` (new)
- `backend/main.py` (register feedback router)

**API**:
- New endpoint: `POST /feedback` (upsert pattern, JWT-protected)
- Response includes list of existing votes for the content + dashboard content (format TBD, pending dashboard data model)

**Database**:
- New `feedback` table with composite unique constraint
- New index on `(user_id, content_id)`

**Note**: "Dashboard content" structure is currently undefined in the codebase — this spec assumes it will be defined separately or generically as `content_id: str` references until a concrete dashboard data model exists.
