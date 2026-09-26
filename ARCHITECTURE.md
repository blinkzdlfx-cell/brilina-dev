# Brilina Dev — Architecture

## Principle
D1 stores what Brilina Dev says. React determines how Brilina Dev presents it.

## Stack
- React + TypeScript + Vite
- Bootstrap 5 + React-Bootstrap
- Motion
- React Router
- Cloudflare Workers + Static Assets
- Cloudflare D1
- Cloudflare KV where appropriate
- ImageKit
- Resend
- Zod

## Responsibilities
React: UI, routing, animation, forms, client state, API consumption, responsive presentation, PWA shell.
Worker: API, authentication, authorization, validation, business rules, ImageKit authorization, database access, security.
D1: relational application data.
KV: suitable short-lived/session/ephemeral data; not the primary relational store.
ImageKit: actual media and delivery.
Resend: transactional email.

## Public routes
/, /projects, /projects/:slug, /method, /about, /contact

## Admin routes
/admin/login, /admin, /admin/projects, /admin/projects/new, /admin/projects/:id/edit, /admin/profile, /admin/photos, /admin/capabilities, /admin/links, /admin/account

## Data flow
Admin → Worker API → D1.
Admin upload → authenticated Worker/ImageKit upload → ImageKit; metadata → D1.
Public request → Worker API → D1 → React.

## Constraints
- No editable portfolio content hardcoded in React.
- No secrets in client bundles.
- No direct browser access to D1.
- Never expose ImageKit private credentials.
- Use migrations.
- Keep API/UI contracts explicit.
- Prefer additive changes and simple abstractions.
