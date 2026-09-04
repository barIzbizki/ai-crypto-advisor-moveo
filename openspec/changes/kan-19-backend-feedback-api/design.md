## Context

The Preferences API (KAN-13) established a mature pattern for user-specific data: SQLAlchemy ORM models, Pydantic schemas, a service layer with business logic, FastAPI routers with JWT auth dependency injection, Alembic migrations, and comprehensive test coverage (service + router integration tests with in-memory SQLite).

The Feedback feature mirrors this pattern with one key difference: instead of a one-to-one User relationship (Preferences), Feedback is one-to-many—users vote on multiple content items, and each content item may receive votes from multiple users. This introduces a composite unique constraint (`user_id`, `content_id`) not yet used in this codebase.

Current state:
- User model exists with JWT auth and Preferences one-to-one relationship
- Backend project structure is stable: `/backend/{models,schemas,services,routers,alembic}` 
- Testing infrastructure: in-memory SQLite with pytest, dependency overrides for auth
- Dashboard concept (data model) is undefined; Feedback refers generically to content by `content_id: str`

## Goals / Non-Goals

**Goals:**
- Implement Feedback model, schemas, service, and API following Preferences pattern
- Enforce user+content uniqueness at both schema (Pydantic) and database (constraint) layers
- Protect `/feedback` endpoint with JWT auth, reuse `get_current_user` dependency
- Use upsert pattern (create if new, update if exists) to simplify client logic
- Return existing votes + dashboard content in response (structure TBD pending dashboard data model)
- Achieve comprehensive test coverage (service layer unit tests + endpoint integration tests)
- Use Alembic migration for schema setup, following existing naming conventions

**Non-Goals:**
- Do NOT implement a dashboard data model (deferred pending separate initiative)
- Do NOT add pagination or filtering to `/feedback` endpoint (defer if votes list grows large)
- Do NOT implement soft deletes or audit logs (not in Preferences pattern; keep it simple)
- Do NOT expose internal database IDs or migration details via API responses

## Decisions

### 1. Mirror the Preferences API pattern for code organization and layering

**Rationale**: Preferences API is the established template in this repo. Consistent patterns reduce cognitive load for maintainers and leverage existing test/deployment infrastructure.

**Implementation**:
- One file per layer per domain: `models/feedback.py`, `schemas/feedback.py`, `services/feedback.py`, `routers/feedback.py`
- Service layer holds business logic (upsert, create/update/get); router stays thin (validation, auth, HTTP plumbing)
- Reuse `get_current_user` from `routers/auth.py` via `Depends()`
- Register router in `main.py` via `app.include_router(feedback.router)`

**Alternatives considered:**
- Inline service logic in the router: rejected (violates layering used throughout backend, harder to test)
- Separate `create` + `update` endpoints: rejected (simpler UX with single upsert endpoint)

### 2. Use composite unique constraint (`user_id`, `content_id`) at both SQLAlchemy and database levels

**Rationale**: Prevents the same user from voting multiple times on the same content. Composite constraint is new to this codebase but is the minimal, correct solution for the one-to-many voter pattern (unlike Preferences' single-column unique on `user_id`).

**Implementation**:
- SQLAlchemy: `UniqueConstraint("user_id", "content_id", name="uq_feedback_user_content")` in `Feedback.__table_args__`
- Alembic migration: `op.create_unique_constraint(...)` for explicit control (autogenerate may not capture it cleanly)
- Service layer (`upsert` method): check existence before insert to provide user-friendly error vs raw DB constraint error
- Schema validation: Pydantic validates `content_id` is non-empty string; DB constraint is defense-in-depth

**Alternatives considered:**
- Application-level check only (no DB constraint): rejected (race conditions if two requests arrive simultaneously; DB constraint is safety net)
- Allow duplicate votes, discard oldest: rejected (violates spec requirement for uniqueness)

### 3. Implement upsert pattern in service layer (check-then-update or get-or-create)

**Rationale**: Single endpoint simplifies client logic. Upsert (update if exists, create if new) is a common pattern in Preferences and elsewhere; reuse the service pattern here.

**Implementation**:
- `FeedbackService.upsert(user_id, content_id, rating)`: calls `get_by_user_and_content()` first; if exists, updates; otherwise creates
- Returns tuple `(feedback_obj, is_new)` so router can set correct status code (201 for create, 200 for update)
- Mutation response: endpoint modifies `response.status_code` to distinguish (same pattern as Preferences)

**Alternatives considered:**
- Separate POST (create) and PUT (update) endpoints: rejected (client must guess which to call; upsert is simpler)

### 4. Define dashboard content response generically (pending data model)

**Rationale**: Dashboard data model (coins, recommendations, etc.) does not yet exist in this repo. Spec requires returning "dashboard content with votes," but that content structure is TBD. To unblock the Feedback API, include a generic `content_id` and a placeholder for `dashboard_content` in the response.

**Implementation**:
- Response schema includes `content_id: str` and `dashboard_content: dict | None` (optional, TBD structure)
- Endpoint returns `dashboard_content: null` for now (or attempts a join if a dashboard table exists at implementation time)
- Marked in proposal as open question: exact schema to be defined when dashboard model is finalized

**Alternatives considered:**
- Block Feedback API until dashboard model exists: rejected (Feedback is independent; can proceed in parallel)
- Hardcode placeholder JSON: rejected (would need updating later; `dict | None` is cleaner)

### 5. Reuse existing JWT auth and dependency injection patterns

**Rationale**: `get_current_user` already exists in `routers/auth.py` and is proven. No need for custom auth logic.

**Implementation**:
- Import `from routers.auth import get_current_user` in `routers/feedback.py`
- Use `current_user: User = Depends(get_current_user)` in endpoint signature
- JWT token extracted from `Authorization: Bearer <token>` header automatically by OAuth2PasswordBearer

**Alternatives considered:**
- Custom auth decorator: rejected (existing pattern is sufficient; avoid duplication)

### 6. Test via in-memory SQLite with dependency overrides (existing pattern)

**Rationale**: Preferences tests use in-memory SQLite and dependency override, proven to work. Reuse for consistency and speed.

**Implementation**:
- `backend/tests/conftest.py` already sets up `StaticPool` engine and `get_db` override
- Create `test_feedback_service.py` (unit tests, direct DB calls, constraint validation)
- Create `test_feedback_router.py` (integration tests, auth flow, HTTP status codes, response schema)
- Both files follow existing test structure and fixtures

**Alternatives considered:**
- External test database: rejected (slower, requires cleanup; in-memory is sufficient for this scope)

## Risks / Trade-offs

| Risk | Mitigation |
|------|-----------|
| **Composite unique constraint is new pattern** — maintainers unfamiliar with it | Document in PR, include comment in migration explaining the constraint |
| **Dashboard content structure is undefined** — response schema may change later | Use `dict \| None` for `dashboard_content` to allow future expansion without breaking `content_id` |
| **Concurrent votes on same content** — race condition between check and insert | DB constraint (composite unique) prevents actual duplicates; service layer catches before DB, returns 409 Conflict if needed |
| **Content_id is generic string** — no FK to a real content table (doesn't exist yet) | Accept this trade-off for now; when dashboard model is added, content_id can be migrated to a real FK |
| **Upsert pattern conflates create and update** — client loses ability to detect "I already voted" | Return metadata in response (e.g., `is_new` flag or HTTP 201 vs 200) to allow clients to detect the distinction |

## Open Questions

1. **What is the structure of `dashboard_content` in the response?** This is deferred until the dashboard data model (coins, recommendations) is defined. For now, placeholder in schema as `dict | None`.
2. **Should `/feedback` support filtering (e.g., votes for a given content_id only)?** Defer to a follow-up if needed; initial scope is single-endpoint upsert.
3. **Do we track vote confidence or allow different rating scales per content type?** Defer; start with generic numeric rating or simple vote (like/dislike) and expand later.

## Migration Plan

**Deploy Steps:**
1. Merge feature branch and run migrations: `alembic upgrade head` creates `feedback` table in production DB
2. Deploy backend code (models, schemas, services, routers)
3. No data migration needed (new table, no existing feedback to migrate)
4. Monitor feedback endpoint for HTTP errors (auth, validation, constraint violations)

**Rollback:**
1. If needed, revert code deploy
2. Run `alembic downgrade -1` to drop `feedback` table
3. Remove Feedback router registration from `main.py` before re-deploying if rolling back mid-incident

**Database Backward Compatibility:**
- Migration is additive (creates new table, no column changes to existing tables)
- Rollback via `alembic downgrade` is safe
