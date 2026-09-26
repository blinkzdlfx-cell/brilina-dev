import type { Env, ApiResponse, ApiError, PaginatedResponse, Project, ProjectWithRelations, ProjectImage, ProjectLink, ProjectTechnology, CaseStudySection, PaginationInfo } from '../../types';
import { Database } from '../../db';
import {
  PaginationQuerySchema,
  ProjectCreateRequestSchema,
  ProjectUpdateRequestSchema,
  ProjectImageCreateSchema,
  ProjectImageUpdateSchema,
  CaseStudySectionRequestSchema,
  type PaginationQuery,
  type ProjectCreateRequest,
  type ProjectUpdateRequest,
  type ProjectImageCreateRequest,
  type ProjectImageUpdateRequest,
  type CaseStudySectionRequest
} from '../../validation';
import { getAdminFromRequest, checkRateLimit, getClientIp } from '../../auth';

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

function toProject(row: Record<string, unknown>): Project {
  return {
    id: row.id as number,
    name: row.name as string,
    slug: row.slug as string,
    tagline: row.tagline as string,
    short_description: row.short_description as string,
    full_description: row.full_description as string,
    category_id: row.category_id as number | null,
    status: row.status as string,
    featured: row.featured as number,
    published: row.published as number,
    sort_order: row.sort_order as number,
    meta_title: row.meta_title as string,
    meta_description: row.meta_description as string,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
    published_at: row.published_at as string | null
  };
}

function toProjectImage(row: Record<string, unknown>): ProjectImage {
  return {
    id: row.id as number,
    project_id: row.project_id as number,
    imagekit_file_id: row.imagekit_file_id as string | null,
    image_url: row.image_url as string,
    alt_text: row.alt_text as string,
    image_type: row.image_type as string,
    sort_order: row.sort_order as number,
    is_primary: row.is_primary as number,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string
  };
}

function toProjectLink(row: Record<string, unknown>): ProjectLink {
  return {
    id: row.id as number,
    project_id: row.project_id as number,
    label: row.label as string,
    type: row.type as string,
    url: row.url as string,
    sort_order: row.sort_order as number,
    created_at: row.created_at as string
  };
}

function toProjectTechnology(row: Record<string, unknown> & { technology: Record<string, unknown> }): ProjectTechnology & { technology: Record<string, unknown> } {
  return {
    id: row.id as number,
    project_id: row.project_id as number,
    technology_id: row.technology_id as number,
    created_at: row.created_at as string,
    technology: {
      id: row.technology.id as number,
      name: row.technology.name as string,
      slug: row.technology.slug as string,
      created_at: row.technology.created_at as string,
      updated_at: row.technology.updated_at as string
    }
  };
}

function toCaseStudySection(row: Record<string, unknown>): CaseStudySection {
  return {
    id: row.id as number,
    project_id: row.project_id as number,
    section_type: row.section_type as string,
    heading: row.heading as string,
    body: row.body as string,
    sort_order: row.sort_order as number,
    active: row.active as number,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string
  };
}

export async function handleGetAdminProjects(request: Request, env: Env): Promise<Response> {
  const authResult = await requireAdmin(request, env);
  if (authResult instanceof Response) return authResult;

  try {
    const db = new Database(env.DB);
    const url = new URL(request.url);

    const paginationResult = PaginationQuerySchema.safeParse({
      page: url.searchParams.get('page'),
      limit: url.searchParams.get('limit'),
      search: url.searchParams.get('search'),
      category: url.searchParams.get('category'),
      featured: url.searchParams.get('featured')
    });

    if (!paginationResult.success) {
      return errorResponse(
        'VALIDATION_ERROR',
        'Invalid query parameters',
        400,
        paginationResult.error.flatten().fieldErrors as Record<string, string>
      );
    }

    const { page, limit, search, category, featured } = paginationResult.data;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    const params: unknown[] = [];

    if (search) {
      whereClause += ' AND (p.name LIKE ? OR p.tagline LIKE ? OR p.short_description LIKE ?)';
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    if (category) {
      whereClause += ' AND c.slug = ?';
      params.push(category);
    }

    if (featured) {
      whereClause += ' AND p.featured = 1';
    }

    const countQuery = `
      SELECT COUNT(*) as total
      FROM projects p
      LEFT JOIN categories c ON p.category_id = c.id
      ${whereClause}
    `;

    const countRow = await db.getOne<{ total: number }>(countQuery, params);
    const total = countRow?.total ?? 0;
    const totalPages = Math.ceil(total / limit);

    const projectsQuery = `
      SELECT p.*, c.name as category_name, c.slug as category_slug
      FROM projects p
      LEFT JOIN categories c ON p.category_id = c.id
      ${whereClause}
      ORDER BY p.sort_order ASC, p.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const projectRows = await db.getAll<Record<string, unknown>>(projectsQuery, [
      ...params,
      limit,
      offset
    ]);

    const projects = projectRows.map(toProject);

    const pagination: PaginationInfo = {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1
    };

    return jsonResponse<PaginatedResponse<Project>>({
      data: projects,
      pagination,
      error: null
    });
  } catch (error) {
    console.error('Failed to fetch admin projects:', error);
    return errorResponse('INTERNAL_ERROR', 'Failed to fetch projects', 500);
  }
}

export async function handleCreateAdminProject(request: Request, env: Env): Promise<Response> {
  const authResult = await requireAdmin(request, env);
  if (authResult instanceof Response) return authResult;

  const clientIp = getClientIp(request);
  if (!checkRateLimit(`project:create:${clientIp}`, 10, 60_000)) {
    return errorResponse('RATE_LIMIT_EXCEEDED', 'Too many requests', 429);
  }

  try {
    const body = await request.json();
    const parseResult = ProjectCreateRequestSchema.safeParse(body);

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
      'SELECT id FROM projects WHERE slug = ?',
      [data.slug]
    );

    if (existing) {
      return errorResponse('VALIDATION_ERROR', 'Project slug already exists', 409, {
        slug: 'Project slug already exists'
      });
    }

    const now = new Date().toISOString();
    const { id } = await db.insert('projects', {
      name: data.name,
      slug: data.slug,
      tagline: data.tagline,
      short_description: data.short_description,
      full_description: data.full_description,
      category_id: data.category_id ?? null,
      status: data.status,
      featured: data.featured ? 1 : 0,
      published: data.published ? 1 : 0,
      sort_order: data.sort_order,
      meta_title: data.meta_title,
      meta_description: data.meta_description,
      created_at: now,
      updated_at: now
    });

    if (data.technology_ids.length > 0) {
      for (const techId of data.technology_ids) {
        await db.insert('project_technologies', {
          project_id: id,
          technology_id: techId,
          created_at: now
        });
      }
    }

    const project = await db.getOne<Record<string, unknown>>('SELECT * FROM projects WHERE id = ?', [id]);
    return jsonResponse<ApiResponse<Project>>({
      data: toProject(project!),
      error: null
    }, 201);
  } catch (error) {
    console.error('Failed to create project:', error);
    return errorResponse('INTERNAL_ERROR', 'Failed to create project', 500);
  }
}

export async function handleGetAdminProject(request: Request, env: Env, id: number): Promise<Response> {
  const authResult = await requireAdmin(request, env);
  if (authResult instanceof Response) return authResult;

  try {
    const db = new Database(env.DB);
    const projectRow = await db.getOne<Record<string, unknown>>('SELECT * FROM projects WHERE id = ?', [id]);

    if (!projectRow) {
      return errorResponse('NOT_FOUND', 'Project not found', 404);
    }

    const project = toProject(projectRow);

    const [images, links, techRows, caseStudyRows] = await Promise.all([
      db.getAll<Record<string, unknown>>('SELECT * FROM project_images WHERE project_id = ? ORDER BY sort_order ASC, id ASC', [id]),
      db.getAll<Record<string, unknown>>('SELECT * FROM project_links WHERE project_id = ? ORDER BY sort_order ASC, id ASC', [id]),
      db.getAll<Record<string, unknown> & { technology: Record<string, unknown> }>(
        `SELECT pt.*, t.name as technology_name, t.slug as technology_slug FROM project_technologies pt JOIN technologies t ON pt.technology_id = t.id WHERE pt.project_id = ? ORDER BY t.name ASC`,
        [id]
      ),
      db.getAll<Record<string, unknown>>('SELECT * FROM case_study_sections WHERE project_id = ? ORDER BY sort_order ASC, id ASC', [id])
    ]);

    const relations = {
      category: projectRow.category_id ? { id: projectRow.category_id as number, name: '', slug: '', created_at: '', updated_at: '' } : null,
      images: images.map(toProjectImage),
      links: links.map(toProjectLink),
      technologies: techRows.map(toProjectTechnology),
      caseStudySections: caseStudyRows.map(toCaseStudySection)
    };

    return jsonResponse<ApiResponse<ProjectWithRelations>>({
      data: {
        ...project,
        ...relations,
        category: relations.category,
        case_study_sections: relations.caseStudySections
      } as unknown as ProjectWithRelations,
      error: null
    });
  } catch (error) {
    console.error('Failed to fetch project:', error);
    return errorResponse('INTERNAL_ERROR', 'Failed to fetch project', 500);
  }
}

export async function handleUpdateAdminProject(request: Request, env: Env, id: number): Promise<Response> {
  const authResult = await requireAdmin(request, env);
  if (authResult instanceof Response) return authResult;

  try {
    const body = await request.json();
    const parseResult = ProjectUpdateRequestSchema.safeParse(body);

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

    const existing = await db.getOne<{ id: number }>('SELECT id FROM projects WHERE id = ?', [id]);
    if (!existing) {
      return errorResponse('NOT_FOUND', 'Project not found', 404);
    }

    if (data.slug) {
      const slugExists = await db.getOne<{ id: number }>(
        'SELECT id FROM projects WHERE slug = ? AND id != ?',
        [data.slug, id]
      );
      if (slugExists) {
        return errorResponse('VALIDATION_ERROR', 'Project slug already exists', 409, {
          slug: 'Project slug already exists'
        });
      }
    }

    const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (data.name !== undefined) updateData.name = data.name;
    if (data.slug !== undefined) updateData.slug = data.slug;
    if (data.tagline !== undefined) updateData.tagline = data.tagline;
    if (data.short_description !== undefined) updateData.short_description = data.short_description;
    if (data.full_description !== undefined) updateData.full_description = data.full_description;
    if (data.category_id !== undefined) updateData.category_id = data.category_id;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.featured !== undefined) updateData.featured = data.featured ? 1 : 0;
    if (data.published !== undefined) updateData.published = data.published ? 1 : 0;
    if (data.sort_order !== undefined) updateData.sort_order = data.sort_order;
    if (data.meta_title !== undefined) updateData.meta_title = data.meta_title;
    if (data.meta_description !== undefined) updateData.meta_description = data.meta_description;

    await db.update('projects', updateData, 'id = ?', [id]);

    if (data.technology_ids !== undefined) {
      await db.run('DELETE FROM project_technologies WHERE project_id = ?', [id]);
      const now = new Date().toISOString();
      for (const techId of data.technology_ids) {
        await db.insert('project_technologies', {
          project_id: id,
          technology_id: techId,
          created_at: now
        });
      }
    }

    const project = await db.getOne<Record<string, unknown>>('SELECT * FROM projects WHERE id = ?', [id]);
    return jsonResponse<ApiResponse<Project>>({
      data: toProject(project!),
      error: null
    });
  } catch (error) {
    console.error('Failed to update project:', error);
    return errorResponse('INTERNAL_ERROR', 'Failed to update project', 500);
  }
}

export async function handleDeleteAdminProject(request: Request, env: Env, id: number): Promise<Response> {
  const authResult = await requireAdmin(request, env);
  if (authResult instanceof Response) return authResult;

  try {
    const db = new Database(env.DB);
    const result = await db.delete('projects', 'id = ?', [id]);

    if (result.changes === 0) {
      return errorResponse('NOT_FOUND', 'Project not found', 404);
    }

    return jsonResponse<ApiResponse<null>>({
      data: null,
      error: null
    });
  } catch (error) {
    console.error('Failed to delete project:', error);
    return errorResponse('INTERNAL_ERROR', 'Failed to delete project', 500);
  }
}

export async function handlePublishProject(request: Request, env: Env, id: number): Promise<Response> {
  const authResult = await requireAdmin(request, env);
  if (authResult instanceof Response) return authResult;

  try {
    const db = new Database(env.DB);
    const existing = await db.getOne<{ id: number }>('SELECT id FROM projects WHERE id = ?', [id]);

    if (!existing) {
      return errorResponse('NOT_FOUND', 'Project not found', 404);
    }

    const now = new Date().toISOString();
    await db.update(
      'projects',
      { published: 1, published_at: now, updated_at: now },
      'id = ?',
      [id]
    );

    const project = await db.getOne<Record<string, unknown>>('SELECT * FROM projects WHERE id = ?', [id]);
    return jsonResponse<ApiResponse<Project>>({
      data: toProject(project!),
      error: null
    });
  } catch (error) {
    console.error('Failed to publish project:', error);
    return errorResponse('INTERNAL_ERROR', 'Failed to publish project', 500);
  }
}

export async function handleUnpublishProject(request: Request, env: Env, id: number): Promise<Response> {
  const authResult = await requireAdmin(request, env);
  if (authResult instanceof Response) return authResult;

  try {
    const db = new Database(env.DB);
    const existing = await db.getOne<{ id: number }>('SELECT id FROM projects WHERE id = ?', [id]);

    if (!existing) {
      return errorResponse('NOT_FOUND', 'Project not found', 404);
    }

    const now = new Date().toISOString();
    await db.update(
      'projects',
      { published: 0, published_at: null, updated_at: now },
      'id = ?',
      [id]
    );

    const project = await db.getOne<Record<string, unknown>>('SELECT * FROM projects WHERE id = ?', [id]);
    return jsonResponse<ApiResponse<Project>>({
      data: toProject(project!),
      error: null
    });
  } catch (error) {
    console.error('Failed to unpublish project:', error);
    return errorResponse('INTERNAL_ERROR', 'Failed to unpublish project', 500);
  }
}

export async function handleAddProjectImage(request: Request, env: Env, projectId: number): Promise<Response> {
  const authResult = await requireAdmin(request, env);
  if (authResult instanceof Response) return authResult;

  try {
    const body = await request.json();
    const parseResult = ProjectImageCreateSchema.safeParse(body);

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

    const project = await db.getOne<{ id: number }>('SELECT id FROM projects WHERE id = ?', [projectId]);
    if (!project) {
      return errorResponse('NOT_FOUND', 'Project not found', 404);
    }

    const now = new Date().toISOString();
    const { id } = await db.insert('project_images', {
      project_id: projectId,
      imagekit_file_id: data.imagekit_file_id || null,
      image_url: data.image_url,
      alt_text: data.alt_text,
      image_type: data.image_type,
      sort_order: data.sort_order,
      is_primary: data.is_primary ? 1 : 0,
      created_at: now,
      updated_at: now
    });

    const image = await db.getOne<Record<string, unknown>>('SELECT * FROM project_images WHERE id = ?', [id]);
    return jsonResponse<ApiResponse<ProjectImage>>({
      data: toProjectImage(image!),
      error: null
    }, 201);
  } catch (error) {
    console.error('Failed to add project image:', error);
    return errorResponse('INTERNAL_ERROR', 'Failed to add project image', 500);
  }
}

export async function handleUpdateProjectImage(request: Request, env: Env, projectId: number, imageId: number): Promise<Response> {
  const authResult = await requireAdmin(request, env);
  if (authResult instanceof Response) return authResult;

  try {
    const body = await request.json();
    const parseResult = ProjectImageUpdateSchema.safeParse(body);

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

    const image = await db.getOne<{ id: number; project_id: number }>(
      'SELECT id, project_id FROM project_images WHERE id = ?',
      [imageId]
    );

    if (!image || image.project_id !== projectId) {
      return errorResponse('NOT_FOUND', 'Image not found', 404);
    }

    const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (data.image_url !== undefined) updateData.image_url = data.image_url;
    if (data.alt_text !== undefined) updateData.alt_text = data.alt_text;
    if (data.image_type !== undefined) updateData.image_type = data.image_type;
    if (data.sort_order !== undefined) updateData.sort_order = data.sort_order;
    if (data.is_primary !== undefined) updateData.is_primary = data.is_primary ? 1 : 0;
    if (data.imagekit_file_id !== undefined) updateData.imagekit_file_id = data.imagekit_file_id || null;

    await db.update('project_images', updateData, 'id = ?', [imageId]);

    const updated = await db.getOne<Record<string, unknown>>('SELECT * FROM project_images WHERE id = ?', [imageId]);
    return jsonResponse<ApiResponse<ProjectImage>>({
      data: toProjectImage(updated!),
      error: null
    });
  } catch (error) {
    console.error('Failed to update project image:', error);
    return errorResponse('INTERNAL_ERROR', 'Failed to update project image', 500);
  }
}

export async function handleDeleteProjectImage(request: Request, env: Env, projectId: number, imageId: number): Promise<Response> {
  const authResult = await requireAdmin(request, env);
  if (authResult instanceof Response) return authResult;

  try {
    const db = new Database(env.DB);
    const result = await db.delete(
      'project_images',
      'id = ? AND project_id = ?',
      [imageId, projectId]
    );

    if (result.changes === 0) {
      return errorResponse('NOT_FOUND', 'Image not found', 404);
    }

    return jsonResponse<ApiResponse<null>>({
      data: null,
      error: null
    });
  } catch (error) {
    console.error('Failed to delete project image:', error);
    return errorResponse('INTERNAL_ERROR', 'Failed to delete project image', 500);
  }
}
