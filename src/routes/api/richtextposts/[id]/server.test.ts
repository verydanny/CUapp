// @vitest-environment node
import type { Models } from 'appwrite';
import { AppwriteException } from 'appwrite';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { RequestEvent } from '@sveltejs/kit';
import { GET, PATCH, DELETE } from './+server.js';
import type {
    CreateRichTextPostData,
    UpdateRichTextPostData
} from '$lib/server/appwrite-utils/richtext.appwrite.js';

// Mock the Appwrite utility functions
const mockGetRichTextPostById = vi.hoisted(() => vi.fn());
const mockUpdateRichTextPost = vi.hoisted(() => vi.fn());
const mockDeleteRichTextPost = vi.hoisted(() => vi.fn());

vi.mock('$lib/server/appwrite-utils/richtext.appwrite.js', () => ({
    getRichTextPostById: mockGetRichTextPostById,
    updateRichTextPost: mockUpdateRichTextPost,
    deleteRichTextPost: mockDeleteRichTextPost
}));

describe('GET /api/richtextposts/[id]', () => {
    const mockPostId = 'rtp123';
    const mockRichTextPostData: CreateRichTextPostData = {
        postId: 'parentPost789',
        title: 'Fetched Rich Text Post',
        body: '<p>Detailed content of the fetched post.</p>',
        excerpt: 'A concise summary of the fetched post.',
        version: 2
    };
    const mockDocument: Models.Document = {
        $id: mockPostId,
        $collectionId: 'richTextPosts', // Assuming this from previous context
        $databaseId: 'main', // Assuming this
        $createdAt: new Date().toISOString(),
        $updatedAt: new Date().toISOString(),
        $permissions: [],
        ...mockRichTextPostData
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return 200 and the rich text post if found', async () => {
        mockGetRichTextPostById.mockResolvedValue(mockDocument);

        const event = {
            params: { id: mockPostId },
            request: new Request(`http://localhost/api/richtextposts/${mockPostId}`),
            url: new URL(`http://localhost/api/richtextposts/${mockPostId}`),
            locals: {}
        } as unknown as RequestEvent;

        const response = await GET(event);
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body).toEqual(mockDocument);
        expect(mockGetRichTextPostById).toHaveBeenCalledWith(expect.anything(), mockPostId);
    });

    it('should return 404 if the rich text post is not found', async () => {
        // Simulate Appwrite throwing an error that indicates "not found"
        const notFoundError = new AppwriteException(
            'Document not found',
            404,
            'document_not_found'
        );
        mockGetRichTextPostById.mockRejectedValue(notFoundError);

        const event = {
            params: { id: 'nonExistentId' },
            request: new Request('http://localhost/api/richtextposts/nonExistentId'),
            url: new URL('http://localhost/api/richtextposts/nonExistentId'),
            locals: {}
        } as unknown as RequestEvent;

        const response = await GET(event);
        const body = await response.json();

        expect(response.status).toBe(404);
        expect(body.error).toBe('RichTextPost not found');
        expect(mockGetRichTextPostById).toHaveBeenCalledWith(expect.anything(), 'nonExistentId');
    });

    it('should return 500 if there is an unexpected server error', async () => {
        const serverError = new Error('Database connection failed');
        mockGetRichTextPostById.mockRejectedValue(serverError);

        const event = {
            params: { id: mockPostId },
            request: new Request(`http://localhost/api/richtextposts/${mockPostId}`),
            url: new URL(`http://localhost/api/richtextposts/${mockPostId}`),
            locals: {}
        } as unknown as RequestEvent;

        const response = await GET(event);
        const body = await response.json();

        expect(response.status).toBe(500);
        expect(body.error).toBe('Failed to fetch RichTextPost');
        expect(mockGetRichTextPostById).toHaveBeenCalledWith(expect.anything(), mockPostId);
    });
});

describe('PATCH /api/richtextposts/[id]', () => {
    const mockPostId = 'rtpUpdate123';
    const updateData: UpdateRichTextPostData = {
        title: 'Updated Title',
        body: '<p>Updated body content.</p>',
        excerpt: 'Updated excerpt.'
    };
    const mockUpdatedDocument: Models.Document = {
        $id: mockPostId,
        $collectionId: 'richTextPosts',
        $databaseId: 'main',
        $createdAt: new Date().toISOString(),
        $updatedAt: new Date().toISOString(),
        $permissions: [],
        postId: 'parentPostOriginal', // Assuming some original fields remain
        title: updateData.title!,
        body: updateData.body!,
        excerpt: updateData.excerpt
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should update the rich text post and return 200 with the updated document', async () => {
        mockUpdateRichTextPost.mockResolvedValue(mockUpdatedDocument);

        const event = {
            params: { id: mockPostId },
            request: new Request(`http://localhost/api/richtextposts/${mockPostId}`, {
                method: 'PATCH',
                body: JSON.stringify(updateData),
                headers: { 'Content-Type': 'application/json' }
            }),
            url: new URL(`http://localhost/api/richtextposts/${mockPostId}`),
            locals: {}
        } as unknown as RequestEvent;

        const response = await PATCH(event);
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body).toEqual(mockUpdatedDocument);
        expect(mockUpdateRichTextPost).toHaveBeenCalledWith(
            expect.anything(),
            mockPostId,
            updateData
        );
    });

    it('should return 404 if the rich text post to update is not found', async () => {
        const notFoundError = new AppwriteException(
            'Document not found to update',
            404,
            'document_not_found'
        );
        mockUpdateRichTextPost.mockRejectedValue(notFoundError);

        const event = {
            params: { id: 'nonExistentIdToUpdate' },
            request: new Request('http://localhost/api/richtextposts/nonExistentIdToUpdate', {
                method: 'PATCH',
                body: JSON.stringify(updateData),
                headers: { 'Content-Type': 'application/json' }
            }),
            url: new URL('http://localhost/api/richtextposts/nonExistentIdToUpdate'),
            locals: {}
        } as unknown as RequestEvent;

        const response = await PATCH(event);
        const body = await response.json();

        expect(response.status).toBe(404);
        expect(body.error).toBe('RichTextPost not found to update');
    });

    it('should return 400 if the request body is invalid or empty', async () => {
        const event = {
            params: { id: mockPostId },
            request: new Request(`http://localhost/api/richtextposts/${mockPostId}`, {
                method: 'PATCH',
                body: JSON.stringify({}), // Empty body
                headers: { 'Content-Type': 'application/json' }
            }),
            url: new URL(`http://localhost/api/richtextposts/${mockPostId}`),
            locals: {}
        } as unknown as RequestEvent;

        const response = await PATCH(event);
        expect(response.status).toBe(400); // Or specific error for empty update
        // Add assertion for body.error if applicable

        const invalidSyntaxEvent = {
            params: { id: mockPostId },
            request: new Request(`http://localhost/api/richtextposts/${mockPostId}`, {
                method: 'PATCH',
                body: '{title: "no quotes"}', // Invalid JSON syntax
                headers: { 'Content-Type': 'application/json' }
            }),
            url: new URL(`http://localhost/api/richtextposts/${mockPostId}`),
            locals: {}
        } as unknown as RequestEvent;
        const invalidSyntaxResponse = await PATCH(invalidSyntaxEvent);
        expect(invalidSyntaxResponse.status).toBe(400);
        const invalidSyntaxBody = await invalidSyntaxResponse.json();
        expect(invalidSyntaxBody.error).toContain('Invalid JSON');
    });

    it('should return 500 if there is an unexpected server error during update', async () => {
        const serverError = new Error('Database connection failed during update');
        mockUpdateRichTextPost.mockRejectedValue(serverError);

        const event = {
            params: { id: mockPostId },
            request: new Request(`http://localhost/api/richtextposts/${mockPostId}`, {
                method: 'PATCH',
                body: JSON.stringify(updateData),
                headers: { 'Content-Type': 'application/json' }
            }),
            url: new URL(`http://localhost/api/richtextposts/${mockPostId}`),
            locals: {}
        } as unknown as RequestEvent;

        const response = await PATCH(event);
        const body = await response.json();

        expect(response.status).toBe(500);
        expect(body.error).toBe('Failed to update RichTextPost');
    });
});

describe('DELETE /api/richtextposts/[id]', () => {
    const mockPostId = 'rtpDelete123';

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should delete the rich text post and return 204 on success', async () => {
        mockDeleteRichTextPost.mockResolvedValue(undefined);

        const event = {
            params: { id: mockPostId },
            request: new Request(`http://localhost/api/richtextposts/${mockPostId}`, {
                method: 'DELETE'
            }),
            url: new URL(`http://localhost/api/richtextposts/${mockPostId}`),
            locals: {}
        } as unknown as RequestEvent;

        const response = await DELETE(event);

        expect(response.status).toBe(204);
        expect(mockDeleteRichTextPost).toHaveBeenCalledWith(expect.anything(), mockPostId);
    });

    it('should return 404 if the rich text post to delete is not found', async () => {
        const notFoundError = new AppwriteException(
            'Document not found to delete',
            404,
            'document_not_found'
        );
        mockDeleteRichTextPost.mockRejectedValue(notFoundError);

        const event = {
            params: { id: 'nonExistentIdToDelete' },
            request: new Request('http://localhost/api/richtextposts/nonExistentIdToDelete', {
                method: 'DELETE'
            }),
            url: new URL('http://localhost/api/richtextposts/nonExistentIdToDelete'),
            locals: {}
        } as unknown as RequestEvent;

        const response = await DELETE(event);
        const body = await response.json();

        expect(response.status).toBe(404);
        expect(body.error).toBe('RichTextPost not found to delete');
        expect(mockDeleteRichTextPost).toHaveBeenCalledWith(
            expect.anything(),
            'nonExistentIdToDelete'
        );
    });

    it('should return 400 if id parameter is missing', async () => {
        const event = {
            params: {},
            request: new Request('http://localhost/api/richtextposts/', {
                method: 'DELETE'
            }),
            url: new URL('http://localhost/api/richtextposts/'),
            locals: {}
        } as unknown as RequestEvent;

        const response = await DELETE(event);
        const body = await response.json();

        expect(response.status).toBe(400);
        expect(body.error).toBe('Post ID is required for deletion');
        expect(mockDeleteRichTextPost).not.toHaveBeenCalled();
    });

    it('should return 500 if there is an unexpected server error during deletion', async () => {
        const serverError = new Error('Database connection failed during deletion');
        mockDeleteRichTextPost.mockRejectedValue(serverError);

        const event = {
            params: { id: mockPostId },
            request: new Request(`http://localhost/api/richtextposts/${mockPostId}`, {
                method: 'DELETE'
            }),
            url: new URL(`http://localhost/api/richtextposts/${mockPostId}`),
            locals: {}
        } as unknown as RequestEvent;

        const response = await DELETE(event);
        const body = await response.json();

        expect(response.status).toBe(500);
        expect(body.error).toBe('Failed to delete RichTextPost');
        expect(mockDeleteRichTextPost).toHaveBeenCalledWith(expect.anything(), mockPostId);
    });
});
