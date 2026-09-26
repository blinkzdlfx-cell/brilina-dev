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

---

## Initial Setup

### Prerequisites
- Node.js 18+
- npm
- Wrangler CLI
- Cloudflare account
- GitHub account
- ImageKit account
- Resend account

### 1. Clone and install

```bash
git clone https://github.com/blinkzdlfx-cell/brilina-dev.git
cd brilina-dev
npm install
```

### 2. Create Cloudflare resources

Create D1 database:
```bash
npx wrangler d1 create brilina-dev-db
```

Create KV namespace:
```bash
npx wrangler kv namespace create brilina-dev-kv
```

Update `wrangler.toml` with the returned `database_id` and KV `id` from the commands above.

### 3. Configure environment variables

Create `.dev.vars` in the project root:
```
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD_HASH=<bootstrap-hash>
SESSION_SECRET=<random-32+-chars>
IMAGEKIT_PRIVATE_KEY=...
RESEND_API_KEY=...
RESEND_FROM_EMAIL=...
```

For production, set these via Cloudflare dashboard under Workers & Pages > brilina-dev > Settings > Variables.

### 4. Run database migrations

Local:
```bash
npm run db:migrate:local
```

Remote/production:
```bash
npm run db:migrate:remote
```

### 5. Bootstrap initial admin

Generate a password hash and insert the first admin record directly into D1:

```bash
node scripts/bootstrap-admin.js
```

The script should:
- Read `ADMIN_EMAIL` and `ADMIN_PASSWORD` from `.dev.vars`
- Hash the password with PBKDF2
- Insert an admin row into D1 if none exists

### 6. Run development server

```bash
npm run dev
```

Open http://localhost:3000 for the public site and http://localhost:3000/admin for the admin dashboard.

### 7. Build and deploy

```bash
npm run build
npm run worker:deploy
```

Or connect the GitHub repository to Cloudflare Pages for automatic deployments on push to main.

---

## GitHub + Cloudflare Pages Deployment

### Connect repository
1. In Cloudflare Dashboard, go to Workers & Pages
2. Create new application > Pages > Connect to Git
3. Select `blinkzdlfx-cell/brilina-dev`
4. Configure build settings:
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Node version: 18+
5. Add environment variables in the Cloudflare dashboard
6. Deploy

### Required environment variables in Cloudflare
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD_HASH`
- `SESSION_SECRET`
- `IMAGEKIT_PRIVATE_KEY`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`

### D1 and KV bindings
Cloudflare Pages automatically detects `wrangler.toml` and provisions D1/KV bindings if configured. Ensure the bindings are present in the Pages project settings.

---

## ImageKit Setup
1. Create an ImageKit account
2. Get the private key (server-side only)
3. Configure `IMAGEKIT_PRIVATE_KEY` in environment
4. Set upload folder and allowed file types in ImageKit dashboard
5. Never expose the private key to the browser

## Resend Setup
1. Create a Resend account
2. Get the API key
3. Verify a sending domain
4. Configure `RESEND_API_KEY` and `RESEND_FROM_EMAIL`

## Rollback
- Identify the bad deployment in Cloudflare dashboard
- Roll back to the previous deployment version
- Alternatively, revert the commit in GitHub and redeploy

## Production checklist
- [ ] TypeScript passes (`npm run typecheck`)
- [ ] Build succeeds (`npm run build`)
- [ ] D1 migrations applied remotely
- [ ] Admin account bootstrapped
- [ ] Environment variables set in Cloudflare
- [ ] ImageKit configured
- [ ] Resend configured and sending domain verified
- [ ] Custom domain configured
- [ ] Security headers verified
- [ ] PWA assets served correctly
