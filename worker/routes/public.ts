import type { Env, ApiResponse, Profile, ProfileImage, PaginatedResponse, Project, ProjectWithRelations, Technology, PaginationInfo } from '../types';
import { Database } from '../db';
import { PaginationQuerySchema } from '../validation';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
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

function toTechnology(row: Record<string, unknown>): Technology {
  return {
    id: row.id as number,
    name: row.name as string,
    slug: row.slug as string,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string
  };
}

function toProjectWithRelations(project: Project, relations: {
  category: Record<string, unknown> | null;
  images: Record<string, unknown>[];
  links: Record<string, unknown>[];
  technologies: (Record<string, unknown> & { technology: { id: number; name: string; slug: string; created_at: string; updated_at: string } })[];
  caseStudySections: Record<string, unknown>[];
}): ProjectWithRelations {
  return {
    ...project,
    category: relations.category
      ? {
          id: relations.category.id as number,
          name: relations.category.name as string,
          slug: relations.category.slug as string,
          created_at: relations.category.created_at as string,
          updated_at: relations.category.updated_at as string
        }
      : null,
    images: relations.images.map((img) => ({
      id: img.id as number,
      project_id: img.project_id as number,
      imagekit_file_id: img.imagekit_file_id as string | null,
      image_url: img.image_url as string,
      alt_text: img.alt_text as string,
      image_type: img.image_type as string,
      sort_order: img.sort_order as number,
      is_primary: img.is_primary as number,
      created_at: img.created_at as string,
      updated_at: img.updated_at as string
    })),
    links: relations.links.map((link) => ({
      id: link.id as number,
      project_id: link.project_id as number,
      label: link.label as string,
      type: link.type as string,
      url: link.url as string,
      sort_order: link.sort_order as number,
      created_at: link.created_at as string
    })),
    technologies: relations.technologies.map((pt) => ({
      id: pt.id as number,
      project_id: pt.project_id as number,
      technology_id: pt.technology_id as number,
      created_at: pt.created_at as string,
      technology: toTechnology(pt.technology)
    })),
    case_study_sections: relations.caseStudySections.map((section) => ({
      id: section.id as number,
      project_id: section.project_id as number,
      section_type: section.section_type as string,
      heading: section.heading as string,
      body: section.body as string,
      sort_order: section.sort_order as number,
      active: section.active as number,
      created_at: section.created_at as string,
      updated_at: section.updated_at as string
    }))
  };
}

export async function handleGetProfile(request: Request, env: Env): Promise<Response> {
  try {
    const db = new Database(env.DB);

    const profileRow = await db.getOne<Record<string, unknown>>('SELECT * FROM profile WHERE id = 1');
    if (!profileRow) {
      return errorResponse('NOT_FOUND', 'Profile not found', 404);
    }

    const profile = toProfile(profileRow);

    const images = await db.getAll<Record<string, unknown>>(
      'SELECT * FROM profile_images WHERE active = 1 ORDER BY sort_order ASC, id ASC'
    );
    const profileImages = images.map(toProfileImage);

    return jsonResponse<ApiResponse<{ profile: Profile; images: ProfileImage[] }>>({
      data: { profile, images: profileImages },
      error: null
    });
  } catch (error) {
    console.error('Failed to fetch profile:', error);
    return errorResponse('INTERNAL_ERROR', 'Failed to fetch profile', 500);
  }
}

export async function handleGetProjects(request: Request, env: Env): Promise<Response> {
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

    let whereClause = 'WHERE p.published = 1';
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
      SELECT
        p.*,
        c.name as category_name,
        c.slug as category_slug
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

    const projects: Project[] = projectRows.map(toProject);

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
    console.error('Failed to fetch projects:', error);
    return errorResponse('INTERNAL_ERROR', 'Failed to fetch projects', 500);
  }
}

export async function handleGetProject(
  request: Request,
  env: Env,
  slug: string
): Promise<Response> {
  try {
    const db = new Database(env.DB);

    const projectRow = await db.getOne<Record<string, unknown>>(
      `SELECT p.*, c.name as category_name, c.slug as category_slug
       FROM projects p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.slug = ? AND p.published = 1`,
      [slug]
    );

    if (!projectRow) {
      return errorResponse('NOT_FOUND', 'Project not found', 404);
    }

    const project = toProject(projectRow);

    const category = projectRow.category_id
      ? {
          id: projectRow.category_id as number,
          name: projectRow.category_name as string,
          slug: projectRow.category_slug as string,
          created_at: '',
          updated_at: ''
        }
      : null;

    const [images, links, techRows, caseStudyRows] = await Promise.all([
      db.getAll<Record<string, unknown>>(
        'SELECT * FROM project_images WHERE project_id = ? ORDER BY sort_order ASC, id ASC',
        [project.id]
      ),
      db.getAll<Record<string, unknown>>(
        'SELECT * FROM project_links WHERE project_id = ? ORDER BY sort_order ASC, id ASC',
        [project.id]
      ),
      db.getAll<Record<string, unknown> & { technology: Record<string, unknown> }>(
        `SELECT pt.*, t.name as technology_name, t.slug as technology_slug
         FROM project_technologies pt
         JOIN technologies t ON pt.technology_id = t.id
         WHERE pt.project_id = ?
         ORDER BY t.name ASC`,
        [project.id]
      ),
      db.getAll<Record<string, unknown>>(
        'SELECT * FROM case_study_sections WHERE project_id = ? AND active = 1 ORDER BY sort_order ASC, id ASC',
        [project.id]
      )
    ]);

    const relations = {
      category,
      images: images.map((img) => ({
        id: img.id as number,
        project_id: img.project_id as number,
        imagekit_file_id: img.imagekit_file_id as string | null,
        image_url: img.image_url as string,
        alt_text: img.alt_text as string,
        image_type: img.image_type as string,
        sort_order: img.sort_order as number,
        is_primary: img.is_primary as number,
        created_at: img.created_at as string,
        updated_at: img.updated_at as string
      })),
      links: links.map((link) => ({
        id: link.id as number,
        project_id: link.project_id as number,
        label: link.label as string,
        type: link.type as string,
        url: link.url as string,
        sort_order: link.sort_order as number,
        created_at: link.created_at as string
      })),
      technologies: techRows.map((pt) => ({
        id: pt.id as number,
        project_id: pt.project_id as number,
        technology_id: pt.technology_id as number,
        created_at: pt.created_at as string,
        technology: toTechnology(pt.technology)
      })),
      caseStudySections: caseStudyRows.map((section) => ({
        id: section.id as number,
        project_id: section.project_id as number,
        section_type: section.section_type as string,
        heading: section.heading as string,
        body: section.body as string,
        sort_order: section.sort_order as number,
        active: section.active as number,
        created_at: section.created_at as string,
        updated_at: section.updated_at as string
      }))
    };

    const projectWithRelations = toProjectWithRelations(project, relations);

    return jsonResponse<ApiResponse<ProjectWithRelations>>({
      data: projectWithRelations,
      error: null
    });
  } catch (error) {
    console.error('Failed to fetch project:', error);
    return errorResponse('INTERNAL_ERROR', 'Failed to fetch project', 500);
  }
}

export async function handleGetCapabilities(request: Request, env: Env): Promise<Response> {
  try {
    const db = new Database(env.DB);

    const capabilities = await db.getAll<Record<string, unknown>>(
      'SELECT * FROM capabilities WHERE active = 1 ORDER BY sort_order ASC, id ASC'
    );

    const result = capabilities.map((cap) => ({
      id: cap.id as number,
      name: cap.name as string,
      description: cap.description as string,
      icon_key: cap.icon_key as string,
      sort_order: cap.sort_order as number,
      active: cap.active as number,
      created_at: cap.created_at as string,
      updated_at: cap.updated_at as string
    }));

    return jsonResponse<ApiResponse<typeof result>>({
      data: result,
      error: null
    });
  } catch (error) {
    console.error('Failed to fetch capabilities:', error);
    return errorResponse('INTERNAL_ERROR', 'Failed to fetch capabilities', 500);
  }
}

export async function handleGetLinks(request: Request, env: Env): Promise<Response> {
  try {
    const db = new Database(env.DB);

    const links = await db.getAll<Record<string, unknown>>(
      'SELECT * FROM links WHERE active = 1 ORDER BY sort_order ASC, id ASC'
    );

    const result = links.map((link) => ({
      id: link.id as number,
      label: link.label as string,
      type: link.type as string,
      url: link.url as string,
      icon_key: link.icon_key as string,
      sort_order: link.sort_order as number,
      active: link.active as number,
      created_at: link.created_at as string,
      updated_at: link.updated_at as string
    }));

    return jsonResponse<ApiResponse<typeof result>>({
      data: result,
      error: null
    });
  } catch (error) {
    console.error('Failed to fetch links:', error);
    return errorResponse('INTERNAL_ERROR', 'Failed to fetch links', 500);
  }
}
