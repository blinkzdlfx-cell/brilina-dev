import type { ApiResponse, Profile, ProfileImage, Capability, Link, Project, ProjectWithRelations, PaginatedResponse, AdminProject, ProjectImage, ProfileWithImages } from './types';

const API_BASE = '';

function getBaseUrl(): string {
  const base = API_BASE as string;
  if (base) return base.replace(/\/$/, '');
  if (typeof window !== 'undefined') return '';
  return '';
}

async function handleResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    const text = await response.text();
    throw new Error(text || `HTTP ${response.status}`);
  }

  const parsed = await response.json<ApiResponse<T>>();
  const data = parsed.data;
  const error = parsed.error;

  if (!response.ok || error) {
    throw new ApiClientError(error?.code || 'UNKNOWN_ERROR', error?.message || `HTTP ${response.status}`, error?.fields);
  }

  return data as T;
}

export class ApiClientError extends Error {
  code: string;
  fields?: Record<string, string>;

  constructor(code: string, message: string, fields?: Record<string, string>) {
    super(message);
    this.name = 'ApiClientError';
    this.code = code;
    this.fields = fields;
  }
}

export async function apiGet<T>(path: string): Promise<T> {
  const base = getBaseUrl();
  const url = `${base}${path}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    credentials: 'same-origin'
  });

  return handleResponse<T>(response);
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const base = getBaseUrl();
  const url = `${base}${path}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify(body),
    credentials: 'same-origin'
  });

  return handleResponse<T>(response);
}

export async function apiPatch<T>(path: string, body: unknown): Promise<T> {
  const base = getBaseUrl();
  const url = `${base}${path}`;
  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify(body),
    credentials: 'same-origin'
  });

  return handleResponse<T>(response);
}

export async function apiDelete<T>(path: string): Promise<T> {
  const base = getBaseUrl();
  const url = `${base}${path}`;
  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    credentials: 'same-origin'
  });

  return handleResponse<T>(response);
}

export async function apiPostFormData<T>(path: string, formData: FormData): Promise<T> {
  const base = getBaseUrl();
  const url = `${base}${path}`;
  const response = await fetch(url, {
    method: 'POST',
    body: formData,
    credentials: 'same-origin'
  });

  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    const text = await response.text();
    throw new Error(text || `HTTP ${response.status}`);
  }

  const data = await response.json<ApiResponse<T>>();

  if (!response.ok || data.error) {
    const error = data.error || {
      code: 'UNKNOWN_ERROR',
      message: `HTTP ${response.status}`
    };
    throw new ApiClientError(error.code, error.message, error.fields);
  }

  return data.data as T;
}

export const publicApi = {
  getProfile: () => apiGet<ProfileWithImages>('/api/profile'),
  getProjects: (params: { page?: number; limit?: number; search?: string; category?: string; featured?: string }) => {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set('page', String(params.page));
    if (params.limit) searchParams.set('limit', String(params.limit));
    if (params.search) searchParams.set('search', params.search);
    if (params.category) searchParams.set('category', params.category);
    if (params.featured) searchParams.set('featured', params.featured);
    const qs = searchParams.toString();
    return apiGet<PaginatedResponse<Project>>(`/api/projects${qs ? `?${qs}` : ''}`);
  },
  getProject: (slug: string) => apiGet<ProjectWithRelations>(`/api/projects/${encodeURIComponent(slug)}`),
  getCapabilities: () => apiGet<Capability[]>('/api/capabilities'),
  getLinks: () => apiGet<Link[]>('/api/links')
};

export const authApi = {
  login: (email: string, password: string) => apiPost<{ admin: { id: number; email: string } }>('/api/auth/login', { email, password }),
  logout: () => apiPost<null>('/api/auth/logout', {}),
  session: () => apiGet<{ authenticated: boolean; admin?: { id: number; email: string } }>('/api/auth/session'),
  forgotPassword: (email: string) => apiPost<null>('/api/auth/forgot-password', { email }),
  resetPassword: (token: string, password: string) => apiPost<null>('/api/auth/reset-password', { token, password }),
  changePassword: (currentPassword: string, newPassword: string) => apiPost<null>('/api/admin/account/password', { current_password: currentPassword, new_password: newPassword })
};

export const adminApi = {
  getProjects: (params?: { page?: number; limit?: number; search?: string; category?: string; status?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.search) searchParams.set('search', params.search);
    if (params?.category) searchParams.set('category', params.category);
    if (params?.status) searchParams.set('status', params.status);
    const qs = searchParams.toString();
    return apiGet<PaginatedResponse<AdminProject>>(`/api/admin/projects${qs ? `?${qs}` : ''}`);
  },
  getProject: (id: number) => apiGet<AdminProject>(`/api/admin/projects/${id}`),
  createProject: (data: Record<string, unknown>) => apiPost<AdminProject>('/api/admin/projects', data),
  updateProject: (id: number, data: Record<string, unknown>) => apiPatch<AdminProject>(`/api/admin/projects/${id}`, data),
  deleteProject: (id: number) => apiDelete<null>(`/api/admin/projects/${id}`),
  publishProject: (id: number) => apiPost<null>(`/api/admin/projects/${id}/publish`, {}),
  unpublishProject: (id: number) => apiPost<null>(`/api/admin/projects/${id}/unpublish`, {}),
  uploadProjectImage: (id: number, formData: FormData) => apiPostFormData<ProjectImage>(`/api/admin/projects/${id}/images`, formData),
  updateProjectImage: (projectId: number, imageId: number, data: Record<string, unknown>) => apiPatch<ProjectImage>(`/api/admin/projects/${projectId}/images/${imageId}`, data),
  deleteProjectImage: (projectId: number, imageId: number) => apiDelete<null>(`/api/admin/projects/${projectId}/images/${imageId}`),
  getProfile: () => apiGet<Profile>('/api/admin/profile'),
  updateProfile: (data: Record<string, unknown>) => apiPatch<Profile>('/api/admin/profile', data),
  getProfileImages: () => apiGet<ProfileImage[]>('/api/admin/profile-images'),
  createProfileImage: (formData: FormData) => apiPostFormData<ProfileImage>('/api/admin/profile-images', formData),
  updateProfileImage: (id: number, data: Record<string, unknown>) => apiPatch<ProfileImage>(`/api/admin/profile-images/${id}`, data),
  deleteProfileImage: (id: number) => apiDelete<null>(`/api/admin/profile-images/${id}`),
  getCapabilities: () => apiGet<Capability[]>('/api/admin/capabilities'),
  createCapability: (data: Record<string, unknown>) => apiPost<Capability>('/api/admin/capabilities', data),
  updateCapability: (id: number, data: Record<string, unknown>) => apiPatch<Capability>(`/api/admin/capabilities/${id}`, data),
  deleteCapability: (id: number) => apiDelete<null>(`/api/admin/capabilities/${id}`),
  getLinks: () => apiGet<Link[]>('/api/admin/links'),
  createLink: (data: Record<string, unknown>) => apiPost<Link>('/api/admin/links', data),
  updateLink: (id: number, data: Record<string, unknown>) => apiPatch<Link>(`/api/admin/links/${id}`, data),
  deleteLink: (id: number) => apiDelete<null>(`/api/admin/links/${id}`),
  changePassword: (currentPassword: string, newPassword: string) => apiPost<null>('/api/admin/account/password', { current_password: currentPassword, new_password: newPassword })
};
