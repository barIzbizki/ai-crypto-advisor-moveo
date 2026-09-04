## MODIFIED Requirements

### Requirement: User onboarded status
The User model SHALL have an `onboarded` boolean flag (default false) that tracks whether the user has completed the onboarding process by saving their preferences.

#### Scenario: User starts as not onboarded
- **WHEN** a new User is created
- **THEN** the onboarded flag defaults to false

#### Scenario: Onboarded flag is set on preferences save
- **WHEN** a user successfully saves preferences via POST /preferences
- **THEN** the user's onboarded flag is set to true

#### Scenario: Onboarded flag can be queried
- **WHEN** retrieving a User record
- **THEN** the onboarded boolean flag is included in the response
