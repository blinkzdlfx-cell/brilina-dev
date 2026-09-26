# Brilina Dev — Master Implementation Prompt

## Purpose

This is the execution entry point for implementing the Brilina Dev portfolio.

You are the implementation agent. Start here.

The repository contains the approved planning baseline. Your job is to read the complete documentation, understand the decisions, implement the documented system, validate it, and leave the repository ready for review and deployment.

Product identity:

**BRILINA DEV**  
**Spec-Driven Developer & AI-Assisted Product Builder**

Core philosophy:

**THINK → SPECIFY → BUILD → VERIFY**

Core principle:

> Build from understanding, not assumptions.

---

## 1. REQUIRED READING

Before writing application code, read all of these files:

1. README.md
2. SPEC.md
3. ARCHITECTURE.md
4. DATABASE.md
5. API.md
6. ADMIN.md
7. DESIGN.md
8. DEVELOPMENT.md
9. DEPLOYMENT.md
10. SECURITY.md
11. CHANGELOG.md

Do not read only README.md and start coding.

Treat these documents as the current planning contract.

Then inspect the repository and determine whether implementation already exists.

If existing code conflicts with the documentation:
- identify the conflict;
- prefer the documented specification unless a real implementation constraint requires otherwise;
- do not silently change product decisions;
- document meaningful deviations.

Before implementation, create an internal checklist from the documentation and use it throughout the build.

---

## 2. NON-NEGOTIABLE RULES

### Data-driven content

Editable portfolio content must not be hardcoded into React components.

Projects, profile information, capabilities, links, project images, and CMS-managed content must come from the API/database.

Adding a project must work conceptually as:

Admin → Add Project → enter content → add links/technology/images → Save → Review → Publish → public portfolio updates.

No source-code change should be required merely to add a normal project.

### No fabricated professional claims

Never invent:
- clients;
- testimonials;
- awards;
- certifications;
- years of experience;
- user counts;
- revenue;
- performance statistics;
- project outcomes;
- credentials;
- employment history.

If real content is not available, implement the structure and leave content empty or clearly marked as development content. Never present placeholder information as factual.

### Approved stack

Use:

- React
- TypeScript
- Vite
- Bootstrap 5
- React-Bootstrap
- Motion
- React Router
- Cloudflare Workers
- Cloudflare Static Assets
- Cloudflare D1
- Cloudflare KV where appropriate
- ImageKit for media
- Resend for email
- Zod for validation
- REST API

Do not introduce another backend platform or authentication platform unless the project specification is explicitly changed.

Do not introduce unnecessary infrastructure.

---

## 3. IMPLEMENTATION ORDER

Implement in coherent phases.

### Phase 0 — Foundation

Set up:
- React;
- TypeScript;
- Vite;
- Bootstrap 5;
- React-Bootstrap;
- Motion;
- React Router;
- Zod;
- Cloudflare Worker;
- static assets;
- development scripts;
- environment configuration;
- typecheck/test/build tooling.

Use strict TypeScript.

Keep dependencies minimal.

Establish a clean source structure. Avoid giant files.

### Phase 1 — Worker/API foundation

Implement:
- request routing;
- API response conventions from API.md;
- validation;
- database access layer;
- authentication/session utilities;
- environment bindings;
- security headers;
- appropriate CORS;
- structured error handling;
- logging appropriate for production.

Never expose:
- passwords;
- password hashes;
- session secrets;
- ImageKit private keys;
- Resend credentials;
- stack traces;
- unnecessary internal details.

The browser must never access D1 directly.

### Phase 2 — Database

Implement DATABASE.md using migrations.

Required conceptual entities:

- admins
- sessions
- profile
- profile_images
- capabilities
- links
- categories
- technologies
- projects
- project_images
- project_links
- project_technologies
- case_study_sections

Use foreign keys, constraints, deliberate deletion behavior, UTC timestamps, and useful indexes.

Project slugs must be unique.

D1 stores structured data and image metadata/references, not binary image files.

Do not add speculative tables.

### Phase 3 — Authentication

Implement ADMIN.md and SECURITY.md.

Required concepts:
- admin login;
- secure sessions;
- logout;
- session validation;
- password hashing;
- password reset;
- session expiry;
- secure cookies if cookies are used;
- server-side authorization;
- rate limiting where appropriate;
- account-recovery protections;
- CSRF protection where applicable;
- input validation.

There is no public registration.

Never trust administrator identity supplied by the browser.

Never store plaintext passwords.

Do not expose server secrets through Vite/client-side variables.

If an initial admin must be provisioned, document a secure bootstrap procedure instead of hardcoding credentials.

### Phase 4 — Public API

Implement API.md, including:

- GET /api/profile
- GET /api/projects
- GET /api/projects/:slug
- GET /api/capabilities
- GET /api/links

Projects must support API-driven pagination, search, category filtering, and featured filtering as documented.

Example:

GET /api/projects?page=2&limit=9&search=&category=&featured=

Return equivalent pagination information:

{
  "data": [],
  "pagination": {
    "page": 2,
    "limit": 9,
    "total": 27,
    "totalPages": 3,
    "hasNext": true,
    "hasPrevious": true
  }
}

Pagination semantics belong to the API. The frontend controls only presentation.

### Phase 5 — Project CMS

Admin must be able to:
- list;
- search;
- filter;
- paginate;
- create;
- edit;
- save drafts;
- publish;
- unpublish;
- feature/unfeature;
- control display order;
- manage technologies;
- manage categories;
- manage project links;
- manage project images;
- manage optional case-study sections;
- delete with confirmation.

Project data should support:
- name;
- slug;
- tagline;
- short description;
- full description;
- category;
- status;
- featured;
- published/draft state;
- links;
- technologies;
- images;
- optional case-study sections;
- SEO metadata;
- display order;
- created/updated/published timestamps.

Do not render optional case-study sections when they have no content.

Do not invent case-study information.

### Phase 6 — ImageKit

Implement the documented ImageKit flow.

The ImageKit private key must never reach the browser.

The Worker must generate upload authorization/signature parameters.

Support:
- project uploads;
- metadata;
- primary image;
- image purpose/type;
- alt text;
- ordering;
- replacement;
- removal;
- profile image uploads;
- profile image purposes;
- active state;
- reordering.

D1 stores metadata/references. ImageKit stores actual image files.

Do not commit image binaries.

### Phase 7 — Profile/CMS content

Implement editable:

Profile:
- name;
- professional title;
- short introduction;
- biography/about;
- longer about;
- contact information;
- location.

Profile photos:
- upload;
- purpose;
- alt text;
- active state;
- reorder;
- replace/remove.

Capabilities:
- add;
- edit;
- deactivate;
- reorder;
- name;
- description;
- icon key;
- display order;
- active state.

Links:
- add;
- edit;
- deactivate;
- reorder;
- label;
- type;
- URL;
- icon;
- order;
- active.

Do not hardcode a fixed set of social platforms.

### Phase 8 — Public website

Implement:

- /
- /projects
- /projects/:slug
- /method
- /about
- /contact

Communicate:

BRILINA DEV

Spec-Driven Developer & AI-Assisted Product Builder

THINK → SPECIFY → BUILD → VERIFY

Methodology:

EXPLORE → ANALYZE → CLARIFY → DECIDE → SPECIFY → REVIEW → PLAN → IMPLEMENT → VERIFY → UPDATE

The site must not feel like a generic developer template.

Emphasize:
- specification-driven development;
- product thinking;
- deliberate architecture;
- AI-assisted implementation;
- verification;
- real projects;
- technical clarity.

### Phase 9 — Homepage

Use the approved structure:

1. Navigation
2. Hero
3. Selected Work
4. How I Build
5. Capabilities
6. AI + Human
7. About
8. Open Source / Experiments
9. Contact
10. Footer

Editable content comes from the API.

Selected work must query appropriate published projects.

A new project must appear without editing React source.

### Phase 10 — Project detail

Support the documented project-detail structure:

- Hero
- Overview
- Problem
- Objective
- Approach
- Architecture
- Features
- Visual gallery
- Verification/current state
- Technologies
- Links
- Next project

Only render sections with content.

Do not show empty headings.

### Phase 11 — Design

Follow DESIGN.md.

Visual direction:
- premium;
- technical;
- precise;
- minimal;
- modern;
- structured;
- product-oriented;
- dark-first.

Preserve the existing Brilina Dev logo.

Do not redesign the logo.

Avoid:
- robots;
- brains;
- cliché AI imagery;
- excessive 3D;
- excessive gradients;
- glassmorphism;
- particle backgrounds;
- excessive neon;
- decorative effects that hurt readability;
- generic developer-template styling.

Motion must be intentional and respect prefers-reduced-motion.

Use Bootstrap as the structural UI system. Do not replace it with Tailwind or another CSS framework.

### Phase 12 — Responsive/accessibility

Support:
- mobile;
- tablet;
- desktop;
- large desktop.

Admin must also work on mobile.

Implement:
- semantic HTML;
- keyboard navigation;
- focus states;
- accessible labels;
- useful validation;
- alt text;
- correct buttons/links;
- reduced-motion support;
- sensible heading hierarchy.

### Phase 13 — PWA/offline

Implement public browsing PWA behavior described in DEVELOPMENT.md.

Cache the public shell appropriately.

Do not publicly cache private admin data.

Admin mutations require connectivity.

Do not pretend admin mutations work offline.

### Phase 14 — Email

Use Resend only for email delivery.

Email sending must remain server-side.

Never expose Resend credentials to the browser.

Document configuration.

---

## 4. FRONTEND/BACKEND BOUNDARIES

React owns:
- rendering;
- interaction;
- routing;
- presentation;
- client state;
- API consumption.

Worker owns:
- authentication;
- authorization;
- validation;
- business rules;
- D1 access;
- ImageKit authorization;
- Resend;
- server-side security.

D1 owns:
- editable structured content;
- relationships;
- CMS state.

ImageKit owns:
- image files;
- image delivery.

KV should be used only where appropriate for ephemeral/cache/session-related concerns.

---

## 5. CODE QUALITY

Use strict TypeScript.

Prefer:
- small reusable components;
- typed API contracts;
- centralized validation;
- centralized API client behavior;
- reusable form primitives;
- reusable loading/error states;
- clear service/repository boundaries;
- predictable naming.

Avoid:
- giant components;
- duplicated API logic;
- duplicated validation;
- business rules hidden in presentation;
- scattered magic strings;
- unnecessary abstractions;
- premature generic frameworks.

Do not use any as an easy escape from typing.

---

## 6. STATES AND UX

Important data-driven UI must handle:
- loading;
- success;
- empty;
- validation error;
- API error;
- network failure;
- unauthorized;
- forbidden;
- not found.

Admin mutations should clearly communicate:
- saving;
- saved;
- publishing;
- published;
- deleting;
- failure.

Use destructive confirmations.

Warn about unsaved changes where appropriate.

---

## 7. SECURITY

Follow SECURITY.md.

Verify:
- unauthenticated users cannot perform admin mutations;
- authorization cannot be bypassed;
- secrets never reach the client;
- private admin data is not publicly cached;
- inputs are validated;
- database queries are parameterized;
- rich text is handled safely;
- security headers are present;
- cookies are configured securely;
- recovery flows do not leak account existence unnecessarily;
- ImageKit private credentials remain server-side.

---

## 8. TESTING AND VERIFICATION

Do not consider a feature complete because it compiles.

Verify:

### Build
- TypeScript passes;
- production build passes;
- Worker configuration/build is valid.

### API
- public endpoints;
- validation;
- pagination;
- filtering;
- slug lookup;
- authentication;
- authorization;
- admin mutations;
- errors.

### Database
- migrations apply;
- constraints work;
- relationships work;
- pagination is deterministic.

### Admin
- login;
- logout;
- session behavior;
- project CRUD;
- publish/unpublish;
- image management;
- profile editing;
- capabilities;
- links.

### Public
- homepage;
- project list;
- project detail;
- method;
- about;
- contact;
- responsive behavior;
- not-found behavior.

### Security
Test that unauthenticated users cannot mutate admin resources and authenticated users cannot bypass authorization.

Do not claim a feature works unless it has actually been verified.

---

## 9. DOCUMENTATION AND ENVIRONMENT

Keep documentation synchronized with implementation.

Document:
- local development;
- commands;
- environment variables;
- Cloudflare bindings;
- D1 migrations;
- ImageKit configuration;
- Resend configuration;
- tests;
- build;
- deployment;
- production configuration;
- initial admin provisioning.

Separate local/preview/production configuration where appropriate.

Never commit real secrets.

Do not hardcode the production hostname.

Do not expose private server configuration through client-side variables.

---

## 10. GIT WORKFLOW

Use coherent commits.

Examples:

- chore: initialize application foundation
- feat: add worker api foundation
- feat: add d1 schema and migrations
- feat: add admin authentication
- feat: add project cms
- feat: add profile content management
- feat: add imagekit media flow
- feat: build public portfolio
- feat: add pwa support
- test: add api and application coverage
- docs: update implementation and deployment notes

Do not create meaningless commits for every tiny change.

Do not rewrite git history unnecessarily.

Never commit secrets.

---

## 11. NO FAKE IMPLEMENTATION

Do not replace real functionality with:
- fake production API responses;
- hardcoded CMS content;
- fake authentication;
- simulated image uploads;
- fake pagination;
- fake email delivery;
- fake Cloudflare bindings.

Mocks are acceptable inside isolated tests where appropriate.

Production paths must use the documented architecture.

Do not stop at scaffolding.

---

## 12. MISSING INFORMATION

Do not invent product requirements.

If an implementation detail is genuinely unspecified:

1. Prefer the documented architecture.
2. Choose the smallest implementation that preserves extensibility.
3. Isolate the decision.
4. Document it if it materially affects architecture or future work.
5. Do not silently change product scope.

For future owner-managed content, create the CMS field and leave it empty or clearly marked for configuration.

---

## 13. EXTENSIBILITY

The system must support future additions without architectural rewrites, including:
- new projects;
- categories;
- technologies;
- capabilities;
- links;
- profile images;
- project sections;
- public pages;
- admin modules.

Do not build speculative features just because they might be useful.

Implement the documented v1 cleanly first.

---

## 14. DEFINITION OF DONE

Do not declare completion until:

- documented architecture is implemented;
- React application runs;
- Worker/API runs;
- D1 migrations exist and work;
- admin authentication is secure;
- projects are CMS-driven;
- profile/about is editable;
- capabilities are editable;
- links are editable;
- ImageKit flow is implemented;
- Resend is server-side;
- public pages consume the API;
- project pagination is API-driven;
- project detail pages are dynamic;
- responsive design works;
- accessibility fundamentals exist;
- PWA/public offline behavior is appropriate;
- error/loading/empty states exist;
- tests/checks have been run;
- production build passes;
- environment configuration is documented;
- deployment instructions are usable;
- no secrets are committed;
- no fabricated professional claims are presented as real data;
- meaningful documentation deviations are recorded.

---

## 15. FINAL REPORT

At the end, provide a concise report with:

### Implemented
Major completed areas.

### Verification
Commands/checks run and their results.

### Configuration Required
Environment variables, Cloudflare bindings, ImageKit setup, Resend setup, and admin bootstrap steps.

### Known Limitations
Only real remaining limitations.

### Documentation Changes
Planning documents changed because implementation required a documented decision.

Never describe an unverified feature as complete.

---

# FINAL DIRECTIVE

Start by reading the entire planning baseline.

Then inspect the repository.

Then implement the system systematically from foundation through verification.

Do not ask for permission between ordinary implementation phases.

Do not redesign the product.

Do not replace the approved architecture with a preferred stack.

Do not invent requirements.

Do not fabricate portfolio facts.

Do not stop at scaffolding.

Build the documented Brilina Dev system, test it, document meaningful deviations, and leave the repository ready for review and deployment.

**THINK → SPECIFY → BUILD → VERIFY**
