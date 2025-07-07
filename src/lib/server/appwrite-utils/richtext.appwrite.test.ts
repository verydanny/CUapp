// @vitest-environment node

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    createtextPost,
    gettextPostById,
    updatetextPost,
    deletetextPost
} from './richtext.appwrite.js';
import type { Databases, Models } from 'node-appwrite';
import type { TextPost } from '$root/lib/types/appwrite.js';

const mockCreateDocument = vi.fn();
const mockGetDocument = vi.fn();
const mockListDocuments = vi.fn();
const mockUpdateDocument = vi.fn();
const mockDeleteDocument = vi.fn();

const mockDatabases = {
    createDocument: mockCreateDocument,
    getDocument: mockGetDocument,
    listDocuments: mockListDocuments,
    updateDocument: mockUpdateDocument,
    deleteDocument: mockDeleteDocument
} as unknown as Databases;

const DATABASE_ID = 'main';
const RICH_TEXT_POST_COLLECTION_ID = 'textPosts';

describe('Appwrite: textPost Interactions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockCreateDocument.mockResolvedValue({
            $id: 'mock-rtp-id',
            $collectionId: RICH_TEXT_POST_COLLECTION_ID,
            $databaseId: DATABASE_ID,
            $createdAt: new Date().toISOString(),
            $updatedAt: new Date().toISOString(),
            $permissions: []
        } as Models.Document);
    });

    describe('Creation', () => {
        describe('createtextPost', () => {
            it('should call createDocument with correct parameters when creating a textPost', async () => {
                const postData = {
                    postId: 'parentPost123',
                    title: 'My First Rich Text Post',
                    body: '<p>Hello World</p>',
                    version: 1
                } as TextPost;

                await createtextPost(mockDatabases, postData);

                expect(mockDatabases.createDocument).toHaveBeenCalledOnce();
                expect(mockDatabases.createDocument).toHaveBeenCalledWith(
                    DATABASE_ID,
                    RICH_TEXT_POST_COLLECTION_ID,
                    expect.any(String),
                    postData
                );
            });

            it('should re-throw errors from Appwrite createDocument when creating a textPost', async () => {
                const postData = {
                    postId: 'parentPostError',
                    title: 'Error Post',
                    body: '<p>Error content</p>'
                } as TextPost;
                const mockError = new Error('Appwrite createDocument error');

                mockCreateDocument.mockRejectedValue(mockError);

                await expect(createtextPost(mockDatabases, postData)).rejects.toThrow(mockError);

                expect(mockDatabases.createDocument).toHaveBeenCalledOnce();
                expect(mockDatabases.createDocument).toHaveBeenCalledWith(
                    DATABASE_ID,
                    RICH_TEXT_POST_COLLECTION_ID,
                    expect.any(String),
                    postData
                );
            });
        });
    });

    describe('Fetching', () => {
        describe('gettextPostById', () => {
            it('should call getDocument with correct parameters and return the document', async () => {
                const mockDocumentId = 'rtpDoc123';
                const mockFetchedData = {
                    postId: 'parentPostFetched',
                    title: 'Fetched Post',
                    body: '<p>Fetched content</p>'
                };
                const mockReturnedDoc: Models.Document = {
                    $id: mockDocumentId,
                    $collectionId: RICH_TEXT_POST_COLLECTION_ID,
                    $databaseId: DATABASE_ID,
                    $createdAt: new Date().toISOString(),
                    $updatedAt: new Date().toISOString(),
                    $permissions: [],
                    ...mockFetchedData
                };
                mockGetDocument.mockResolvedValue(mockReturnedDoc);

                const fetchedDoc = await gettextPostById(mockDatabases, mockDocumentId);

                expect(mockDatabases.getDocument).toHaveBeenCalledOnce();
                expect(mockDatabases.getDocument).toHaveBeenCalledWith(
                    DATABASE_ID,
                    RICH_TEXT_POST_COLLECTION_ID,
                    mockDocumentId
                );
                expect(fetchedDoc).toEqual(mockReturnedDoc);
            });

            it('should re-throw errors from Appwrite getDocument', async () => {
                const mockDocumentId = 'rtpDocError';
                const mockError = new Error('Appwrite getDocument error');

                mockGetDocument.mockRejectedValue(mockError);

                await expect(gettextPostById(mockDatabases, mockDocumentId)).rejects.toThrow(
                    mockError
                );

                expect(mockDatabases.getDocument).toHaveBeenCalledOnce();
                expect(mockDatabases.getDocument).toHaveBeenCalledWith(
                    DATABASE_ID,
                    RICH_TEXT_POST_COLLECTION_ID,
                    mockDocumentId
                );
            });
        });
    });

    describe('Updating', () => {
        describe('updatetextPost', () => {
            it('should call updateDocument with correct parameters and return the updated document', async () => {
                const mockDocumentId = 'rtpDocUpdate123';
                const updateData = {
                    title: 'Updated Title',
                    excerpt: 'Updated excerpt'
                };
                const mockReturnedUpdatedDoc: Models.Document = {
                    $id: mockDocumentId,
                    $collectionId: RICH_TEXT_POST_COLLECTION_ID,
                    $databaseId: DATABASE_ID,
                    $createdAt: new Date().toISOString(), // Original creation time
                    $updatedAt: new Date().toISOString(), // New update time
                    $permissions: [],
                    postId: 'parentPostOriginal', // Assume other fields remain
                    title: updateData.title!,
                    body: '<p>Original body</p>',
                    excerpt: updateData.excerpt
                    // ... other fields from CreatetextPostData as needed for full mock
                };
                mockUpdateDocument.mockResolvedValue(mockReturnedUpdatedDoc);

                const updatedDoc = await updatetextPost(mockDatabases, mockDocumentId, updateData);

                expect(mockDatabases.updateDocument).toHaveBeenCalledOnce();
                expect(mockDatabases.updateDocument).toHaveBeenCalledWith(
                    DATABASE_ID,
                    RICH_TEXT_POST_COLLECTION_ID,
                    mockDocumentId,
                    updateData
                );
                expect(updatedDoc).toEqual(mockReturnedUpdatedDoc);
            });

            it('should re-throw errors from Appwrite updateDocument', async () => {
                const mockDocumentId = 'rtpDocUpdateError';
                const updateData = { title: 'Update Error' };
                const mockError = new Error('Appwrite updateDocument error');

                mockUpdateDocument.mockRejectedValue(mockError);

                await expect(
                    updatetextPost(mockDatabases, mockDocumentId, updateData)
                ).rejects.toThrow(mockError);

                expect(mockDatabases.updateDocument).toHaveBeenCalledOnce();
                expect(mockDatabases.updateDocument).toHaveBeenCalledWith(
                    DATABASE_ID,
                    RICH_TEXT_POST_COLLECTION_ID,
                    mockDocumentId,
                    updateData
                );
            });
        });
    });

    describe('Deleting', () => {
        describe('deletetextPost', () => {
            it('should call deleteDocument with correct parameters', async () => {
                const mockDocumentId = 'rtpDocDelete123';
                // deleteDocument usually resolves with undefined or an empty object upon success
                mockDeleteDocument.mockResolvedValue(undefined);

                await deletetextPost(mockDatabases, mockDocumentId);

                expect(mockDatabases.deleteDocument).toHaveBeenCalledOnce();
                expect(mockDatabases.deleteDocument).toHaveBeenCalledWith(
                    DATABASE_ID,
                    RICH_TEXT_POST_COLLECTION_ID,
                    mockDocumentId
                );
            });

            it('should re-throw errors from Appwrite deleteDocument', async () => {
                const mockDocumentId = 'rtpDocDeleteError';
                const mockError = new Error('Appwrite deleteDocument error');

                mockDeleteDocument.mockRejectedValue(mockError);

                await expect(deletetextPost(mockDatabases, mockDocumentId)).rejects.toThrow(
                    mockError
                );

                expect(mockDatabases.deleteDocument).toHaveBeenCalledOnce();
                expect(mockDatabases.deleteDocument).toHaveBeenCalledWith(
                    DATABASE_ID,
                    RICH_TEXT_POST_COLLECTION_ID,
                    mockDocumentId
                );
            });
        });
    });
});
