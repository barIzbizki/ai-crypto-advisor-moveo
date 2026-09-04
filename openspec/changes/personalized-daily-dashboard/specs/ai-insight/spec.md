## Purpose

Generates a short, personalized daily AI insight for the Dashboard's AI Insight of the Day section.

## ADDED Requirements

### Requirement: Insight is personalized by investor type, assets, and content preferences
The system SHALL generate a daily insight for an authenticated, onboarded user using their `investor_type`, `crypto_assets`, and `content_types` as prompt inputs, such that users with different preferences receive differently styled or focused insights.

#### Scenario: HODLer and Day Trader receive differently styled insights
- **WHEN** a HODLer interested in BTC/ETH and a Day Trader interested in SOL each request their daily insight
- **THEN** the HODLer's insight is long-term/holding-oriented and the Day Trader's insight is short-term/momentum-oriented

### Requirement: Insight is concise and generated once per user per day
The system SHALL generate at most one insight per user per calendar day; repeated requests on the same day SHALL return the same previously generated insight rather than generating a new one.

#### Scenario: Repeated requests on the same day return the same insight
- **WHEN** a user requests their AI Insight twice on the same day
- **THEN** both requests return identical insight text

#### Scenario: A new day produces a new insight
- **WHEN** a user requests their AI Insight on a later day than their last generated insight
- **THEN** the system generates a new insight reflecting that day

### Requirement: LLM failure falls back to a static insight
The system SHALL return a static, non-personalized fallback insight WHEN the LLM provider is unreachable, returns an error, or no API key is configured, rather than leaving the section empty.

#### Scenario: LLM provider is unavailable
- **WHEN** the configured LLM provider request fails or times out
- **THEN** the system returns the static fallback insight instead of an error
</content>
