// @vitest-environment node
import type { Models } from 'appwrite';
import { AppwriteException } from 'appwrite';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { RequestEvent } from '@sveltejs/kit';
import { GET, PATCH, DELETE } from './+server.js';

// Mock the Appwrite utility functions
const mockGettextPostById = vi.hoisted(() => vi.fn());
const mockUpdatetextPost = vi.hoisted(() => vi.fn());
const mockDeletetextPost = vi.hoisted(() => vi.fn());

vi.mock('$lib/server/appwrite-utils/richtext.appwrite.js', () => ({
    gettextPostById: mockGettextPostById,
    updatetextPost: mockUpdatetextPost,
    deletetextPost: mockDeletetextPost
}));

describe('GET /api/textPosts/[id]', () => {
    const mockPostId = 'rtp123';
    const mocktextPostData = {
        postId: 'parentPost789',
        title: 'Fetched Rich Text Post',
        body: '<p>Detailed content of the fetched post.</p>',
        excerpt: 'A concise summary of the fetched post.',
        version: 2
    };
    const mockDocument: Models.Document = {
        $id: mockPostId,
        $collectionId: 'textPosts', // Assuming this from previous context
        $databaseId: 'main', // Assuming this
        $createdAt: new Date().toISOString(),
        $updatedAt: new Date().toISOString(),
        $permissions: [],
        ...mocktextPostData
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return 200 and the rich text post if found', async () => {
        mockGettextPostById.mockResolvedValue(mockDocument);

        const event = {
            params: { id: mockPostId },
            request: new Request(`http://localhost/api/textPosts/${mockPostId}`),
            url: new URL(`http://localhost/api/textPosts/${mockPostId}`),
            locals: {}
        } as unknown as RequestEvent;

        const response = await GET(event);
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body).toEqual(mockDocument);
        expect(mockGettextPostById).toHaveBeenCalledWith(expect.anything(), mockPostId);
    });

    it('should return 404 if the rich text post is not found', async () => {
        // Simulate Appwrite throwing an error that indicates "not found"
        const notFoundError = new AppwriteException(
            'Document not found',
            404,
            'document_not_found'
        );
        mockGettextPostById.mockRejectedValue(notFoundError);

        const event = {
            params: { id: 'nonExistentId' },
            request: new Request('http://localhost/api/textPosts/nonExistentId'),
            url: new URL('http://localhost/api/textPosts/nonExistentId'),
            locals: {}
        } as unknown as RequestEvent;

        const response = await GET(event);
        const body = await response.json();

        expect(response.status).toBe(404);
        expect(body.error).toBe('textPost not found');
        expect(mockGettextPostById).toHaveBeenCalledWith(expect.anything(), 'nonExistentId');
    });

    it('should return 500 if there is an unexpected server error', async () => {
        const serverError = new Error('Database connection failed');
        mockGettextPostById.mockRejectedValue(serverError);

        const event = {
            params: { id: mockPostId },
            request: new Request(`http://localhost/api/textPosts/${mockPostId}`),
            url: new URL(`http://localhost/api/textPosts/${mockPostId}`),
            locals: {}
        } as unknown as RequestEvent;

        const response = await GET(event);
        const body = await response.json();

        expect(response.status).toBe(500);
        expect(body.error).toBe('Failed to fetch textPost');
        expect(mockGettextPostById).toHaveBeenCalledWith(expect.anything(), mockPostId);
    });
});

describe('PATCH /api/textPosts/[id]', () => {
    const mockPostId = 'rtpUpdate123';
    const updateData = {
        title: 'Updated Title',
        body: '<p>Updated body content.</p>',
        excerpt: 'Updated excerpt.'
    };
    const mockUpdatedDocument: Models.Document = {
        $id: mockPostId,
        $collectionId: 'textPosts',
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
        mockUpdatetextPost.mockResolvedValue(mockUpdatedDocument);

        const event = {
            params: { id: mockPostId },
            request: new Request(`http://localhost/api/textPosts/${mockPostId}`, {
                method: 'PATCH',
                body: JSON.stringify(updateData),
                headers: { 'Content-Type': 'application/json' }
            }),
            url: new URL(`http://localhost/api/textPosts/${mockPostId}`),
            locals: {}
        } as unknown as RequestEvent;

        const response = await PATCH(event);
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body).toEqual(mockUpdatedDocument);
        expect(mockUpdatetextPost).toHaveBeenCalledWith(expect.anything(), mockPostId, updateData);
    });

    it('should return 404 if the rich text post to update is not found', async () => {
        const notFoundError = new AppwriteException(
            'Document not found to update',
            404,
            'document_not_found'
        );
        mockUpdatetextPost.mockRejectedValue(notFoundError);

        const event = {
            params: { id: 'nonExistentIdToUpdate' },
            request: new Request('http://localhost/api/textPosts/nonExistentIdToUpdate', {
                method: 'PATCH',
                body: JSON.stringify(updateData),
                headers: { 'Content-Type': 'application/json' }
            }),
            url: new URL('http://localhost/api/textPosts/nonExistentIdToUpdate'),
            locals: {}
        } as unknown as RequestEvent;

        const response = await PATCH(event);
        const body = await response.json();

        expect(response.status).toBe(404);
        expect(body.error).toBe('textPost not found to update');
    });

    it('should return 400 if the request body is invalid or empty', async () => {
        const event = {
            params: { id: mockPostId },
            request: new Request(`http://localhost/api/textPosts/${mockPostId}`, {
                method: 'PATCH',
                body: JSON.stringify({}), // Empty body
                headers: { 'Content-Type': 'application/json' }
            }),
            url: new URL(`http://localhost/api/textPosts/${mockPostId}`),
            locals: {}
        } as unknown as RequestEvent;

        const response = await PATCH(event);
        expect(response.status).toBe(400); // Or specific error for empty update
        // Add assertion for body.error if applicable

        const invalidSyntaxEvent = {
            params: { id: mockPostId },
            request: new Request(`http://localhost/api/textPosts/${mockPostId}`, {
                method: 'PATCH',
                body: '{title: "no quotes"}', // Invalid JSON syntax
                headers: { 'Content-Type': 'application/json' }
            }),
            url: new URL(`http://localhost/api/textPosts/${mockPostId}`),
            locals: {}
        } as unknown as RequestEvent;
        const invalidSyntaxResponse = await PATCH(invalidSyntaxEvent);
        expect(invalidSyntaxResponse.status).toBe(400);
        const invalidSyntaxBody = await invalidSyntaxResponse.json();
        expect(invalidSyntaxBody.error).toContain('Invalid JSON');
    });

    it('should return 500 if there is an unexpected server error during update', async () => {
        const serverError = new Error('Database connection failed during update');
        mockUpdatetextPost.mockRejectedValue(serverError);

        const event = {
            params: { id: mockPostId },
            request: new Request(`http://localhost/api/textPosts/${mockPostId}`, {
                method: 'PATCH',
                body: JSON.stringify(updateData),
                headers: { 'Content-Type': 'application/json' }
            }),
            url: new URL(`http://localhost/api/textPosts/${mockPostId}`),
            locals: {}
        } as unknown as RequestEvent;

        const response = await PATCH(event);
        const body = await response.json();

        expect(response.status).toBe(500);
        expect(body.error).toBe('Failed to update textPost');
    });
});

describe('DELETE /api/textPosts/[id]', () => {
    const mockPostId = 'rtpDelete123';

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should delete the rich text post and return 204 on success', async () => {
        mockDeletetextPost.mockResolvedValue(undefined);

        const event = {
            params: { id: mockPostId },
            request: new Request(`http://localhost/api/textPosts/${mockPostId}`, {
                method: 'DELETE'
            }),
            url: new URL(`http://localhost/api/textPosts/${mockPostId}`),
            locals: {}
        } as unknown as RequestEvent;

        const response = await DELETE(event);

        expect(response.status).toBe(204);
        expect(mockDeletetextPost).toHaveBeenCalledWith(expect.anything(), mockPostId);
    });

    it('should return 404 if the rich text post to delete is not found', async () => {
        const notFoundError = new AppwriteException(
            'Document not found to delete',
            404,
            'document_not_found'
        );
        mockDeletetextPost.mockRejectedValue(notFoundError);

        const event = {
            params: { id: 'nonExistentIdToDelete' },
            request: new Request('http://localhost/api/textPosts/nonExistentIdToDelete', {
                method: 'DELETE'
            }),
            url: new URL('http://localhost/api/textPosts/nonExistentIdToDelete'),
            locals: {}
        } as unknown as RequestEvent;

        const response = await DELETE(event);
        const body = await response.json();

        expect(response.status).toBe(404);
        expect(body.error).toBe('textPost not found to delete');
        expect(mockDeletetextPost).toHaveBeenCalledWith(expect.anything(), 'nonExistentIdToDelete');
    });

    it('should return 400 if id parameter is missing', async () => {
        const event = {
            params: {},
            request: new Request('http://localhost/api/textPosts/', {
                method: 'DELETE'
            }),
            url: new URL('http://localhost/api/textPosts/'),
            locals: {}
        } as unknown as RequestEvent;

        const response = await DELETE(event);
        const body = await response.json();

        expect(response.status).toBe(400);
        expect(body.error).toBe('Post ID is required for deletion');
        expect(mockDeletetextPost).not.toHaveBeenCalled();
    });

    it('should return 500 if there is an unexpected server error during deletion', async () => {
        const serverError = new Error('Database connection failed during deletion');
        mockDeletetextPost.mockRejectedValue(serverError);

        const event = {
            params: { id: mockPostId },
            request: new Request(`http://localhost/api/textPosts/${mockPostId}`, {
                method: 'DELETE'
            }),
            url: new URL(`http://localhost/api/textPosts/${mockPostId}`),
            locals: {}
        } as unknown as RequestEvent;

        const response = await DELETE(event);
        const body = await response.json();

        expect(response.status).toBe(500);
        expect(body.error).toBe('Failed to delete textPost');
        expect(mockDeletetextPost).toHaveBeenCalledWith(expect.anything(), mockPostId);
    });
});
