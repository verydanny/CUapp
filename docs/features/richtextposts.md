# Rich Text Posts API Feature

## Purpose

This document describes the API endpoints for managing rich text post content, which is typically associated with a parent "Post" model. These endpoints allow for creating, retrieving, updating, and deleting detailed rich text content that might be too large or complex to store directly within the main post object.

## Overview

The Rich Text Posts API provides CRUD (Create, Read, Update, Delete) operations for `RichTextPost` entities. Each `RichTextPost` is expected to be linked to a parent post via a `postId` field.

The API is implemented using SvelteKit endpoints and interacts with an Appwrite backend via utility functions.

## Endpoints

- `POST /api/richtextposts`: Creates a new rich text post.
    - Requires `postId`, `title`, and `body` in the request.
    - Optional fields: `excerpt`, `version`.
- `GET /api/richtextposts/[id]`: Retrieves a specific rich text post by its Appwrite document ID.
- `PATCH /api/richtextposts/[id]`: Updates an existing rich text post by its Appwrite document ID. Allows partial updates.
- `DELETE /api/richtextposts/[id]`: Deletes a specific rich text post by its Appwrite document ID.

## Key Technical Decisions & Components

- **Technology Stack**: SvelteKit, Appwrite, TypeScript.
- **Development Approach**: Test-Driven Development (TDD) for both Appwrite utility functions and SvelteKit API endpoints.
- **Appwrite Utilities**: Located in `src/lib/server/appwrite-utils/richtext.appwrite.ts`. These functions encapsulate direct Appwrite SDK calls.
- **API Endpoints**: Located in `src/routes/api/richtextposts/`.
    - `+server.ts` for the collection-level POST.
    - `[id]/+server.ts` for item-level GET, PATCH, DELETE.
- **Environment Variables**: Uses SvelteKit's `$env/static/private` for Appwrite configuration, managed centrally.
- **Error Handling**: Standard HTTP status codes are used to indicate success or failure. Appwrite exceptions are caught and mapped to appropriate responses.

## User Impact (API Consumers)

- API consumers can manage detailed rich text content independently of the main post entities.
- Provides a structured way to handle potentially large and complex content blobs.
- Standard RESTful interface for easy integration.
