import { z } from 'zod';

export const LoginRequestSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters')
});

export const RegisterRequestSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters')
});

export const ForgotPasswordRequestSchema = z.object({
  email: z.string().email('Invalid email address')
});

export const ResetPasswordRequestSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters')
});

export const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(50).default(9),
  search: z.string().optional().default(''),
  category: z.string().optional().default(''),
  featured: z.coerce.boolean().optional().default(false)
});

export const ProfileUpdateRequestSchema = z.object({
  name: z.string().optional(),
  professional_title: z.string().optional(),
  short_intro: z.string().optional(),
  biography: z.string().optional(),
  longer_about: z.string().optional(),
  contact_email: z.string().email().optional().or(z.literal('')),
  location: z.string().optional()
});

export const ImageUploadAuthRequestSchema = z.object({
  fileType: z.string().min(1, 'File type is required'),
  fileName: z.string().optional(),
  fileSize: z.coerce.number().int().positive().optional()
});

export const CapabilityCreateRequestSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().default(''),
  icon_key: z.string().default(''),
  sort_order: z.coerce.number().int().default(0),
  active: z.coerce.boolean().default(true)
});

export const CapabilityUpdateRequestSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  icon_key: z.string().optional(),
  sort_order: z.coerce.number().int().optional(),
  active: z.coerce.boolean().optional()
});

export const LinkCreateRequestSchema = z.object({
  label: z.string().min(1, 'Label is required'),
  type: z.string().min(1, 'Type is required'),
  url: z.string().url('Invalid URL'),
  icon_key: z.string().default(''),
  sort_order: z.coerce.number().int().default(0),
  active: z.coerce.boolean().default(true)
});

export const LinkUpdateRequestSchema = z.object({
  label: z.string().min(1).optional(),
  type: z.string().min(1).optional(),
  url: z.string().url().optional(),
  icon_key: z.string().optional(),
  sort_order: z.coerce.number().int().optional(),
  active: z.coerce.boolean().optional()
});

export const ProjectCreateRequestSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  tagline: z.string().default(''),
  short_description: z.string().default(''),
  full_description: z.string().default(''),
  category_id: z.coerce.number().int().positive().nullable().optional(),
  status: z.string().default('draft'),
  featured: z.coerce.boolean().default(false),
  published: z.coerce.boolean().default(false),
  sort_order: z.coerce.number().int().default(0),
  meta_title: z.string().default(''),
  meta_description: z.string().default(''),
  technology_ids: z.array(z.coerce.number().int().positive()).default([])
});

export const ProjectUpdateRequestSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  tagline: z.string().optional(),
  short_description: z.string().optional(),
  full_description: z.string().optional(),
  category_id: z.coerce.number().int().positive().nullable().optional(),
  status: z.string().optional(),
  featured: z.coerce.boolean().optional(),
  published: z.coerce.boolean().optional(),
  sort_order: z.coerce.number().int().optional(),
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
  technology_ids: z.array(z.coerce.number().int().positive()).optional()
});

export const ProjectImageCreateSchema = z.object({
  imagekit_file_id: z.string().optional().or(z.literal('')),
  image_url: z.string().url('Invalid image URL'),
  alt_text: z.string().default(''),
  image_type: z.string().default('gallery'),
  sort_order: z.coerce.number().int().default(0),
  is_primary: z.coerce.boolean().default(false)
});

export const ProjectImageUpdateSchema = z.object({
  imagekit_file_id: z.string().optional().or(z.literal('')),
  image_url: z.string().url().optional(),
  alt_text: z.string().optional(),
  image_type: z.string().optional(),
  sort_order: z.coerce.number().int().optional(),
  is_primary: z.coerce.boolean().optional()
});

export const CaseStudySectionRequestSchema = z.object({
  section_type: z.string().min(1, 'Section type is required'),
  heading: z.string().default(''),
  body: z.string().default(''),
  sort_order: z.coerce.number().int().default(0),
  active: z.coerce.boolean().default(true)
});

export const ProfileImageCreateSchema = z.object({
  purpose: z.string().min(1, 'Purpose is required'),
  imagekit_file_id: z.string().optional().or(z.literal('')),
  image_url: z.string().url('Invalid image URL'),
  alt_text: z.string().default(''),
  sort_order: z.coerce.number().int().default(0),
  active: z.coerce.boolean().default(true)
});

export const ProfileImageUpdateSchema = z.object({
  purpose: z.string().min(1).optional(),
  imagekit_file_id: z.string().optional().or(z.literal('')),
  image_url: z.string().url().optional(),
  alt_text: z.string().optional(),
  sort_order: z.coerce.number().int().optional(),
  active: z.coerce.boolean().optional()
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;
export type ForgotPasswordRequest = z.infer<typeof ForgotPasswordRequestSchema>;
export type ResetPasswordRequest = z.infer<typeof ResetPasswordRequestSchema>;
export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;
export type ProfileUpdateRequest = z.infer<typeof ProfileUpdateRequestSchema>;
export type ImageUploadAuthRequest = z.infer<typeof ImageUploadAuthRequestSchema>;
export type CapabilityCreateRequest = z.infer<typeof CapabilityCreateRequestSchema>;
export type CapabilityUpdateRequest = z.infer<typeof CapabilityUpdateRequestSchema>;
export type LinkCreateRequest = z.infer<typeof LinkCreateRequestSchema>;
export type LinkUpdateRequest = z.infer<typeof LinkUpdateRequestSchema>;
export type ProjectCreateRequest = z.infer<typeof ProjectCreateRequestSchema>;
export type ProjectUpdateRequest = z.infer<typeof ProjectUpdateRequestSchema>;
export type ProjectImageCreateRequest = z.infer<typeof ProjectImageCreateSchema>;
export type ProjectImageUpdateRequest = z.infer<typeof ProjectImageUpdateSchema>;
export type CaseStudySectionRequest = z.infer<typeof CaseStudySectionRequestSchema>;
export type ProfileImageCreateRequest = z.infer<typeof ProfileImageCreateSchema>;
export type ProfileImageUpdateRequest = z.infer<typeof ProfileImageUpdateSchema>;
