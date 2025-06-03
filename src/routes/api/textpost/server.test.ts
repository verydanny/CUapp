// @vitest-environment node

import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { RequestEvent } from '@sveltejs/kit';
import { POST } from './+server.js';

const mockCreatetextPost = vi.hoisted(() => vi.fn());

// Mock the Appwrite utility function
vi.mock('$lib/server/appwrite-utils/richtext.appwrite.js', () => ({
    createtextPost: mockCreatetextPost
}));

describe('POST /api/textPosts', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should create a rich text post and return 201 on success', async () => {
        const postData = {
            postId: 'parentPost123',
            title: 'Test Rich Text Post',
            body: '<p>Amazing content here.</p>',
            excerpt: 'A brief summary.',
            version: 1
        };
        const mockCreatedDocument = { $id: 'newRichTextDocId', ...postData };

        mockCreatetextPost.mockResolvedValue(mockCreatedDocument);

        const mockRequest = new Request('http://localhost/api/textPosts', {
            method: 'POST',
            body: JSON.stringify(postData),
            headers: { 'Content-Type': 'application/json' }
        });

        const event = {
            request: mockRequest,
            params: {},
            url: new URL('http://localhost/api/textPosts'),
            locals: {} // Ensure locals is present, even if empty
        } as unknown as RequestEvent;

        const response = await POST(event);
        const body = await response.json();

        expect(response.status).toBe(201);
        expect(body).toEqual(mockCreatedDocument);
        expect(mockCreatetextPost).toHaveBeenCalledWith(expect.anything(), postData); // Adjusted for databases client
    });

    it('should return 400 if postId is missing', async () => {
        const postData = {
            title: 'Test Rich Text Post',
            body: '<p>Amazing content here.</p>'
        }; // Missing postId

        const mockRequest = new Request('http://localhost/api/textPosts', {
            method: 'POST',
            body: JSON.stringify(postData),
            headers: { 'Content-Type': 'application/json' }
        });
        const event = {
            request: mockRequest,
            params: {},
            url: new URL('http://localhost/api/textPosts'),
            locals: {}
        } as unknown as RequestEvent;

        const response = await POST(event);

        expect(response.status).toBe(400);
        expect(mockCreatetextPost).not.toHaveBeenCalled();
    });

    it('should return 400 if title is missing', async () => {
        const postData = {
            postId: 'parentPost123',
            body: '<p>Amazing content here.</p>'
        }; // Missing title

        const mockRequest = new Request('http://localhost/api/textPosts', {
            method: 'POST',
            body: JSON.stringify(postData),
            headers: { 'Content-Type': 'application/json' }
        });
        const event = {
            request: mockRequest,
            params: {},
            url: new URL('http://localhost/api/textPosts'),
            locals: {}
        } as RequestEvent;

        const response = await POST(event);
        expect(response.status).toBe(400);
        expect(mockCreatetextPost).not.toHaveBeenCalled();
    });

    it('should return 400 if body is missing', async () => {
        const postData = {
            postId: 'parentPost123',
            title: 'Test Rich Text Post'
        }; // Missing body

        const mockRequest = new Request('http://localhost/api/textPosts', {
            method: 'POST',
            body: JSON.stringify(postData),
            headers: { 'Content-Type': 'application/json' }
        });
        const event = {
            request: mockRequest,
            params: {},
            url: new URL('http://localhost/api/textPosts'),
            locals: {}
        } as unknown as RequestEvent;

        const response = await POST(event);
        expect(response.status).toBe(400);
        expect(mockCreatetextPost).not.toHaveBeenCalled();
    });

    it('should return 500 if createtextPost throws an unexpected error', async () => {
        const postData = {
            postId: 'parentPost500',
            title: 'Server Error Post',
            body: '<p>Content that causes server error.</p>'
        };
        mockCreatetextPost.mockRejectedValue(new Error('Unexpected DB failure'));

        const mockRequest = new Request('http://localhost/api/textPosts', {
            method: 'POST',
            body: JSON.stringify(postData),
            headers: { 'Content-Type': 'application/json' }
        });
        const event = {
            request: mockRequest,
            params: {},
            url: new URL('http://localhost/api/textPosts'),
            locals: {}
        } as unknown as RequestEvent;

        const response = await POST(event);
        expect(response.status).toBe(500);
    });
});
