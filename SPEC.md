# Brilina Dev — Product Specification

## Identity
Brand: BRILINA DEV
Professional identity: Spec-Driven Developer & AI-Assisted Product Builder
Core statement: I build digital products from specification to software.
Core method: THINK → SPECIFY → BUILD → VERIFY

Method stages:
EXPLORE → ANALYZE → CLARIFY → DECIDE → SPECIFY → REVIEW → PLAN → IMPLEMENT → VERIFY → UPDATE

## Product goals
- Present the owner professionally.
- Showcase dynamic projects.
- Let the owner update projects and personal content without editing frontend source.
- Keep infrastructure simple, maintainable, secure, and extensible.
- Use Cloudflare for the main application infrastructure.
- Use ImageKit for media.
- Use Resend for email only.

## Public pages
Home, Projects, Project Detail, Method, About, Contact.

## Admin
Login, Dashboard, Projects, Profile, Photos, Capabilities, Links, Account.

## Editable content
Profile: name, title, intro, biography, about content, contact information.
Projects: name, slug, descriptions, category, status, featured/published state, links, technologies, images, optional case study, SEO fields, ordering.
Capabilities, profile photos, social/contact links are also editable.

## Pagination
Projects must use API-driven pagination. The API owns page/limit/total semantics; React owns presentation. Support search/filtering without coupling pagination to a specific UI.

## Extensibility
Adding a project or changing profile content must not require source-code changes. New optional content must be additive. Database changes require migrations.

## Truthfulness
Do not fabricate clients, testimonials, metrics, awards, certifications, revenue, user counts, years of experience, outcomes, or technologies.

## Non-goals for v1
No public registration, multi-user CMS, complex roles, general page builder, AI content generator, or unnecessary infrastructure.
