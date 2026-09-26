# Brilina Dev — Setup Guide

## Prerequisites
- Node.js 18+
- npm
- Wrangler CLI
- Cloudflare account
- GitHub account
- ImageKit account
- Resend account

## 1. Clone and install dependencies

```bash
git clone https://github.com/blinkzdlfx-cell/brilina-dev.git
cd brilina-dev
npm install
```

## 2. Create Cloudflare resources

```bash
npx wrangler d1 create brilina-dev-db
npx wrangler kv namespace create brilina-dev-kv
```

Update `wrangler.toml` with the returned `database_id` and KV `id`.

## 3. Configure environment variables

Create `.dev.vars` in the project root:

```
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD_HASH=<run scripts/bootstrap-admin.js to generate>
SESSION_SECRET=<random-32+-chars>
IMAGEKIT_PRIVATE_KEY=...
RESEND_API_KEY=...
RESEND_FROM_EMAIL=...
```

Never commit `.dev.vars` or real secrets to the repository.

## 4. Run database migrations

```bash
npm run db:migrate:local
```

For remote/production:
```bash
npm run db:migrate:remote
```

## 5. Bootstrap initial admin

```bash
node scripts/bootstrap-admin.js
```

This generates a PBKDF2 password hash and inserts the initial admin into D1.

## 6. Run development server

```bash
npm run dev
```

- Public site: http://localhost:3000
- Admin dashboard: http://localhost:3000/admin

## 7. Build and deploy

```bash
npm run build
npm run worker:deploy
```

Or connect the GitHub repository to Cloudflare Pages for automatic deployments.

---

## External services

### ImageKit
1. Create an ImageKit account
2. Get the private key
3. Configure `IMAGEKIT_PRIVATE_KEY` in `.dev.vars`
4. Never expose the private key to the browser

### Resend
1. Create a Resend account
2. Get the API key
3. Verify a sending domain
4. Configure `RESEND_API_KEY` and `RESEND_FROM_EMAIL` in `.dev.vars`

---

## Available commands

```bash
npm run dev                  # Start Vite dev server
npm run build                # Build for production
npm run preview              # Preview production build
npm run worker:dev           # Start Wrangler dev server
npm run worker:deploy        # Deploy to Cloudflare
npm run typecheck            # Run TypeScript type checking
npm run db:migrate:local     # Apply D1 migrations locally
npm run db:migrate:remote    # Apply D1 migrations remotely
```

---

## GitHub + Cloudflare Pages

1. Push code to GitHub
2. In Cloudflare Dashboard, go to Workers & Pages > Create application > Pages > Connect to Git
3. Select the repository
4. Build settings:
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Node version: 18+
5. Add environment variables in Cloudflare dashboard
6. Deploy

---

## Notes
- All editable portfolio content is stored in D1 and managed via the admin dashboard
- Images are stored in ImageKit; D1 stores metadata only
- Email is sent server-side via Resend
- No public registration in v1
- Admin credentials must be bootstrapped manually on first setup
