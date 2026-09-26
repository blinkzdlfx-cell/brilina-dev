# Brilina Dev — Security Plan

## Sensitive assets
Admin credentials, sessions, ImageKit private credentials, Resend API key, database content, unpublished portfolio content.

## Authentication
No public registration. Strong password hashing. Secure HttpOnly SameSite cookies if cookie sessions are used. Expiring sessions, logout, password reset, rate limits. Account-recovery responses should not reveal whether an email exists.

## Authorization
Every admin endpoint verifies an authenticated admin session. Never trust browser-supplied identity/role fields.

## Secrets
All private credentials remain server-side. Never log or return passwords, hashes, reset tokens, session cookies, or API keys.

## ImageKit
Generate upload authorization server-side. Restrict file types/sizes as appropriate.

## API
Validate input, allowlist update fields, prevent mass assignment, use safe client errors.

## XSS
Treat stored rich text as untrusted. Prefer structured/plain text; sanitize if rich HTML is later supported.

## CSRF
Use an appropriate CSRF strategy for cookie-authenticated mutations.

## CORS
Keep restrictive; prefer same-origin requests when frontend/API share origin.

## Headers
Use appropriate security headers and a considered CSP where practical.

## Database
Parameterized/prepared queries, migrations, no raw database errors to public clients.

## Admin UI
Confirm destructive actions, protect unsaved changes, and never cache private admin responses through the public service worker.

## Incident response
If a secret is exposed: rotate/revoke, remove from source, inspect logs, redeploy, document.
