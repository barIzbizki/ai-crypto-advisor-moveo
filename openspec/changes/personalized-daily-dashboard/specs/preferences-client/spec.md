## Purpose

Submits the onboarding UI's selections to the backend without lossy translation, and lets the Dashboard fetch them back for personalization.

## ADDED Requirements

### Requirement: Onboarding submits typed fields directly
The system SHALL submit the user's onboarding selections (`cryptoAssets`, `investorType`, `contentTypes`) to `POST /preferences` as `crypto_assets`, `investor_type`, and `content_types` respectively, with no derived or lossy field mapping.

#### Scenario: Onboarding completion submits selections unmodified
- **WHEN** a user completes onboarding having selected assets, an investor type, and content types
- **THEN** the submitted request body's `crypto_assets`, `investor_type`, and `content_types` match the user's selections exactly

### Requirement: Dashboard fetches stored preferences
The system SHALL provide a client capable of fetching the authenticated user's preferences via `GET /preferences` for use in Dashboard personalization.

#### Scenario: Dashboard loads with the user's stored preferences
- **WHEN** an onboarded, authenticated user's Dashboard loads
- **THEN** the client fetches and returns the user's `investor_type`, `crypto_assets`, and `content_types` from `GET /preferences`
</content>
