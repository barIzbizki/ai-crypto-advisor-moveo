## 1. Backend: rating → boolean vote (KAN-19 extension, required for KAN-74/81)

- [x] 1.1 Update `backend/models/feedback.py`: replace `rating: Mapped[int]` with `is_upvote: Mapped[bool]`.
- [x] 1.2 Update `backend/schemas/feedback.py`: `FeedbackCreate`, `FeedbackUpdate`, and `FeedbackResponse` use `is_upvote: bool` instead of `rating: int` (drop the `ge=1, le=5` constraint).
- [x] 1.3 Add a new Alembic migration (in `backend/alembic/versions/`) altering the `feedback` table: drop `rating` (Integer), add `is_upvote` (Boolean, not nullable); include a matching `downgrade()`.
- [x] 1.4 Update `backend/tests/test_feedback_router.py` and `backend/tests/test_feedback_service.py` to submit/assert `is_upvote: bool` instead of `rating: int` (also required a small fix in `backend/services/feedback.py`, which still referenced `feedback_in.rating`).
- [x] 1.5 Run backend tests (`pytest backend/tests/test_feedback_router.py backend/tests/test_feedback_service.py`) to confirm the migration and schema changes are consistent. — 20/20 passed.

## 2. Feedback API client (KAN-81)

- [x] 2.1 Create `frontend/src/api/feedback.ts` with a `FeedbackResponse`/`FeedbackWithVotesResponse` type matching the updated backend schema (`is_upvote: boolean`), and a `submitFeedback(contentId: string, isUpvote: boolean, token: string)` function calling `apiClient.post('/feedback', { content_id, is_upvote: isUpvote }, token)`.

## 3. VoteButtons component (KAN-74)

- [x] 3.1 Create `frontend/src/components/VoteButtons.tsx` accepting `contentId: string` and an optional `initialVote?: boolean` prop (`true` = upvoted, `false` = downvoted, `undefined` = no vote yet).
- [x] 3.2 Render thumbs-up and thumbs-down controls; the one matching current vote state is visually marked selected.
- [x] 3.3 Export `VoteButtons` from `frontend/src/components/index.ts`.

## 4. Optimistic submit, rollback, and vote-change (KAN-81, KAN-87)

- [x] 4.1 On click, synchronously update local vote state (`true`/`false`) and clear any prior error before calling `submitFeedback`.
- [x] 4.2 On a rejected/failed request, revert vote state to its pre-click value and set an inline error message scoped to that content item.
- [x] 4.3 On success, reconcile vote state from the response's `feedback.is_upvote`.
- [x] 4.4 Clicking the thumb opposite the current vote submits the new boolean value (reuses the same submit/rollback path).
- [x] 4.5 Clicking the already-active thumb is a no-op: no request is fired and state is unchanged.
- [x] 4.6 Read the auth token via `useAuth()` (`frontend/src/context/AuthContext.tsx`) for the `submitFeedback` call.

## 5. Dashboard integration (KAN-74)

- [x] 5.1 Add a minimal `ContentCard` component (`frontend/src/components/ContentCard.tsx`) that renders a content item's identifying info plus a `VoteButtons` for its `contentId`.
- [x] 5.2 Update `frontend/src/pages/Dashboard.tsx` to render one or more `ContentCard`s (placeholder/sample content items) alongside the existing sign-in greeting.

## 6. Tests (KAN-93)

- [x] 6.1 Add `frontend/src/components/VoteButtons.test.tsx` covering: initial render with no vote, casting a vote (optimistic selection), rollback on a failed submission, switching from one vote to the other, and the re-click-active-vote no-op.
- [x] 6.2 Add `frontend/src/api/feedback.test.ts` covering `submitFeedback`'s request shape (`content_id`, `is_upvote` boolean, bearer token) and error propagation on a non-OK response.
- [x] 6.3 Run `npm run test` (or `npm run lint` + `npm run build`) in `frontend/` and confirm the new suite passes alongside existing tests. — 39/39 tests passed (9 files), lint clean (1 pre-existing unrelated warning), build succeeded.
