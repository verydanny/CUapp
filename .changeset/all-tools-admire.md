---
'cuapp': minor
---

feat: Add Rich Text Posts API Endpoints

**Overview:**

This change introduces a new set of API endpoints for managing "Rich Text Posts." These posts are intended to store detailed content (e.g., HTML, Markdown, or other rich formats) associated with a primary parent post. The API supports full CRUD (Create, Read, Update, Delete) operations for these rich text entities.

**Key Changes:**

- Implemented `POST /api/richtextposts` for creating new rich text posts.
- Implemented `GET /api/richtextposts/[id]` for retrieving a specific rich text post.
- Implemented `PATCH /api/richtextposts/[id]` for updating an existing rich text post.
- Implemented `DELETE /api/richtextposts/[id]` for deleting a rich text post.
- Added corresponding Appwrite utility functions in `src/lib/server/appwrite-utils/richtext.appwrite.ts` to handle direct interaction with the Appwrite backend.
- Developed unit tests for both the Appwrite utility functions and the SvelteKit API endpoints, following a TDD approach.
- Ensured Appwrite client initialization and environment variable handling conform to project standards.

**Developer Impact:**

- Provides a dedicated API for managing extended content, decoupling it from main post objects.
- Offers a clear, testable, and maintainable structure for rich text content management.
- Follows established TDD and project conventions for API development.

**Documentation:**

- Created feature documentation: `docs/features/richtextposts.md`
- Created AI context documentation: `docs/ai/richtextposts-ai-context.md`
