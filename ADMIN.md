# Brilina Dev — Admin Dashboard

## Purpose
A private, small content-management interface for the owner. It manages portfolio content; it is not a general CMS.

## Navigation
Dashboard, Projects, Profile, Photos, Capabilities, Links, Account, Logout.

## Projects
List, search, filter, paginate, create, edit, draft, publish/unpublish, feature, reorder, manage links/technologies, upload/reorder/delete images, and optionally manage case-study sections.

## Profile
Edit name, professional title, short introduction, biography/about, longer about content, contact email, location, and approved profile fields.

## Photos
Upload to ImageKit, assign purpose, edit alt text, select active image, reorder where relevant, replace/remove.

## Capabilities
Add, edit, deactivate/delete, reorder.

## Links
Add, edit, deactivate, reorder.

## Account
Change password, logout, request password reset. No public registration in v1.

## UX
Clear save/publish states, loading/empty/error states, validation messages, unsaved-change warning, mobile-friendly layout, destructive-action confirmation, no silent loss of edits.

## Security
Every protected mutation requires server-side authentication/authorization. Never trust an admin ID supplied by the browser.
