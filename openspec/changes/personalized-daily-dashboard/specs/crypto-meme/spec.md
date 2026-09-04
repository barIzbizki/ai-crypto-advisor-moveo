## Purpose

Serves a crypto-related meme for the Dashboard's Fun Crypto Meme section, which is always present regardless of the user's content-type preferences.

## ADDED Requirements

### Requirement: Meme section is always present
The system SHALL return a meme for every authenticated, onboarded user's Dashboard, regardless of whether `content_types` includes `Fun`.

#### Scenario: User without "Fun" selected still receives a meme
- **WHEN** a user whose `content_types` does not include `Fun` loads their Dashboard
- **THEN** the Fun Crypto Meme section is present and returns a meme

### Requirement: Meme selection may be influenced by content preferences
The system SHALL prefer memes tagged as relevant WHEN the user's `content_types` includes `Fun` and tagged-relevant memes are available, and SHALL select from the full curated set otherwise.

#### Scenario: "Fun" preference prioritizes tagged memes
- **WHEN** a user's `content_types` includes `Fun` and tagged-relevant memes exist in the curated set
- **THEN** the returned meme is drawn from the tagged-relevant subset

### Requirement: Meme source is static and curated
The system SHALL serve memes from a static, curated source bundled with the application, with no dependency on an external API.

#### Scenario: Meme section has no external dependency
- **WHEN** the Fun Crypto Meme section is requested
- **THEN** the meme is served without making any external network call
</content>
