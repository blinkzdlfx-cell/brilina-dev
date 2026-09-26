import type { Env } from './types';

const RATE_LIMIT_STORE = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): boolean {
  const now = Date.now();
  const record = RATE_LIMIT_STORE.get(key);

  if (!record || now > record.resetTime) {
    RATE_LIMIT_STORE.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count++;
  return true;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );

  const hashBuffer = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100_000,
      hash: 'SHA-256'
    },
    passwordKey,
    256
  );

  const hashArray = new Uint8Array(hashBuffer);
  const saltHex = Array.from(salt)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  const hashHex = Array.from(hashArray)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  return `${saltHex}:${hashHex}`;
}

export async function verifyPassword(
  password: string,
  storedHash: string
): Promise<boolean> {
  const [saltHex, hashHex] = storedHash.split(':');
  if (!saltHex || !hashHex) {
    return false;
  }

  const salt = new Uint8Array(
    saltHex.match(/.{2}/g)!.map((b) => parseInt(b, 16))
  );

  const passwordKey = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );

  const hashBuffer = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100_000,
      hash: 'SHA-256'
    },
    passwordKey,
    256
  );

  const hashArray = new Uint8Array(hashBuffer);
  const computedHash = Array.from(hashArray)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  return computedHash === hashHex;
}

export async function createSession(
  adminId: number,
  kv: KVNamespace
): Promise<string> {
  const token = Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  const session = {
    adminId,
    createdAt: new Date().toISOString()
  };

  await kv.put(`session:${token}`, JSON.stringify(session), {
    expirationTtl: 7 * 24 * 60 * 60
  });

  return token;
}

export async function validateSession(
  token: string,
  kv: KVNamespace
): Promise<{ adminId: number } | null> {
  try {
    const data = await kv.get(`session:${token}`, 'json');
    if (!data) {
      return null;
    }
    const session = data as { adminId: number; createdAt: string };
    return { adminId: session.adminId };
  } catch {
    return null;
  }
}

export async function deleteSession(token: string, kv: KVNamespace): Promise<void> {
  await kv.delete(`session:${token}`);
}

export async function generatePasswordResetToken(
  kv: KVNamespace
): Promise<string> {
  const token = Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  await kv.put(`reset:${token}`, '1', {
    expirationTtl: 60 * 60
  });

  return token;
}

export async function consumePasswordResetToken(
  token: string,
  kv: KVNamespace
): Promise<boolean> {
  const key = `reset:${token}`;
  const value = await kv.get(key);
  if (!value) {
    return false;
  }
  await kv.delete(key);
  return true;
}

export async function getAdminFromRequest(
  request: Request,
  kv: KVNamespace
): Promise<{ adminId: number } | null> {
  const cookieHeader = request.headers.get('Cookie');
  if (!cookieHeader) {
    return null;
  }

  const cookies = Object.fromEntries(
    cookieHeader.split(';').map((c) => {
      const [key, ...rest] = c.trim().split('=');
      return [key, rest.join('=')];
    })
  );

  const sessionToken = cookies['session'];
  if (!sessionToken) {
    return null;
  }

  return validateSession(sessionToken, kv);
}

export function setSessionCookie(token: string, env: Env): string {
  const isProduction = env.ENVIRONMENT === 'production';
  const cookieParts = [
    `session=${token}`,
    'HttpOnly',
    'Path=/',
    'Max-Age=604800',
    'SameSite=Strict'
  ];

  if (isProduction) {
    cookieParts.push('Secure');
  }

  return cookieParts.join('; ');
}

export function clearSessionCookie(env: Env): string {
  const isProduction = env.ENVIRONMENT === 'production';
  const cookieParts = [
    'session=',
    'HttpOnly',
    'Path=/',
    'Max-Age=0',
    'SameSite=Strict'
  ];

  if (isProduction) {
    cookieParts.push('Secure');
  }

  return cookieParts.join('; ');
}

export function getClientIp(request: Request): string {
  const cfConnectingIp = request.headers.get('CF-Connecting-IP');
  if (cfConnectingIp) {
    return cfConnectingIp;
  }

  const xForwardedFor = request.headers.get('X-Forwarded-For');
  if (xForwardedFor) {
    return xForwardedFor.split(',')[0]?.trim() || 'unknown';
  }

  return 'unknown';
}
