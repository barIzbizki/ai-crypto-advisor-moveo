## ADDED Requirements

### Requirement: GET /feedback returns the current user's votes for requested content
The system SHALL provide an HTTP GET endpoint at `/feedback` that requires JWT authentication and accepts a list of `content_id`s, returning the authenticated user's existing vote (`is_upvote`) for each requested id that has one. Ids with no vote are simply omitted from the response, not treated as an error.

#### Scenario: Retrieving votes for a mix of voted and unvoted content
- **WHEN** an authenticated user GETs `/feedback` with a list of content ids, some of which they have voted on and some they have not
- **THEN** the endpoint returns HTTP 200 with their vote for each id they voted on, and no entry for ids they have not voted on

#### Scenario: Empty content id list returns an empty result
- **WHEN** an authenticated user GETs `/feedback` with an empty list of content ids
- **THEN** the endpoint returns HTTP 200 with an empty result

#### Scenario: Unauthenticated request is rejected
- **WHEN** a request to `/feedback` lacks a valid JWT token
- **THEN** the endpoint returns HTTP 401 Unauthorized

#### Scenario: Votes are scoped to the requesting user
- **WHEN** an authenticated user GETs `/feedback` for content ids that other users have voted on but they have not
- **THEN** the response includes no vote entries for those ids on behalf of the requesting user
</content>
