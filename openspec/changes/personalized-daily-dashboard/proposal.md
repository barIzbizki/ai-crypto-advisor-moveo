## Why

Onboarding already collects a user's crypto assets, investor type, and content preferences, but nothing uses them: the backend stores them lossily (mapped into an unrelated `trading_strategy`/`risk_level`/JSON-blob shape) and the Dashboard is a two-item hardcoded stub with no news, prices, AI insight, or meme content. Users who complete onboarding get no personalized daily value from it. This change builds the real Dashboard and fixes the preferences schema so it can actually drive personalization.

## What Changes

- **BREAKING**: Replace `UserPreferences.trading_strategy`/`risk_level` with typed `investor_type` (enum), `crypto_assets` (array), and `content_types` (array) columns via an Alembic migration. `notification_preferences` JSON is retired in favor of these typed columns.
- Update onboarding submission (`frontend/src/api/preferences.ts`) to send `investor_type`/`crypto_assets`/`content_types` directly instead of the lossy derived mapping.
- Add a `GET /preferences` frontend client so the Dashboard can read the signed-in user's stored preferences.
- Add a `GET /feedback` backend endpoint (query by `content_id` list or by current user) plus a frontend client, so the Dashboard can hydrate each `VoteButtons`' prior vote on load instead of always rendering unset.
- Add four backend content sections, each with its own fetch/fallback/personalization logic:
  - Market News via CryptoPanic API (static fallback), prioritized toward the user's selected assets.
  - Coin Prices via CoinGecko API for the user's selected assets.
  - AI Insight of the Day via OpenRouter (or another approved free LLM), prompt-personalized by assets + investor type + content preferences.
  - Fun Crypto Meme from a curated/static source, always present regardless of content-type selection.
- Build the real Dashboard page: personalized welcome header, four fixed section cards (always rendered, contents personalized/prioritized but never omitted), per-section loading/empty/error states, responsive layout, and voting wired to the (extended) existing `VoteButtons`/`ContentCard` components.
- Resolve the "no display name" gap needed for the welcome header (approach decided in design.md).

## Capabilities

### New Capabilities
- `market-news`: fetch/prioritize/fallback behavior for the Market News section.
- `coin-prices`: fetch behavior for the Coin Prices section.
- `ai-insight`: daily AI insight generation and personalization behavior.
- `crypto-meme`: curated meme selection behavior.
- `frontend-dashboard`: the Dashboard page's fixed four-section structure, personalized welcome header, loading/empty/error states, and responsive layout.

### Modified Capabilities
- `user-preferences-model`: replace `trading_strategy`/`risk_level`/`notification_preferences` with typed `investor_type`/`crypto_assets`/`content_types` columns.
- `preferences-api`: `POST /preferences` accepts the new typed fields; add `GET /preferences`.
- `preferences-client`: onboarding submits typed fields directly instead of the derived mapping.
- `feedback-api`: add `GET /feedback` for retrieving the current user's votes.
- `frontend-voting`: `VoteButtons`/`ContentCard` hydrate prior vote state from fetched feedback instead of always starting unset.

## Impact

- **Backend**: `backend/models/preferences.py`, new Alembic migration, `backend/schemas/preferences.py`, `backend/routers/preferences.py`, `backend/routers/feedback.py`, `backend/services/feedback.py`, new routers/services for news/prices/AI-insight/meme, `backend/core/config.py` (new API keys/settings for CryptoPanic/CoinGecko/OpenRouter).
- **Frontend**: `frontend/src/api/preferences.ts`, `frontend/src/api/feedback.ts`, `frontend/src/pages/Dashboard.tsx` (full rebuild), `frontend/src/components/ContentCard.tsx`/`VoteButtons.tsx` (extended props), new section components, `frontend/src/schemas/onboarding.ts` (mapping removed).
- **Database**: migration on `user_preferences` (breaking column changes); no changes to `feedback` table.
- **Existing archived specs** (`user-preferences-model`, `preferences-api`, `preferences-client` under `openspec/changes/archive/epic-4/...`) never synced to main specs — this change creates their first main-spec versions reflecting the corrected schema, not a delta against a prior main spec.
</content>
