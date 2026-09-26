import type { Env, ApiResponse, Capability } from '../../types';
import { Database } from '../../db';
import {
  CapabilityCreateRequestSchema,
  CapabilityUpdateRequestSchema,
  type CapabilityCreateRequest,
  type CapabilityUpdateRequest
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

function toCapability(row: Record<string, unknown>): Capability {
  return {
    id: row.id as number,
    name: row.name as string,
    description: row.description as string,
    icon_key: row.icon_key as string,
    sort_order: row.sort_order as number,
    active: row.active as number,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string
  };
}

export async function handleGetAdminCapabilities(request: Request, env: Env): Promise<Response> {
  const authResult = await requireAdmin(request, env);
  if (authResult instanceof Response) return authResult;

  try {
    const db = new Database(env.DB);
    const capabilities = await db.getAll<Record<string, unknown>>(
      'SELECT * FROM capabilities ORDER BY sort_order ASC, id ASC'
    );

    const result = capabilities.map(toCapability);
    return jsonResponse<ApiResponse<typeof result>>({
      data: result,
      error: null
    });
  } catch (error) {
    console.error('Failed to fetch capabilities:', error);
    return errorResponse('INTERNAL_ERROR', 'Failed to fetch capabilities', 500);
  }
}

export async function handleCreateAdminCapability(request: Request, env: Env): Promise<Response> {
  const authResult = await requireAdmin(request, env);
  if (authResult instanceof Response) return authResult;

  try {
    const body = await request.json();
    const parseResult = CapabilityCreateRequestSchema.safeParse(body);

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

    const { id } = await db.insert('capabilities', {
      name: data.name,
      description: data.description,
      icon_key: data.icon_key,
      sort_order: data.sort_order,
      active: data.active ? 1 : 0,
      created_at: now,
      updated_at: now
    });

    const capability = await db.getOne<Record<string, unknown>>('SELECT * FROM capabilities WHERE id = ?', [id]);
    return jsonResponse<ApiResponse<Capability>>({
      data: toCapability(capability!),
      error: null
    }, 201);
  } catch (error) {
    console.error('Failed to create capability:', error);
    return errorResponse('INTERNAL_ERROR', 'Failed to create capability', 500);
  }
}

export async function handleUpdateAdminCapability(request: Request, env: Env, id: number): Promise<Response> {
  const authResult = await requireAdmin(request, env);
  if (authResult instanceof Response) return authResult;

  try {
    const body = await request.json();
    const parseResult = CapabilityUpdateRequestSchema.safeParse(body);

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

    const existing = await db.getOne<{ id: number }>('SELECT id FROM capabilities WHERE id = ?', [id]);
    if (!existing) {
      return errorResponse('NOT_FOUND', 'Capability not found', 404);
    }

    const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.icon_key !== undefined) updateData.icon_key = data.icon_key;
    if (data.sort_order !== undefined) updateData.sort_order = data.sort_order;
    if (data.active !== undefined) updateData.active = data.active ? 1 : 0;

    await db.update('capabilities', updateData, 'id = ?', [id]);

    const capability = await db.getOne<Record<string, unknown>>('SELECT * FROM capabilities WHERE id = ?', [id]);
    return jsonResponse<ApiResponse<Capability>>({
      data: toCapability(capability!),
      error: null
    });
  } catch (error) {
    console.error('Failed to update capability:', error);
    return errorResponse('INTERNAL_ERROR', 'Failed to update capability', 500);
  }
}

export async function handleDeleteAdminCapability(request: Request, env: Env, id: number): Promise<Response> {
  const authResult = await requireAdmin(request, env);
  if (authResult instanceof Response) return authResult;

  try {
    const db = new Database(env.DB);
    const result = await db.delete('capabilities', 'id = ?', [id]);

    if (result.changes === 0) {
      return errorResponse('NOT_FOUND', 'Capability not found', 404);
    }

    return jsonResponse<ApiResponse<null>>({
      data: null,
      error: null
    });
  } catch (error) {
    console.error('Failed to delete capability:', error);
    return errorResponse('INTERNAL_ERROR', 'Failed to delete capability', 500);
  }
}
