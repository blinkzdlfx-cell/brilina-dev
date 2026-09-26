# Brilina Dev — Development Rules

Before major implementation, read all planning documents in this repository.

## Rules
- TypeScript strictness.
- Small reusable components.
- Business logic outside presentation components.
- API client separated from UI.
- Validate external/API input.
- Typed contracts.
- Minimal dependencies.
- No unnecessary abstraction.

Editable content must come from the API: profile, biography, projects, technologies, capabilities, profile photos, social links.

Use local state for local concerns; do not introduce large state management without a real requirement.

Use database migrations. Never manually change production schema.

Never load unbounded project lists. Pagination is API-driven and frontend controls are reusable.

Images belong in ImageKit; D1 stores references/metadata.

PWA may cache the public app shell and safe public resources, but must not expose private admin data through the service worker. Offline mode is for resilient browsing, not offline admin mutations.

Minimum tests: authentication, authorization, validation, project CRUD, publishing, pagination, profile updates, image metadata, public project retrieval, important error states.

Use focused commits: feat, fix, refactor, docs, test, chore. Never commit secrets.
