## Context

See `proposal.md` - Why/What Changes for motivation and scope. Relevant current state:

- `UserPreferences` (`backend/models/preferences.py`) stores onboarding data lossily: `trading_strategy` (derived string), `risk_level` (enum derived from investor type), `notification_preferences` (untyped JSON holding `crypto_assets`/`content_types`). No frontend `GET /preferences` client exists.
- `Feedback` (`backend/models/feedback.py`) has `POST /feedback` upsert on `(user_id, content_id)` unique constraint, but no `GET /feedback` - votes never survive a page reload.
- `Dashboard.tsx` is a 2-item hardcoded stub. No backend integrations exist for news/prices/AI insight/memes.
- Auth: JWT `sub` = email; `get_current_user` resolves `User`; frontend passes `token` from `useAuth()` explicitly per API call (no interceptor).

## Goals / Non-Goals

**Goals:**
- Typed, queryable preference storage that the Dashboard's personalization logic can read directly.
- Four always-present Dashboard sections whose *content* (not presence) is personalized.
- Votes persist across reloads and behave identically to the existing optimistic/rollback UX.
- Each external integration degrades gracefully (no user-visible failure) when its API/key is unavailable.

**Non-Goals:**
- Real-time price/news streaming (poll-on-load is sufficient).
- Cross-user vote aggregation/display beyond what `FeedbackWithVotesResponse.existing_votes` already returns.
- Adding a user-editable display name field (see Decisions - display name is derived from email).
- Historical AI-insight archive/browsing - only "today's" insight per user is served.

## Decisions

### 1. Preferences schema: typed columns, drop the lossy mapping
Replace `trading_strategy`/`risk_level`/`notification_preferences` with:
```python
class InvestorType(str, Enum):
    HODLER = "hodler"
    DAY_TRADER = "day_trader"
    NFT_COLLECTOR = "nft_collector"

class UserPreferences(Base):
    investor_type: Mapped[str]              # String, required
    crypto_assets: Mapped[list[str]]         # JSON array, required, min 1 item
    content_types: Mapped[list[str]]         # JSON array, required, min 1 item
```
Postgres has no native string-array column via the project's current SQLAlchemy usage pattern elsewhere (`notification_preferences` already used JSON for structured data), so `crypto_assets`/`content_types` stay JSON-typed arrays rather than `ARRAY(String)`, for consistency with existing conventions and portability.

**Alternative considered**: keep `notification_preferences` JSON and only fix `investor_type`. Rejected - leaves `crypto_assets`/`content_types` unqueryable/untyped at the ORM layer, and the personalization logic (reads assets and content types on every Dashboard load) is core to this change, not incidental.

**Migration**: one Alembic revision - add the three new columns (nullable initially to allow backfill), backfill by reverse-mapping existing rows' `trading_strategy` → `investor_type` (the mapping is bijective: `long_term_hold`→`hodler`, `active_trading`→`day_trader`, `nft_collecting`→`nft_collector`) and lifting `notification_preferences.crypto_assets`/`.content_types` into the new columns, then a second step making the three columns non-nullable and dropping `trading_strategy`/`risk_level`/`notification_preferences`. Documented as two migration files (add+backfill, then drop) so backfill can be verified before the drop is applied - see Migration Plan.

### 2. Onboarding submission sends typed fields directly
`frontend/src/api/preferences.ts` drops `INVESTOR_TYPE_TO_RISK_LEVEL`/`INVESTOR_TYPE_TO_TRADING_STRATEGY` and posts `{ investor_type, crypto_assets, content_types }` matching the onboarding UI's own field names 1:1. No lossy translation layer remains.

### 3. Display name: derived from email, no schema change
Per user decision: the welcome header derives a display name from the email local-part (text before `@`), title-cased on `.`/`_`/`-` separators (e.g. `bar.izbizki1@gmail.com` → `Bar`). Implemented as a pure frontend helper next to `AuthContext` - `UserRead` already exposes `email`, no backend change needed. Numeric suffixes are left as-is rather than stripped, since guessing where a name ends and a number begins is unreliable.

### 4. Content identity per section (for feedback `content_id`)
Each rendered content item gets its own `ContentCard`, matching the existing per-item voting pattern (not one vote per whole section):
- **Market News**: `content_id = f"news:{source_item_id}"` (stable per article from CryptoPanic, or per static-fallback item's fixed slug) - same id across users, so `existing_votes` reflects real cross-user agreement on that article.
- **Coin Prices**: `content_id = f"price:{symbol_lowercase}"` (e.g. `price:btc`) - identifies "the BTC price card," not a specific price value; stable as prices fluctuate.
- **AI Insight**: `content_id = f"ai-insight:{user_id}:{date}"` - insight text is personalized per user, so the id must be scoped per user (not just per day), otherwise `existing_votes` would mix votes cast against different generated text under one id.
- **Crypto Meme**: `content_id = f"meme:{meme_slug}"` - identifies the specific curated meme shown, stable across users who see the same one.

### 5. Personalization behavior per section
- **Market News**: fetch a broader CryptoPanic (or fallback) feed, then rank/filter so items mentioning the user's `crypto_assets` sort first; never filter down to zero items - if no asset-matching news exists, show the general feed unranked.
- **Coin Prices**: query CoinGecko for exactly the user's `crypto_assets` (mapped to CoinGecko coin ids); "Stablecoins"/"Altcoins" (onboarding's broader categories) resolve to a small fixed representative set (e.g. Stablecoins → USDT, USDC; Altcoins → a fixed top-N excluding BTC/ETH) documented in the `coin-prices` spec.
- **AI Insight**: prompt template includes `investor_type`, `crypto_assets`, and `content_types`; e.g. HODLer prompts bias toward long-term framing, Day Trader prompts bias toward short-term volatility/momentum framing. One insight per user per day (cached/generated once, not regenerated per page load).
- **Crypto Meme**: curated static list may carry optional tags; if `content_types` includes `"Fun"`, prefer tagged-relevant memes, otherwise pick from the full curated list - selection logic never excludes the section itself.

### 6. External integrations - fallback behavior
All three external APIs (CryptoPanic, CoinGecko, OpenRouter) are called with a short timeout and wrapped so a failure/missing API key degrades to a per-section fallback rather than a Dashboard-wide error:
- **CryptoPanic**: missing key or request failure → static curated news fallback list bundled with the backend.
- **CoinGecko**: request failure → per-coin "price unavailable" empty state within the Coin Prices card (CoinGecko's public endpoints don't require a key, so total unavailability is the main failure mode).
- **OpenRouter**: missing key or request failure → a static generic insight fallback (non-personalized), so the section is never empty.
- **Meme**: fully static/curated, bundled with the backend - no external dependency, so no fallback path needed.

New settings added to `backend/core/config.py`: `cryptopanic_api_key: str | None`, `openrouter_api_key: str | None` (both optional, absence triggers fallback path). CoinGecko needs no key for the endpoints used.

### 7. `GET /feedback` shape
Add `GET /feedback?content_ids=id1,id2,...` returning the current user's `Feedback` rows for exactly the requested ids (empty list for ids with no vote yet). The Dashboard fetches this once with all of the current page's content ids after content is loaded, then passes each item's `is_upvote` (or `undefined`) into `VoteButtons`' `initialVote`. Scoped-by-ids (rather than "all of this user's feedback ever") keeps the response bounded as history grows.

## Risks / Trade-offs

- **[Risk] Migration backfill correctness** - the `trading_strategy`→`investor_type` reverse mapping only round-trips for rows written by the current onboarding mapping; any manually-inserted or legacy-shaped row could backfill incorrectly. → Mitigation: migration logs/raises on any row whose `trading_strategy` doesn't match one of the three known values, so it fails loudly instead of silently mis-assigning `investor_type`.
- **[Risk] External API rate limits** (CryptoPanic/CoinGecko free tiers) under real traffic. → Mitigation: short in-process cache (e.g. a few minutes) per section keyed by the relevant asset set, avoiding a fresh external call on every Dashboard load; exact TTL is an implementation detail for `tasks.md`, not a spec-level behavior.
- **[Risk] AI insight cost/latency** on every first-load-of-the-day. → Mitigation: generate once per `(user_id, date)` and persist/cache it so repeat loads the same day don't re-call the LLM.
- **[Trade-off] Email-derived display name** can look awkward for unusual email formats (e.g. `info@company.com` → `Info`). Accepted per user decision - acceptable for a greeting, avoids signup-flow scope creep.

## Migration Plan

1. Alembic revision A: add `investor_type`, `crypto_assets`, `content_types` as nullable columns; backfill existing rows from `trading_strategy`/`notification_preferences` via reverse mapping (raise on unrecognized `trading_strategy` values).
2. Deploy backend with both old and new columns present; onboarding submission switched to write the new columns directly (old columns no longer written).
3. Alembic revision B (separate deploy, after confirming revision A's backfill on all existing rows): make the three new columns non-nullable, drop `trading_strategy`/`risk_level`/`notification_preferences`.
4. Rollback: revision B's `downgrade()` re-adds the dropped columns (nullable, unbackfilled - acceptable since rollback implies reverting the feature, not preserving new-column data); revision A's `downgrade()` drops the new columns.
</content>
