## 1. Preferences schema migration (backend)

- [ ] 1.1 Add `InvestorType` enum and `investor_type`/`crypto_assets`/`content_types` nullable columns to `backend/models/preferences.py` alongside the existing `trading_strategy`/`risk_level`/`notification_preferences`.
- [ ] 1.2 Add Alembic migration A: create the three new nullable columns, then backfill existing rows - reverse-map `trading_strategy` → `investor_type` (`long_term_hold`→`hodler`, `active_trading`→`day_trader`, `nft_collecting`→`nft_collector`, raising on any unrecognized value) and lift `notification_preferences.crypto_assets`/`.content_types` into the new columns.
- [ ] 1.3 Run migration A against the dev database and verify every existing `user_preferences` row has non-null `investor_type`/`crypto_assets`/`content_types`.
- [ ] 1.4 Add Alembic migration B: make `investor_type`/`crypto_assets`/`content_types` non-nullable; drop `trading_strategy`, `risk_level`, `notification_preferences` from the model and table. Include a matching `downgrade()` for both migrations.
- [ ] 1.5 Update `backend/schemas/preferences.py`: `PreferencesCreate`/`PreferencesUpdate`/`PreferencesResponse` use `investor_type` (enum), `crypto_assets: list[str]`, `content_types: list[str]` (all required, non-empty) instead of `trading_strategy`/`risk_level`/`notification_preferences`.

## 2. Preferences API (backend)

- [ ] 2.1 Update `backend/routers/preferences.py` `create_or_update_preferences` to accept the new typed schema; keep existing upsert/onboarding-flag semantics.
- [ ] 2.2 Add `GET /preferences` handler returning the current user's typed preferences (404 if not onboarded).
- [ ] 2.3 Update/add backend tests for `POST /preferences` (new field validation) and `GET /preferences` (200 onboarded, 404 not onboarded, 401 unauthenticated).

## 3. Preferences client and onboarding submission (frontend)

- [ ] 3.1 Update `frontend/src/api/preferences.ts`: remove `INVESTOR_TYPE_TO_RISK_LEVEL`/`INVESTOR_TYPE_TO_TRADING_STRATEGY` mapping; `PreferencesPayload`/`PreferencesResponse` carry `investor_type`, `crypto_assets`, `content_types` directly; `toPreferencesPayload` becomes a straight field rename from the onboarding form values.
- [ ] 3.2 Add a `getPreferences(token)` client calling `GET /preferences`.
- [ ] 3.3 Update any existing onboarding tests for the new payload shape.

## 4. Feedback retrieval (backend)

- [ ] 4.1 Add `get_by_user_and_content_ids` to `backend/services/feedback.py` (query `Feedback` rows by `user_id` and a list of `content_id`s).
- [ ] 4.2 Add `GET /feedback` handler in `backend/routers/feedback.py` accepting a `content_ids` query parameter (comma-separated or repeated), requiring auth, returning the current user's matching feedback rows.
- [ ] 4.3 Add backend tests: mixed voted/unvoted ids, empty id list, unauthenticated request, votes scoped to requesting user.

## 5. Feedback client and vote hydration (frontend)

- [ ] 5.1 Add `getFeedback(contentIds, token)` to `frontend/src/api/feedback.ts` calling `GET /feedback`.
- [ ] 5.2 Update `frontend/src/components/ContentCard.tsx`/`VoteButtons.tsx` usage so a parent can pass `initialVote` sourced from a batch `getFeedback` call made once the Dashboard's content ids are known.
- [ ] 5.3 Add/update frontend tests for vote hydration (previously-voted item renders pre-selected; never-voted item renders unset).

## 6. Backend content integrations - config and shared plumbing

- [ ] 6.1 Add `cryptopanic_api_key: str | None` and `openrouter_api_key: str | None` to `backend/core/config.py` `Settings` (env-driven, optional).
- [ ] 6.2 Add a small in-process TTL cache helper (or reuse an existing one) for per-section external-call caching keyed by relevant asset set.

## 7. Market News section (backend)

- [ ] 7.1 Add `backend/services/market_news.py`: fetch from CryptoPanic when `cryptopanic_api_key` is set, else use a bundled static fallback list; rank items by relevance to the user's `crypto_assets` without dropping to zero items when no match exists.
- [ ] 7.2 Add a static fallback news dataset bundled with the backend.
- [ ] 7.3 Add `GET /dashboard/news` (or equivalent) router returning ranked news items (headline, description, source, date, `content_id`) for the authenticated user.
- [ ] 7.4 Add backend tests: asset-relevant ranking, no-match falls back to general feed, provider failure falls back to static list.

## 8. Coin Prices section (backend)

- [ ] 8.1 Add `backend/services/coin_prices.py`: map onboarding asset identifiers (including `Stablecoins`/`Altcoins` broad categories) to CoinGecko coin ids and fetch current price/market data.
- [ ] 8.2 Add `GET /dashboard/prices` router returning per-coin data (name, symbol, price, market info, `content_id`) for the authenticated user's assets, marking any individual coin "unavailable" on a per-coin fetch failure rather than failing the whole response.
- [ ] 8.3 Add backend tests: named assets, broad-category resolution, per-coin failure isolation.

## 9. AI Insight section (backend)

- [ ] 9.1 Add a table/model to persist one generated insight per `(user_id, date)`.
- [ ] 9.2 Add `backend/services/ai_insight.py`: build a prompt from `investor_type`/`crypto_assets`/`content_types`, call OpenRouter (or configured LLM), and persist the result; return the cached insight if one already exists for today.
- [ ] 9.3 Add a static, non-personalized fallback insight used when the LLM call fails or no API key is configured.
- [ ] 9.4 Add `GET /dashboard/insight` router returning today's insight (`content_id` includes user and date) for the authenticated user.
- [ ] 9.5 Add backend tests: personalization varies by investor type, same-day idempotency, new-day regeneration, LLM failure fallback.

## 10. Crypto Meme section (backend)

- [ ] 10.1 Add a bundled static/curated meme dataset (image reference, optional caption, optional relevance tags).
- [ ] 10.2 Add `backend/services/crypto_meme.py`: select a meme, preferring tagged-relevant ones when `content_types` includes `Fun` and such memes exist, else selecting from the full set.
- [ ] 10.3 Add `GET /dashboard/meme` router returning the selected meme (`content_id`) for the authenticated user.
- [ ] 10.4 Add backend tests: meme present regardless of "Fun" preference, tagged-preference selection, no external network call is made.

## 11. Dashboard page (frontend)

- [ ] 11.1 Add a welcome-name helper (derive display name from email local-part) used by the welcome header.
- [ ] 11.2 Rebuild `frontend/src/pages/Dashboard.tsx`: on mount, fetch preferences (if needed for display), then fetch the four section endpoints in parallel, then batch-fetch feedback for all returned content ids.
- [ ] 11.3 Add section components (news list, price list, insight card, meme card), each rendering via `ContentCard`/`VoteButtons` with the section's `content_id`s.
- [ ] 11.4 Implement independent per-section loading/empty/error states so one section's state never blocks or hides the others.
- [ ] 11.5 Style the welcome header and four-section layout for desktop and mobile (responsive grid/stack), with vote controls visually secondary to content.
- [ ] 11.6 Remove the old `SAMPLE_CONTENT` stub.

## 12. Frontend tests and verification

- [ ] 12.1 Add/update `Dashboard` tests covering: all four sections render regardless of `content_types`, per-section loading/empty/error isolation, vote hydration from `getFeedback`.
- [ ] 12.2 Run backend test suite (`pytest`) and frontend suite (`npm run test`, `npm run lint`, `npm run build`) and confirm all pass.
- [ ] 12.3 Manually run the app end-to-end: sign up → onboarding → Dashboard, confirming all four sections render with personalized content and votes persist across a reload.
</content>
