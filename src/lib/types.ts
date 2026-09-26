export interface ApiResponse<T> {
  data: T | null;
  error: ApiError | null;
}

export interface ApiError {
  code: string;
  message: string;
  fields?: Record<string, string>;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationInfo;
  error: null;
}

export interface Profile {
  id: number;
  name: string;
  professional_title: string;
  short_intro: string;
  biography: string;
  longer_about: string;
  contact_email: string;
  location: string;
  updated_at: string;
}

export interface ProfileImage {
  id: number;
  purpose: string;
  imagekit_file_id: string | null;
  image_url: string;
  alt_text: string;
  sort_order: number;
  active: number;
  created_at: string;
  updated_at: string;
}

export interface Capability {
  id: number;
  name: string;
  description: string;
  icon_key: string;
  sort_order: number;
  active: number;
  created_at: string;
  updated_at: string;
}

export interface Link {
  id: number;
  label: string;
  type: string;
  url: string;
  icon_key: string;
  sort_order: number;
  active: number;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  created_at: string;
  updated_at: string;
}

export interface Technology {
  id: number;
  name: string;
  slug: string;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: number;
  name: string;
  slug: string;
  tagline: string;
  short_description: string;
  full_description: string;
  category_id: number | null;
  status: string;
  featured: number;
  published: number;
  sort_order: number;
  meta_title: string;
  meta_description: string;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  category_name?: string;
  category_slug?: string;
}

export interface ProjectImage {
  id: number;
  project_id: number;
  imagekit_file_id: string | null;
  image_url: string;
  alt_text: string;
  image_type: string;
  sort_order: number;
  is_primary: number;
  created_at: string;
  updated_at: string;
}

export interface ProjectLink {
  id: number;
  project_id: number;
  label: string;
  type: string;
  url: string;
  sort_order: number;
  created_at: string;
}

export interface ProjectTechnology {
  id: number;
  project_id: number;
  technology_id: number;
  created_at: string;
  technology?: Technology;
}

export interface CaseStudySection {
  id: number;
  project_id: number;
  section_type: string;
  heading: string;
  body: string;
  sort_order: number;
  active: number;
  created_at: string;
  updated_at: string;
}

export interface ProjectWithRelations extends Project {
  category: Category | null;
  images: ProjectImage[];
  links: ProjectLink[];
  technologies: (ProjectTechnology & { technology: Technology })[];
  case_study_sections: CaseStudySection[];
}

export interface Admin {
  id: number;
  email: string;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Session {
  id: string;
  admin_id: number;
  expires_at: string;
  created_at: string;
  last_seen_at: string;
}

export interface ProfileWithImages {
  profile: Profile;
  images: ProfileImage[];
}

export interface AdminProject {
  id: number;
  name: string;
  slug: string;
  tagline: string;
  short_description: string;
  full_description: string;
  category_id: number | null;
  status: string;
  featured: number;
  published: number;
  sort_order: number;
  meta_title: string;
  meta_description: string;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  category?: Category | null;
  images?: ProjectImage[];
  links?: ProjectLink[];
  technologies?: (ProjectTechnology & { technology: Technology })[];
  case_study_sections?: CaseStudySection[];
}

export interface ImageKitUploadAuthRequest {
  fileType: string;
  fileName?: string;
  fileSize?: number;
}

export interface ImageKitUploadAuthResponse {
  token: string;
  expire: number;
  signature: string;
  publicKey: string;
  url: string;
}
