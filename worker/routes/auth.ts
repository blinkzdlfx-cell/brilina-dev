import type { Env, ApiResponse, ApiError } from '../types';
import { Database } from '../db';
import {
  LoginRequestSchema,
  ForgotPasswordRequestSchema,
  ResetPasswordRequestSchema,
  type LoginRequest,
  type ForgotPasswordRequest,
  type ResetPasswordRequest
} from '../validation';
import {
  hashPassword,
  verifyPassword,
  createSession,
  deleteSession,
  generatePasswordResetToken,
  consumePasswordResetToken,
  getAdminFromRequest,
  setSessionCookie,
  clearSessionCookie,
  checkRateLimit,
  getClientIp
} from '../auth';
import { sendPasswordResetEmail } from '../email';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
};

function jsonResponse<T>(data: T, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json'
    }
  });
}

function errorResponse(
  code: string,
  message: string,
  status = 400,
  fields?: Record<string, string>
): Response {
  return new Response(
    JSON.stringify({
      data: null,
      error: { code, message, fields }
    }),
    {
      status,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    }
  );
}

export async function handleLogin(request: Request, env: Env): Promise<Response> {
  const clientIp = getClientIp(request);
  const rateLimitKey = `login:${clientIp}`;

  if (!checkRateLimit(rateLimitKey, 5, 60_000)) {
    return errorResponse('RATE_LIMIT_EXCEEDED', 'Too many login attempts. Please try again later.', 429);
  }

  try {
    const body = await request.json();
    const parseResult = LoginRequestSchema.safeParse(body);

    if (!parseResult.success) {
      return errorResponse(
        'VALIDATION_ERROR',
        'Invalid request',
        400,
        parseResult.error.flatten().fieldErrors as Record<string, string>
      );
    }

    const { email, password }: LoginRequest = parseResult.data;
    const db = new Database(env.DB);

    const admin = await db.getOne<{ id: number; email: string; password_hash: string; email_verified_at: string | null }>(
      'SELECT id, email, password_hash, email_verified_at FROM admins WHERE email = ?',
      [email]
    );

    if (!admin) {
      return errorResponse('INVALID_CREDENTIALS', 'Invalid email or password', 401);
    }

    const isValid = await verifyPassword(password, admin.password_hash);
    if (!isValid) {
      return errorResponse('INVALID_CREDENTIALS', 'Invalid email or password', 401);
    }

    await db.update(
      'admins',
      { updated_at: new Date().toISOString() },
      'id = ?',
      [admin.id]
    );

    const token = await createSession(admin.id, env.KV);
    const cookie = setSessionCookie(token, env);

    const response = jsonResponse<ApiResponse<{ admin: { id: number; email: string } }>>({
      data: {
        admin: {
          id: admin.id,
          email: admin.email
        }
      },
      error: null
    }, 200);

    response.headers.append('Set-Cookie', cookie);

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return errorResponse('INTERNAL_ERROR', 'Login failed', 500);
  }
}

export async function handleLogout(request: Request, env: Env): Promise<Response> {
  try {
    const session = await getAdminFromRequest(request, env.KV);
    if (session) {
      const cookieHeader = request.headers.get('Cookie');
      let token: string | undefined;

      if (cookieHeader) {
        const cookies = Object.fromEntries(
          cookieHeader.split(';').map((c) => {
            const [key, ...rest] = c.trim().split('=');
            return [key, rest.join('=')];
          })
        );
        token = cookies['session'];
      }

      if (token) {
        await deleteSession(token, env.KV);
      }
    }

    const response = jsonResponse<ApiResponse<null>>({
      data: null,
      error: null
    });

    response.headers.append('Set-Cookie', clearSessionCookie(env));

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return errorResponse('INTERNAL_ERROR', 'Logout failed', 500);
  }
}

export async function handleSession(request: Request, env: Env): Promise<Response> {
  try {
    const session = await getAdminFromRequest(request, env.KV);

    if (!session) {
      return jsonResponse<ApiResponse<{ authenticated: boolean }>>({
        data: { authenticated: false },
        error: null
      }, 401);
    }

    const db = new Database(env.DB);
    const admin = await db.getOne<{ id: number; email: string; updated_at: string }>(
      'SELECT id, email, updated_at FROM admins WHERE id = ?',
      [session.adminId]
    );

    if (!admin) {
      return jsonResponse<ApiResponse<{ authenticated: boolean }>>({
        data: { authenticated: false },
        error: null
      }, 401);
    }

    return jsonResponse<ApiResponse<{ authenticated: boolean; admin: { id: number; email: string } }>>({
      data: {
        authenticated: true,
        admin: {
          id: admin.id,
          email: admin.email
        }
      },
      error: null
    });
  } catch (error) {
    console.error('Session check error:', error);
    return errorResponse('INTERNAL_ERROR', 'Session check failed', 500);
  }
}

export async function handleForgotPassword(request: Request, env: Env): Promise<Response> {
  const clientIp = getClientIp(request);
  const rateLimitKey = `forgot:${clientIp}`;

  if (!checkRateLimit(rateLimitKey, 3, 60_000)) {
    return errorResponse('RATE_LIMIT_EXCEEDED', 'Too many requests. Please try again later.', 429);
  }

  try {
    const body = await request.json();
    const parseResult = ForgotPasswordRequestSchema.safeParse(body);

    if (!parseResult.success) {
      return errorResponse(
        'VALIDATION_ERROR',
        'Invalid request',
        400,
        parseResult.error.flatten().fieldErrors as Record<string, string>
      );
    }

    const { email }: ForgotPasswordRequest = parseResult.data;
    const db = new Database(env.DB);

    const admin = await db.getOne<{ id: number }>(
      'SELECT id FROM admins WHERE email = ?',
      [email]
    );

    if (admin) {
      const resetToken = await generatePasswordResetToken(env.KV);
      await sendPasswordResetEmail(email, resetToken, env);
    }

    return jsonResponse<ApiResponse<null>>({
      data: null,
      error: null
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return errorResponse('INTERNAL_ERROR', 'Request failed', 500);
  }
}

export async function handleResetPassword(request: Request, env: Env): Promise<Response> {
  try {
    const body = await request.json();
    const parseResult = ResetPasswordRequestSchema.safeParse(body);

    if (!parseResult.success) {
      return errorResponse(
        'VALIDATION_ERROR',
        'Invalid request',
        400,
        parseResult.error.flatten().fieldErrors as Record<string, string>
      );
    }

    const { token, password }: ResetPasswordRequest = parseResult.data;

    const isValid = await consumePasswordResetToken(token, env.KV);
    if (!isValid) {
      return errorResponse('INVALID_TOKEN', 'Invalid or expired reset token', 400);
    }

    const db = new Database(env.DB);
    const admin = await db.getOne<{ id: number }>(
      'SELECT id FROM admins WHERE email_verified_at IS NOT NULL LIMIT 1'
    );

    if (!admin) {
      return errorResponse('INVALID_TOKEN', 'Invalid or expired reset token', 400);
    }

    const passwordHash = await hashPassword(password);
    await db.update(
      'admins',
      { password_hash: passwordHash, updated_at: new Date().toISOString() },
      'id = ?',
      [admin.id]
    );

    return jsonResponse<ApiResponse<null>>({
      data: null,
      error: null
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return errorResponse('INTERNAL_ERROR', 'Password reset failed', 500);
  }
}
