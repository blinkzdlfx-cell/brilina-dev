import type { Env } from './types';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400'
};

const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
};

function combineHeaders(): Record<string, string> {
  return { ...corsHeaders, ...securityHeaders };
}

function jsonResponse<T>(data: T, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...combineHeaders(),
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
        ...combineHeaders(),
        'Content-Type': 'application/json'
      }
    }
  );
}

async function handleOptions(): Promise<Response> {
  return new Response(null, {
    status: 204,
    headers: combineHeaders()
  });
}

async function dispatch(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;

  if (method === 'OPTIONS') {
    return handleOptions();
  }

  const publicRoutes = {
    'GET:/api/profile': () => import('./routes/public').then((m) => m.handleGetProfile(request, env)),
    'GET:/api/projects': () => import('./routes/public').then((m) => m.handleGetProjects(request, env)),
    'GET:/api/capabilities': () => import('./routes/public').then((m) => m.handleGetCapabilities(request, env)),
    'GET:/api/links': () => import('./routes/public').then((m) => m.handleGetLinks(request, env))
  };

  const authRoutes = {
    'POST:/api/auth/login': () => import('./routes/auth').then((m) => m.handleLogin(request, env)),
    'POST:/api/auth/logout': () => import('./routes/auth').then((m) => m.handleLogout(request, env)),
    'GET:/api/auth/session': () => import('./routes/auth').then((m) => m.handleSession(request, env)),
    'POST:/api/auth/forgot-password': () => import('./routes/auth').then((m) => m.handleForgotPassword(request, env)),
    'POST:/api/auth/reset-password': () => import('./routes/auth').then((m) => m.handleResetPassword(request, env))
  };

  const adminProjectRoutes = {
    'GET:/api/admin/projects': () => import('./routes/admin/projects').then((m) => m.handleGetAdminProjects(request, env)),
    'POST:/api/admin/projects': () => import('./routes/admin/projects').then((m) => m.handleCreateAdminProject(request, env))
  };

  const allRoutes = { ...publicRoutes, ...authRoutes, ...adminProjectRoutes };

  const exactKey = `${method}:${path}`;
  if (allRoutes[exactKey as keyof typeof allRoutes]) {
    return allRoutes[exactKey as keyof typeof allRoutes]();
  }

  if (path.startsWith('/api/projects/') && method === 'GET') {
    const slug = path.replace('/api/projects/', '');
    if (slug && !slug.includes('/')) {
      return import('./routes/public').then((m) => m.handleGetProject(request, env, slug));
    }
  }

  if (path.startsWith('/api/admin/projects/')) {
    const segments = path.replace('/api/admin/projects/', '').split('/');
    const id = parseInt(segments[0], 10);

    if (isNaN(id)) {
      return errorResponse('BAD_REQUEST', 'Invalid project ID', 400);
    }

    if (segments.length === 1) {
      if (method === 'GET') {
        return import('./routes/admin/projects').then((m) => m.handleGetAdminProject(request, env, id));
      }
      if (method === 'PATCH') {
        return import('./routes/admin/projects').then((m) => m.handleUpdateAdminProject(request, env, id));
      }
      if (method === 'DELETE') {
        return import('./routes/admin/projects').then((m) => m.handleDeleteAdminProject(request, env, id));
      }
    }

    if (segments.length === 2 && segments[1] === 'publish' && method === 'POST') {
      return import('./routes/admin/projects').then((m) => m.handlePublishProject(request, env, id));
    }

    if (segments.length === 2 && segments[1] === 'unpublish' && method === 'POST') {
      return import('./routes/admin/projects').then((m) => m.handleUnpublishProject(request, env, id));
    }

    if (segments.length === 2 && segments[1] === 'images' && method === 'POST') {
      return import('./routes/admin/projects').then((m) => m.handleAddProjectImage(request, env, id));
    }

    if (segments.length === 3 && segments[1] === 'images') {
      const imageId = parseInt(segments[2], 10);
      if (isNaN(imageId)) {
        return errorResponse('BAD_REQUEST', 'Invalid image ID', 400);
      }
      if (method === 'PATCH') {
        return import('./routes/admin/projects').then((m) => m.handleUpdateProjectImage(request, env, id, imageId));
      }
      if (method === 'DELETE') {
        return import('./routes/admin/projects').then((m) => m.handleDeleteProjectImage(request, env, id, imageId));
      }
    }
  }

  if (path === '/api/admin/profile') {
    if (method === 'GET') {
      return import('./routes/admin/profile').then((m) => m.handleGetAdminProfile(request, env));
    }
    if (method === 'PATCH') {
      return import('./routes/admin/profile').then((m) => m.handleUpdateAdminProfile(request, env));
    }
  }

  if (path === '/api/admin/profile-images') {
    if (method === 'GET') {
      return import('./routes/admin/profile').then((m) => m.handleGetAdminProfileImages(request, env));
    }
    if (method === 'POST') {
      return import('./routes/admin/profile').then((m) => m.handleCreateAdminProfileImage(request, env));
    }
  }

  if (path.startsWith('/api/admin/profile-images/')) {
    const idStr = path.replace('/api/admin/profile-images/', '');
    const id = parseInt(idStr, 10);
    if (isNaN(id)) {
      return errorResponse('BAD_REQUEST', 'Invalid profile image ID', 400);
    }
    if (method === 'PATCH') {
      return import('./routes/admin/profile').then((m) => m.handleUpdateAdminProfileImage(request, env, id));
    }
    if (method === 'DELETE') {
      return import('./routes/admin/profile').then((m) => m.handleDeleteAdminProfileImage(request, env, id));
    }
  }

  if (path === '/api/admin/capabilities') {
    if (method === 'GET') {
      return import('./routes/admin/capabilities').then((m) => m.handleGetAdminCapabilities(request, env));
    }
    if (method === 'POST') {
      return import('./routes/admin/capabilities').then((m) => m.handleCreateAdminCapability(request, env));
    }
  }

  if (path.startsWith('/api/admin/capabilities/')) {
    const idStr = path.replace('/api/admin/capabilities/', '');
    const id = parseInt(idStr, 10);
    if (isNaN(id)) {
      return errorResponse('BAD_REQUEST', 'Invalid capability ID', 400);
    }
    if (method === 'PATCH') {
      return import('./routes/admin/capabilities').then((m) => m.handleUpdateAdminCapability(request, env, id));
    }
    if (method === 'DELETE') {
      return import('./routes/admin/capabilities').then((m) => m.handleDeleteAdminCapability(request, env, id));
    }
  }

  if (path === '/api/admin/links') {
    if (method === 'GET') {
      return import('./routes/admin/links').then((m) => m.handleGetAdminLinks(request, env));
    }
    if (method === 'POST') {
      return import('./routes/admin/links').then((m) => m.handleCreateAdminLink(request, env));
    }
  }

  if (path.startsWith('/api/admin/links/')) {
    const idStr = path.replace('/api/admin/links/', '');
    const id = parseInt(idStr, 10);
    if (isNaN(id)) {
      return errorResponse('BAD_REQUEST', 'Invalid link ID', 400);
    }
    if (method === 'PATCH') {
      return import('./routes/admin/links').then((m) => m.handleUpdateAdminLink(request, env, id));
    }
    if (method === 'DELETE') {
      return import('./routes/admin/links').then((m) => m.handleDeleteAdminLink(request, env, id));
    }
  }

  return errorResponse('NOT_FOUND', 'Route not found', 404);
}

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    try {
      return await dispatch(request, env);
    } catch (error) {
      console.error('Unhandled error:', error);
      return errorResponse('INTERNAL_ERROR', 'An unexpected error occurred', 500);
    }
  }
};
