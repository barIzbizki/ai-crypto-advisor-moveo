## Purpose

Stores each user's onboarding preferences as typed, queryable fields so Dashboard personalization can read them directly instead of decoding an unrelated derived shape.

## ADDED Requirements

### Requirement: Preferences store typed investor type, assets, and content types
The system SHALL store one preferences record per user with three required, typed fields: `investor_type` (one of `hodler`, `day_trader`, `nft_collector`), `crypto_assets` (a non-empty array of asset identifiers selected during onboarding, e.g. `BTC`, `ETH`, `SOL`, `Stablecoins`, `Altcoins`), and `content_types` (a non-empty array of content preference identifiers, e.g. `Market News`, `Charts`, `Social`, `Fun`).

#### Scenario: Preferences persisted with typed fields
- **WHEN** a user's preferences are created or updated with `investor_type`, `crypto_assets`, and `content_types`
- **THEN** the database stores all three fields in their typed form, retrievable without decoding a derived or nested structure

#### Scenario: Empty asset or content-type list is rejected
- **WHEN** preferences are submitted with an empty `crypto_assets` or `content_types` array
- **THEN** the system rejects the submission with a validation error

#### Scenario: Invalid investor_type is rejected
- **WHEN** preferences are submitted with an `investor_type` value outside `hodler`, `day_trader`, `nft_collector`
- **THEN** the system rejects the submission with a validation error

### Requirement: Legacy derived preference fields are removed
The system SHALL NOT store or expose `trading_strategy`, `risk_level`, or `notification_preferences` as preference fields; these are superseded by `investor_type`, `crypto_assets`, and `content_types`.

#### Scenario: Existing rows are migrated, not left in the old shape
- **WHEN** the migration to typed preference fields runs against existing preference records
- **THEN** each existing record ends up with `investor_type`/`crypto_assets`/`content_types` populated from its prior derived values, and the old fields are no longer present on the model
</content>
