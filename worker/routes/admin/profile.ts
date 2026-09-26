import type { Env, ApiResponse, Profile, ProfileImage } from '../../types';
import { Database } from '../../db';
import {
  ProfileUpdateRequestSchema,
  ProfileImageCreateSchema,
  ProfileImageUpdateSchema,
  type ProfileUpdateRequest,
  type ProfileImageCreateRequest,
  type ProfileImageUpdateRequest
} from '../../validation';
import { getAdminFromRequest } from '../../auth';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, PATCH, POST, DELETE, OPTIONS',
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

function toProfile(row: Record<string, unknown>): Profile {
  return {
    id: row.id as number,
    name: row.name as string,
    professional_title: row.professional_title as string,
    short_intro: row.short_intro as string,
    biography: row.biography as string,
    longer_about: row.longer_about as string,
    contact_email: row.contact_email as string,
    location: row.location as string,
    updated_at: row.updated_at as string
  };
}

function toProfileImage(row: Record<string, unknown>): ProfileImage {
  return {
    id: row.id as number,
    purpose: row.purpose as string,
    imagekit_file_id: row.imagekit_file_id as string | null,
    image_url: row.image_url as string,
    alt_text: row.alt_text as string,
    sort_order: row.sort_order as number,
    active: row.active as number,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string
  };
}

export async function handleGetAdminProfile(request: Request, env: Env): Promise<Response> {
  const authResult = await requireAdmin(request, env);
  if (authResult instanceof Response) return authResult;

  try {
    const db = new Database(env.DB);
    const profile = await db.getOne<Record<string, unknown>>('SELECT * FROM profile WHERE id = 1');

    if (!profile) {
      return errorResponse('NOT_FOUND', 'Profile not found', 404);
    }

    return jsonResponse<ApiResponse<Profile>>({
      data: toProfile(profile),
      error: null
    });
  } catch (error) {
    console.error('Failed to fetch profile:', error);
    return errorResponse('INTERNAL_ERROR', 'Failed to fetch profile', 500);
  }
}

export async function handleUpdateAdminProfile(request: Request, env: Env): Promise<Response> {
  const authResult = await requireAdmin(request, env);
  if (authResult instanceof Response) return authResult;

  try {
    const body = await request.json();
    const parseResult = ProfileUpdateRequestSchema.safeParse(body);

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

    const existing = await db.getOne<{ id: number }>('SELECT id FROM profile WHERE id = 1');
    if (!existing) {
      return errorResponse('NOT_FOUND', 'Profile not found', 404);
    }

    const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (data.name !== undefined) updateData.name = data.name;
    if (data.professional_title !== undefined) updateData.professional_title = data.professional_title;
    if (data.short_intro !== undefined) updateData.short_intro = data.short_intro;
    if (data.biography !== undefined) updateData.biography = data.biography;
    if (data.longer_about !== undefined) updateData.longer_about = data.longer_about;
    if (data.contact_email !== undefined) updateData.contact_email = data.contact_email;
    if (data.location !== undefined) updateData.location = data.location;

    await db.update('profile', updateData, 'id = ?', [1]);

    const profile = await db.getOne<Record<string, unknown>>('SELECT * FROM profile WHERE id = 1');
    return jsonResponse<ApiResponse<Profile>>({
      data: toProfile(profile!),
      error: null
    });
  } catch (error) {
    console.error('Failed to update profile:', error);
    return errorResponse('INTERNAL_ERROR', 'Failed to update profile', 500);
  }
}

export async function handleGetAdminProfileImages(request: Request, env: Env): Promise<Response> {
  const authResult = await requireAdmin(request, env);
  if (authResult instanceof Response) return authResult;

  try {
    const db = new Database(env.DB);
    const images = await db.getAll<Record<string, unknown>>(
      'SELECT * FROM profile_images ORDER BY sort_order ASC, id ASC'
    );

    const result = images.map(toProfileImage);
    return jsonResponse<ApiResponse<typeof result>>({
      data: result,
      error: null
    });
  } catch (error) {
    console.error('Failed to fetch profile images:', error);
    return errorResponse('INTERNAL_ERROR', 'Failed to fetch profile images', 500);
  }
}

export async function handleCreateAdminProfileImage(request: Request, env: Env): Promise<Response> {
  const authResult = await requireAdmin(request, env);
  if (authResult instanceof Response) return authResult;

  try {
    const body = await request.json();
    const parseResult = ProfileImageCreateSchema.safeParse(body);

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

    const { id } = await db.insert('profile_images', {
      purpose: data.purpose,
      imagekit_file_id: data.imagekit_file_id || null,
      image_url: data.image_url,
      alt_text: data.alt_text,
      sort_order: data.sort_order,
      active: data.active ? 1 : 0,
      created_at: now,
      updated_at: now
    });

    const image = await db.getOne<Record<string, unknown>>('SELECT * FROM profile_images WHERE id = ?', [id]);
    return jsonResponse<ApiResponse<ProfileImage>>({
      data: toProfileImage(image!),
      error: null
    }, 201);
  } catch (error) {
    console.error('Failed to create profile image:', error);
    return errorResponse('INTERNAL_ERROR', 'Failed to create profile image', 500);
  }
}

export async function handleUpdateAdminProfileImage(request: Request, env: Env, id: number): Promise<Response> {
  const authResult = await requireAdmin(request, env);
  if (authResult instanceof Response) return authResult;

  try {
    const body = await request.json();
    const parseResult = ProfileImageUpdateSchema.safeParse(body);

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

    const existing = await db.getOne<{ id: number }>(
      'SELECT id FROM profile_images WHERE id = ?',
      [id]
    );

    if (!existing) {
      return errorResponse('NOT_FOUND', 'Profile image not found', 404);
    }

    const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (data.purpose !== undefined) updateData.purpose = data.purpose;
    if (data.image_url !== undefined) updateData.image_url = data.image_url;
    if (data.alt_text !== undefined) updateData.alt_text = data.alt_text;
    if (data.sort_order !== undefined) updateData.sort_order = data.sort_order;
    if (data.active !== undefined) updateData.active = data.active ? 1 : 0;
    if (data.imagekit_file_id !== undefined) updateData.imagekit_file_id = data.imagekit_file_id || null;

    await db.update('profile_images', updateData, 'id = ?', [id]);

    const image = await db.getOne<Record<string, unknown>>('SELECT * FROM profile_images WHERE id = ?', [id]);
    return jsonResponse<ApiResponse<ProfileImage>>({
      data: toProfileImage(image!),
      error: null
    });
  } catch (error) {
    console.error('Failed to update profile image:', error);
    return errorResponse('INTERNAL_ERROR', 'Failed to update profile image', 500);
  }
}

export async function handleDeleteAdminProfileImage(request: Request, env: Env, id: number): Promise<Response> {
  const authResult = await requireAdmin(request, env);
  if (authResult instanceof Response) return authResult;

  try {
    const db = new Database(env.DB);
    const result = await db.delete('profile_images', 'id = ?', [id]);

    if (result.changes === 0) {
      return errorResponse('NOT_FOUND', 'Profile image not found', 404);
    }

    return jsonResponse<ApiResponse<null>>({
      data: null,
      error: null
    });
  } catch (error) {
    console.error('Failed to delete profile image:', error);
    return errorResponse('INTERNAL_ERROR', 'Failed to delete profile image', 500);
  }
}
