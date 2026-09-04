## Context

`POST /feedback` (KAN-19) currently takes `{ content_id: string, rating: 1..5 }`, upserts by `(user_id, content_id)`, and returns `{ feedback, existing_votes, dashboard_content }`. This change replaces `rating` with a boolean `is_upvote` end to end (model, schemas, request/response) — see proposal.md for why. There is no `GET /feedback` endpoint. The frontend has an existing `apiClient` (`frontend/src/api/client.ts`, `get`/`post` with bearer token) and `AuthContext` (`frontend/src/context/AuthContext.tsx`) exposing the current token, both from KAN-20. `Dashboard.tsx` currently renders no content — see proposal.md for why this change also adds a minimal `ContentCard` shell.

## Goals / Non-Goals

**Goals:**
- A `VoteButtons` component that is reusable across any content item, not coupled to a specific card layout.
- Optimistic, per-item vote state that never blocks the UI on the network round-trip.

**Non-Goals:**
- Building the real dashboard content feed (what content items exist, how they're fetched/ranked) — `ContentCard` here is a minimal shell only, sized just enough to host `VoteButtons`.
- Showing a user's votes from a previous session — blocked on a `GET /feedback` endpoint that doesn't exist yet (see proposal.md - Impact).
- Un-voting (returning to "no vote") — the backend has no delete/null path, only upsert of an `is_upvote` boolean.

## Decisions

- **Backend vote field becomes a real boolean (`is_upvote`), not a 1–5 rating mapped to two values.** The `feedback` table was only added same-day (KAN-19) with no production data, so this is a direct column swap via a new Alembic migration (`rating: Integer` → `is_upvote: Boolean`), not a backfill. Alternative considered: keeping `rating: int` in the backend and mapping thumbs up/down to fixed values (5/1) only in the frontend — rejected per explicit product decision: the API should represent what it actually is (a two-state vote), not a disguised rating scale a UI happens to constrain to two values.
- **Vote state lives in `VoteButtons` itself (`useState`), not in a shared store.** Each card's vote is independent and nothing else on the page needs to read it. Alternative considered: lifting state into `AuthContext` or a new `FeedbackContext` — rejected as unnecessary until a real feature (e.g., a vote summary elsewhere on the page) needs to read vote state outside the component.
- **Optimistic update pattern:** on click, synchronously set local `vote` state to the clicked value and clear any error; then call `submitFeedback`. On failure, reset `vote` to the pre-click value and set a local `error` string; on success, reconcile `vote` from the response's `feedback.is_upvote` (in case the server-side value ever diverges from the optimistic guess). Alternative considered: a generic optimistic-mutation hook — rejected as overkill for a single call site.
- **`initialVote` is an optional prop, not fetched by the component.** Since there's no `GET /feedback`, `VoteButtons` has no data source for it today; the prop exists so a future caller with that data (once the endpoint ships) can pass it in without a component API change.
- **Re-clicking the already-active vote is a client-side no-op** (see spec's "Re-clicking the active vote" scenario) rather than triggering an un-vote request, since the backend has no way to represent "no vote" once one exists.

## Risks / Trade-offs

- [No `GET /feedback` means votes appear unset on every page load, even for content the user already voted on] → Documented as a known gap in proposal.md; `initialVote` prop is the seam for closing it later without touching `VoteButtons`'s internals.
- [Changing an already-shipped backend column (`rating` → `is_upvote`) touches a capability KAN-65 doesn't nominally own] → The `feedback` table has no real data yet (added same-day in KAN-19), so the migration is a low-risk column swap rather than a data migration; flagged explicitly in the proposal's Modified Capabilities.
- [Per-item local state means a duplicate `VoteButtons` for the same `content_id` elsewhere on the page (e.g. a "featured" section) would not stay in sync] → Acceptable for this change since no such duplicate rendering exists yet; would need lifted state if that changes.
