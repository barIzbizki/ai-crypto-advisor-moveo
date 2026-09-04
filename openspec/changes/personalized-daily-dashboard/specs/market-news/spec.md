## Purpose

Serves crypto news for the Dashboard's Market News section, prioritized toward the user's selected assets, with a static fallback when the news provider is unavailable.

## ADDED Requirements

### Requirement: Market News returns items prioritized by the user's assets
The system SHALL return a list of news items for an authenticated, onboarded user's Market News section, ordered so that items relevant to the user's `crypto_assets` are ranked first. The system SHALL NOT reduce the result to zero items solely because no asset-relevant news exists.

#### Scenario: Asset-relevant news is ranked first
- **WHEN** a user with `crypto_assets` including `BTC` requests Market News and both BTC-relevant and unrelated news items are available
- **THEN** BTC-relevant items appear before unrelated items in the returned list

#### Scenario: No asset-relevant news still returns the general feed
- **WHEN** a user's selected assets have no matching news items available
- **THEN** the system returns the general news feed unranked, rather than an empty list

### Requirement: Each news item exposes headline, description, source, and date
The system SHALL return, for each news item, a headline, a short description where available, the source, and a publish date where available.

#### Scenario: News item includes available metadata
- **WHEN** a news item is returned from a provider that supplies a description and date
- **THEN** the returned item includes headline, description, source, and date

### Requirement: Provider failure falls back to static news
The system SHALL serve a static, curated set of news items WHEN the news provider is unreachable, returns an error, or no API key is configured, rather than returning an empty or error response.

#### Scenario: News provider is unavailable
- **WHEN** the configured news provider request fails or times out
- **THEN** the system returns the static fallback news items instead of an error
</content>
