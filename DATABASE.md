# Brilina Dev — Database Plan

This is the conceptual model. Final SQL must follow review of this document.

## Entities

### admins
id, email, password_hash, email_verified_at, created_at, updated_at. One admin initially.

### sessions
id, admin_id, expires_at, created_at, last_seen_at. Use only if persisted sessions are selected.

### profile
Single-record profile: name, professional_title, short_intro, biography, longer_about, contact_email, location, updated_at.

### profile_images
id, purpose, imagekit_file_id, image_url, alt_text, sort_order, active, created_at, updated_at.
Purposes may include hero, about, profile, contact, other.

### capabilities
id, name, description, icon_key, sort_order, active, timestamps.

### links
id, label, type, url, icon_key, sort_order, active.

### categories
Reusable project categories.

### technologies
Reusable technology records.

### projects
id, name, slug, tagline, short_description, full_description, category_id, status, featured, published, sort_order, meta_title, meta_description, created_at, updated_at, published_at.

### project_images
id, project_id, imagekit_file_id, image_url, alt_text, image_type, sort_order, is_primary, timestamps.

### project_links
id, project_id, label, type, url, sort_order.

### project_technologies
Many-to-many project/technology relationship.

### case_study_sections
id, project_id, section_type, heading, body, sort_order, active.

## Rules
- Unique project slugs.
- Foreign keys and constraints.
- Explicit deletion behavior.
- UTC timestamps.
- Versioned migrations.
- Do not store binary images in D1.
- Do not create speculative tables until a real requirement exists.

## Pagination
Project queries support page, limit, total, totalPages, hasNext, hasPrevious. Ordering must be deterministic. Search/filtering must work with pagination.
