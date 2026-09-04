## ADDED Requirements

### Requirement: Vote controls hydrate prior vote state on load
The system SHALL initialize each content item's vote control from the user's previously stored vote (if any) when the content it belongs to is loaded, rather than always starting unset.

#### Scenario: Previously voted content shows the existing selection on reload
- **WHEN** a signed-in user who previously voted thumbs up on a content item reloads a page displaying that item
- **THEN** the vote control renders with thumbs up already shown as selected, without requiring a new click

#### Scenario: Never-voted content still starts unset
- **WHEN** a signed-in user views a content item they have never voted on
- **THEN** the vote control renders with neither thumb selected
</content>
