## Why

The backend feedback API (`POST /feedback`, KAN-19) is live, but nothing in the frontend calls it: `Dashboard.tsx` is still the bare stub left by KAN-58, with no way for a user to vote on content or see/change a vote they already cast. KAN-65 ("Frontend Voting UI", epic KAN-8 "Feedback & Voting System") covers wiring the frontend up to that API, tracked as four Jira subtasks: KAN-74 (reusable thumbs up/down component), KAN-81 (optimistic submit with rollback), KAN-87 (changing an existing vote), and KAN-93 (voting UI tests).

## What Changes

- **BREAKING**: Change the KAN-19 feedback contract from a 1–5 `rating` to a true boolean vote. The `feedback.rating: int` column/field becomes `feedback.is_upvote: bool` (`true` = thumbs up, `false` = thumbs down) across the model, schemas, and `POST /feedback` request/response bodies. The `feedback` table was only just added (KAN-19, same day) with no real data yet, so this is a straight column swap, not a backfill.
- Add a reusable `VoteButtons` component (`frontend/src/components/VoteButtons.tsx`) rendering thumbs up/down controls for a piece of content, integrated into dashboard content cards (KAN-74). Since no dashboard content-card list exists yet (`Dashboard.tsx` only shows a sign-in greeting), this change also adds a minimal `ContentCard` presentational shell so `VoteButtons` has somewhere to render; the real content feed is out of scope here.
- Add a feedback API client (`frontend/src/api/feedback.ts`) that calls `POST /feedback` with `{ content_id, is_upvote }` and returns the `FeedbackWithVotesResponse` shape (now carrying `is_upvote` instead of `rating`).
- Implement optimistic voting in `VoteButtons`: clicking a thumb updates local UI state immediately, fires the `POST /feedback` request in the background, and rolls back to the prior state (plus an inline error) if the request fails (KAN-81).
- Allow changing an existing vote: clicking the other thumb (or the same thumb to un-vote, if supported by product) re-submits with the new rating via the same upsert endpoint, again optimistic with rollback (KAN-87). Because there is no `GET /feedback` endpoint yet, `VoteButtons` has no way to know a user's prior vote on page load; it accepts an optional `initialVote` prop (defaulting to none) and otherwise only tracks votes cast during the current session — documented as a known backend gap, not fixed by this change.
- Add unit/component tests for `VoteButtons` (render, optimistic update, rollback on API failure, switching votes) and the `feedback` API client (KAN-93).

## Capabilities

### New Capabilities
- `frontend-voting`: A reusable thumbs up/down voting component wired to `POST /feedback`, with optimistic updates, rollback on failure, and the ability to change an existing vote.

### Modified Capabilities
- `feedback-api`: `POST /feedback` now accepts and returns a boolean `is_upvote` vote instead of a 1–5 `rating`.
- `feedback-model`: The `feedback` table's vote column changes from `rating` (integer) to `is_upvote` (boolean).

## Impact

- Affected frontend code: new `frontend/src/components/VoteButtons.tsx`, `frontend/src/components/ContentCard.tsx`, `frontend/src/api/feedback.ts`; modified `frontend/src/pages/Dashboard.tsx` (renders `ContentCard`s with `VoteButtons`).
- Affected backend code (KAN-19, extended by this change): `backend/models/feedback.py` (`rating: Mapped[int]` → `is_upvote: Mapped[bool]`), `backend/schemas/feedback.py` (`FeedbackCreate`/`FeedbackUpdate`/`FeedbackResponse` use `is_upvote: bool`), a new Alembic migration altering the `feedback.rating` column to `feedback.is_upvote` (boolean), and `backend/tests/test_feedback_router.py` / `test_feedback_service.py` updated for the new field. `backend/services/feedback.py` and `backend/routers/feedback.py` need no signature changes — they pass the schema through.
- No new dependencies: reuses the existing `apiClient` (`frontend/src/api/client.ts`) and test stack (`vitest`, `@testing-library/react`) already introduced in KAN-20.
- Known gap carried forward (not fixed here): without a `GET /feedback` endpoint, votes made in a previous session are not shown on reload; `VoteButtons` is built to accept that state as a prop once such an endpoint exists.
