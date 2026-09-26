# Brilina Dev — API Contract Plan

All input is validated server-side.

## Public
GET /api/profile
GET /api/projects?page=1&limit=9&search=&category=&featured=
GET /api/projects/:slug
GET /api/capabilities
GET /api/links

## Auth
POST /api/auth/login
POST /api/auth/logout
GET /api/auth/session
POST /api/auth/forgot-password
POST /api/auth/reset-password

## Admin projects
GET /api/admin/projects
POST /api/admin/projects
GET /api/admin/projects/:id
PATCH /api/admin/projects/:id
DELETE /api/admin/projects/:id
POST /api/admin/projects/:id/publish
POST /api/admin/projects/:id/unpublish
POST /api/admin/projects/:id/images
PATCH /api/admin/projects/:id/images/:imageId
DELETE /api/admin/projects/:id/images/:imageId

## Admin content
GET/PATCH /api/admin/profile
GET/POST /api/admin/profile-images
PATCH/DELETE /api/admin/profile-images/:id
GET/POST /api/admin/capabilities
PATCH/DELETE /api/admin/capabilities/:id
GET/POST /api/admin/links
PATCH/DELETE /api/admin/links/:id

## ImageKit
Worker generates upload authorization. Private key never reaches the browser. Image metadata returned by ImageKit is stored through the authenticated API.

## Response shape
Success: {"data": {}, "error": null}
Error: {"data": null, "error": {"code": "VALIDATION_ERROR", "message": "Invalid request", "fields": {}}}
Paginated: {"data": [], "pagination": {"page":1,"limit":9,"total":0,"totalPages":0,"hasNext":false,"hasPrevious":false}, "error": null}

Never leak secrets, hashes, stack traces, or internal database errors.
