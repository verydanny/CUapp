# AI Context: Rich Text Posts API

This document provides context for AI assistants working with the Rich Text Posts API feature.

## Primary Files & Modules

- **Appwrite Utility Functions & Tests:**
    - `src/lib/server/appwrite-utils/richtext.appwrite.ts` (Implementation of CRUD operations using Appwrite SDK)
    - `src/lib/server/appwrite-utils/richtext.appwrite.test.ts` (Unit tests for utility functions)
- **SvelteKit API Endpoints & Tests:**
    - `src/routes/api/richtextposts/+server.ts` (Handles `POST` requests for creating rich text posts)
    - `src/routes/api/richtextposts/server.test.ts` (Unit tests for the `POST` endpoint)
    - `src/routes/api/richtextposts/[id]/+server.ts` (Handles `GET`, `PATCH`, `DELETE` requests for individual rich text posts)
    - `src/routes/api/richtextposts/[id]/server.test.ts` (Unit tests for `GET`, `PATCH`, `DELETE` endpoints)
- **Appwrite Client Initialization:**
    - `src/lib/server/appwrite-utils/appwrite.ts` (Provides `createAdminClient()`)
- **Environment Variables (Accessed via `appwrite.ts` indirectly):**
    - `$env/static/private`: `DATABASE_ID`, `RICH_TEXT_POST_COLLECTION_ID` (though these are directly imported in `richtext.appwrite.ts`)

## Key Functions & Data Structures

- **Appwrite Utility Functions (in `richtext.appwrite.ts`):**
    - `createRichTextPost(databases: Databases, data: CreateRichTextPostData): Promise<Models.Document>`
    - `getRichTextPostById(databases: Databases, id: string): Promise<Models.Document>`
    - `updateRichTextPost(databases: Databases, id: string, data: UpdateRichTextPostData): Promise<Models.Document>`
    - `deleteRichTextPost(databases: Databases, id: string): Promise<void>`
- **Data Types (in `richtext.appwrite.ts`):**
    - `CreateRichTextPostData`: Interface for data required to create a post.
    - `UpdateRichTextPostData`: Interface for data allowed for updating a post (all fields optional).
- **SvelteKit Endpoint Handlers (in `+server.ts` files):**
    - `POST(event: RequestEvent)`
    - `GET(event: RequestEvent)`
    - `PATCH(event: RequestEvent)`
    - `DELETE(event: RequestEvent)`

## Workflow & Testing

- Development followed a TDD approach. Tests for utility functions mock Appwrite SDK client methods. Tests for API endpoints mock the Appwrite utility functions.
- Environment variables like database and collection IDs are sourced from `$env/static/private` within the `richtext.appwrite.ts` utility file.
- API endpoint tests use `vi.hoisted()` for mocks used within `vi.mock()` factory functions.
- API endpoints use `createAdminClient()` from `src/lib/server/appwrite-utils/appwrite.js` to obtain an Appwrite `Databases` service instance.

## Potential Areas for AI Troubleshooting

- **Mocking Strategy**: Ensure correct mocking of Appwrite utility functions in endpoint tests and Appwrite client methods in utility tests.
- **Environment Variables**: If issues arise with IDs, verify they are correctly mocked in tests (for utilities) and correctly accessed in implementation.
- **Error Handling**: Check that Appwrite exceptions are being correctly caught and translated into appropriate HTTP responses (e.g., 404 for not found, 500 for server errors).
- **Request/Response Payloads**: Ensure request data parsing and response formatting align with expectations and defined types.
- **`.js` Import Suffix**: Remember that internal project imports (e.g., from `$lib/...`) require the `.js` suffix.
