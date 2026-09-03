## Context

The repo is currently empty aside from `README.md`. This change touches both the frontend and backend stacks plus repo-wide tooling in one pass, so it's worth fixing a few structural conventions up front rather than letting frontend and backend drift independently. See proposal.md - Why.

## Goals / Non-Goals

**Goals:**
- Establish one consistent top-level layout (`/frontend`, `/backend`) that every later KAN-4 story builds inside of.
- Make lint/format/type-check each a single command per stack, so CI and pre-commit hooks can be wired later without rework.

**Non-Goals:**
- No application logic, routes, components, or DB models — only the skeleton and empty directories from the spec.
- No CI pipeline configuration (GitHub Actions etc.) — out of scope for KAN-10, tracked separately if needed.
- No decision on state management, UI library, or ORM — deferred to the stories that actually need them.

## Decisions

- **Vite over Create React App** for the frontend: CRA is unmaintained; Vite is the current standard for React + TypeScript scaffolds and matches the Jira subtask (KAN-15) wording directly.
- **FastAPI over Flask/Django** for the backend: matches the Jira subtask (KAN-22) wording directly; FastAPI's typed request/response models pair naturally with the `schemas/` directory the subtask specifies.
- **Flat `pages/components/api/context` and `routers/models/schemas/services/core` layouts**, not deeper domain-based nesting: the app is small (4 dashboard sections), and Jira's subtask descriptions already name these exact directories — no reason to add structure beyond what's specified.
- **Ruff+Black over Flake8+isort** for backend linting/formatting: matches the Jira subtask (KAN-29) wording directly; Ruff subsumes most Flake8 rules and is significantly faster.

## Risks / Trade-offs

- [Directory layout chosen now may not fit later features (e.g. auth, dashboard sections) once real code lands] → Mitigation: layout matches Jira's explicit subtask wording and common conventions for both stacks, so it should absorb near-term feature work without restructuring; revisit only if a specific future story can't fit.
- [No CI enforcement of lint/format yet] → Mitigation: out of scope here, but the single-command lint/format setup from this change makes adding a CI step trivial later.
