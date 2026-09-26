# Brilina Dev — Initial Admin Bootstrap

## Purpose
Document a secure bootstrap procedure for provisioning the first admin account.
No credentials are hardcoded in the application.

## Procedure

### 1. Create `.dev.vars` (never commit)

```
ADMIN_EMAIL=owner@example.com
ADMIN_PASSWORD=<choose-a-strong-password>
SESSION_SECRET=<random-32+-chars>
IMAGEKIT_PRIVATE_KEY=...
RESEND_API_KEY=...
RESEND_FROM_EMAIL=...
```

### 2. Generate password hash

Run the bootstrap script:

```bash
node scripts/bootstrap-admin.js
```

This script:
- Reads `ADMIN_EMAIL` and `ADMIN_PASSWORD` from `.dev.vars`
- Generates a PBKDF2 password hash
- Inserts an admin row into D1 if none exists with that email
- Outputs confirmation

### 3. Log in

Navigate to `/admin/login` and sign in with the email and password from `.dev.vars`.

## Security notes
- Never commit `.dev.vars` or real credentials
- The password hash, not the plaintext password, is stored in D1
- The bootstrap script does not print the plaintext password
- Rotate `SESSION_SECRET` if it is ever exposed
- Use a strong, unique admin password
