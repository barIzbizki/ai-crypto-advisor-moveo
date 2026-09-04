## Purpose

Collects a new user's investing preferences (crypto assets, investor type, content types) through a multi-step onboarding page before they reach the dashboard, covering Jira subtasks KAN-71 (steps/navigation) and KAN-77 (validation).

## ADDED Requirements

### Requirement: Multi-step onboarding page
The system SHALL provide an onboarding page at `/onboarding` that presents the crypto assets, investor type, and content types inputs as separate steps, with controls to move to the next step and back to the previous step.

#### Scenario: User advances through steps
- **WHEN** a user completes a step's required inputs and selects "Next"
- **THEN** the system advances to the following step and preserves previously entered values if the user navigates back

#### Scenario: User navigates back
- **WHEN** a user selects "Back" on any step after the first
- **THEN** the system returns to the previous step with that step's previously entered values intact

#### Scenario: Final step submits
- **WHEN** a user completes the final step
- **THEN** the system presents a submit action instead of "Next"

### Requirement: Per-step validation
The system SHALL validate each step's inputs before allowing the user to advance, and SHALL validate all steps before allowing final submission.

#### Scenario: Invalid step blocks advancement
- **WHEN** a user selects "Next" without satisfying a step's required inputs (e.g., no crypto assets selected)
- **THEN** the system prevents navigation to the next step and displays a validation error for the invalid field(s)

#### Scenario: Valid step allows advancement
- **WHEN** a user satisfies a step's required inputs and selects "Next"
- **THEN** the system advances without displaying validation errors

#### Scenario: Submission blocked on invalid final state
- **WHEN** a user reaches the final step with any step's inputs invalid
- **THEN** the system prevents submission and surfaces the validation errors
