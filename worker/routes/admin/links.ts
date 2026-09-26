import type { Env, ApiResponse, Link } from '../../types';
import { Database } from '../../db';
import {
  LinkCreateRequestSchema,
  LinkUpdateRequestSchema,
  type LinkCreateRequest,
  type LinkUpdateRequest
} from '../../validation';
import { getAdminFromRequest } from '../../auth';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
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

async function requireAdmin(request: Request, env: Env): Promise<{ adminId: number } | Response> {
  const session = await getAdminFromRequest(request, env.KV);
  if (!session) {
    return errorResponse('UNAUTHORIZED', 'Authentication required', 401);
  }
  return session;
}

function toLink(row: Record<string, unknown>): Link {
  return {
    id: row.id as number,
    label: row.label as string,
    type: row.type as string,
    url: row.url as string,
    icon_key: row.icon_key as string,
    sort_order: row.sort_order as number,
    active: row.active as number,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string
  };
}

export async function handleGetAdminLinks(request: Request, env: Env): Promise<Response> {
  const authResult = await requireAdmin(request, env);
  if (authResult instanceof Response) return authResult;

  try {
    const db = new Database(env.DB);
    const links = await db.getAll<Record<string, unknown>>(
      'SELECT * FROM links ORDER BY sort_order ASC, id ASC'
    );

    const result = links.map(toLink);
    return jsonResponse<ApiResponse<typeof result>>({
      data: result,
      error: null
    });
  } catch (error) {
    console.error('Failed to fetch links:', error);
    return errorResponse('INTERNAL_ERROR', 'Failed to fetch links', 500);
  }
}

export async function handleCreateAdminLink(request: Request, env: Env): Promise<Response> {
  const authResult = await requireAdmin(request, env);
  if (authResult instanceof Response) return authResult;

  try {
    const body = await request.json();
    const parseResult = LinkCreateRequestSchema.safeParse(body);

    if (!parseResult.success) {
      return errorResponse(
        'VALIDATION_ERROR',
        'Invalid request',
        400,
        parseResult.error.flatten().fieldErrors as Record<string, string>
      );
    }

    const data = parseResult.data;
    const db = new Database(env.DB);
    const now = new Date().toISOString();

    const { id } = await db.insert('links', {
      label: data.label,
      type: data.type,
      url: data.url,
      icon_key: data.icon_key,
      sort_order: data.sort_order,
      active: data.active ? 1 : 0,
      created_at: now,
      updated_at: now
    });

    const link = await db.getOne<Record<string, unknown>>('SELECT * FROM links WHERE id = ?', [id]);
    return jsonResponse<ApiResponse<Link>>({
      data: toLink(link!),
      error: null
    }, 201);
  } catch (error) {
    console.error('Failed to create link:', error);
    return errorResponse('INTERNAL_ERROR', 'Failed to create link', 500);
  }
}

export async function handleUpdateAdminLink(request: Request, env: Env, id: number): Promise<Response> {
  const authResult = await requireAdmin(request, env);
  if (authResult instanceof Response) return authResult;

  try {
    const body = await request.json();
    const parseResult = LinkUpdateRequestSchema.safeParse(body);

    if (!parseResult.success) {
      return errorResponse(
        'VALIDATION_ERROR',
        'Invalid request',
        400,
        parseResult.error.flatten().fieldErrors as Record<string, string>
      );
    }

    const data = parseResult.data;
    const db = new Database(env.DB);

    const existing = await db.getOne<{ id: number }>('SELECT id FROM links WHERE id = ?', [id]);
    if (!existing) {
      return errorResponse('NOT_FOUND', 'Link not found', 404);
    }

    const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (data.label !== undefined) updateData.label = data.label;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.url !== undefined) updateData.url = data.url;
    if (data.icon_key !== undefined) updateData.icon_key = data.icon_key;
    if (data.sort_order !== undefined) updateData.sort_order = data.sort_order;
    if (data.active !== undefined) updateData.active = data.active ? 1 : 0;

    await db.update('links', updateData, 'id = ?', [id]);

    const link = await db.getOne<Record<string, unknown>>('SELECT * FROM links WHERE id = ?', [id]);
    return jsonResponse<ApiResponse<Link>>({
      data: toLink(link!),
      error: null
    });
  } catch (error) {
    console.error('Failed to update link:', error);
    return errorResponse('INTERNAL_ERROR', 'Failed to update link', 500);
  }
}

export async function handleDeleteAdminLink(request: Request, env: Env, id: number): Promise<Response> {
  const authResult = await requireAdmin(request, env);
  if (authResult instanceof Response) return authResult;

  try {
    const db = new Database(env.DB);
    const result = await db.delete('links', 'id = ?', [id]);

    if (result.changes === 0) {
      return errorResponse('NOT_FOUND', 'Link not found', 404);
    }

    return jsonResponse<ApiResponse<null>>({
      data: null,
      error: null
    });
  } catch (error) {
    console.error('Failed to delete link:', error);
    return errorResponse('INTERNAL_ERROR', 'Failed to delete link', 500);
  }
}
