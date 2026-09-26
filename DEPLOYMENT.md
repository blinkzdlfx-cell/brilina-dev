# Brilina Dev — Deployment Plan

## Target
Cloudflare Workers + Static Assets, D1, KV where required. ImageKit for media. Resend for email.

## Environment
Separate development/production configuration. Never commit API keys, passwords, session secrets, ImageKit private key, Resend API key, or Cloudflare credentials.

Document required environment variables and provide safe examples.

## Integrations
Cloudflare: Worker, Static Assets, D1, optional KV, custom domain.
ImageKit: public configuration as needed; private values server-side only.
Resend: server-side API key only.

## Database
Use versioned migrations. Clearly distinguish local/preview/production. Never silently run destructive migrations.

## Build/deploy checks
Typecheck, tests, frontend build, Worker configuration validation, then deployment.

## PWA
Serve manifest, service worker, icons, and appropriate caching.

## Observability
Use Cloudflare logs and structured application errors. Never log passwords, tokens, session identifiers, or keys.

## Rollback
Document how to identify a bad deployment and return to the previous known-good version.

Do not hardcode the final production hostname throughout the application.
