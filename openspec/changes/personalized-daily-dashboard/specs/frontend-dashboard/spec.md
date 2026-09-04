## Purpose

Renders the personalized Daily Dashboard: a welcome header plus four fixed content sections whose contents are personalized but whose presence is never conditional on user preferences.

## ADDED Requirements

### Requirement: Dashboard always renders all four sections
The system SHALL render Market News, Coin Prices, AI Insight of the Day, and Fun Crypto Meme for every onboarded user's Dashboard. The system SHALL NOT omit any of the four sections based on the user's `content_types` selection; preferences may only affect content shown within a section.

#### Scenario: User with narrow content preferences still sees all four sections
- **WHEN** an onboarded user whose `content_types` is `["Market News", "Charts"]` (excluding "Fun" and "Social") loads their Dashboard
- **THEN** all four sections - Market News, Coin Prices, AI Insight of the Day, and Fun Crypto Meme - are rendered

### Requirement: First login redirects through onboarding to the Dashboard
The system SHALL route a first-time authenticated user to onboarding, and route them to the personalized Dashboard once their preferences are saved.

#### Scenario: New user completes onboarding and lands on the Dashboard
- **WHEN** a first-time user finishes submitting onboarding preferences
- **THEN** the system navigates them to the Dashboard, which reflects their just-submitted preferences

### Requirement: Dashboard shows a personalized welcome header
The system SHALL display a welcome header including a greeting derived from the signed-in user's identity above the four sections.

#### Scenario: Welcome header renders for a signed-in user
- **WHEN** an onboarded user's Dashboard loads
- **THEN** a welcome header is shown above the four sections, addressed to that user

### Requirement: Each section handles loading, empty, and error states independently
The system SHALL show a loading state for a section while its content is being fetched, an empty state if a section legitimately has no content to show, and an error state if fetching failed - independently per section, such that one section's state does not block or hide the others.

#### Scenario: One section's slow load does not block others
- **WHEN** one section's content is still loading while another section's content has already loaded
- **THEN** the loaded section is shown immediately and the slow section shows its own loading state

#### Scenario: One section's fetch failure does not affect other sections
- **WHEN** fetching content for one section fails
- **THEN** that section shows an error state while the other three sections render normally

### Requirement: Dashboard layout is responsive
The system SHALL present the four sections in a layout usable on both desktop and mobile viewport widths, with vote controls visible but visually secondary to section content.

#### Scenario: Dashboard is usable on a mobile viewport
- **WHEN** the Dashboard is viewed at a mobile viewport width
- **THEN** all four sections remain accessible and legible without horizontal scrolling
</content>
