// @vitest-environment node

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    createRichTextPost,
    getRichTextPostById,
    updateRichTextPost,
    deleteRichTextPost,
    type CreateRichTextPostData,
    type UpdateRichTextPostData
} from './richtext.appwrite.js';
import type { Databases, Models } from 'node-appwrite';

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

const APPWRITE_DATABASE_ID = 'main';
const RICH_TEXT_POSTS_COLLECTION_ID = 'richTextPosts';

describe('Appwrite: RichTextPost Interactions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockCreateDocument.mockResolvedValue({
            $id: 'mock-rtp-id',
            $collectionId: RICH_TEXT_POSTS_COLLECTION_ID,
            $databaseId: APPWRITE_DATABASE_ID,
            $createdAt: new Date().toISOString(),
            $updatedAt: new Date().toISOString(),
            $permissions: [],
            ...({} as CreateRichTextPostData) // Cast to avoid type errors for spread
        } as Models.Document);
    });

    describe('Creation', () => {
        describe('createRichTextPost', () => {
            it('should call createDocument with correct parameters when creating a RichTextPost', async () => {
                const postData: CreateRichTextPostData = {
                    postId: 'parentPost123',
                    title: 'My First Rich Text Post',
                    body: '<p>Hello World</p>',
                    excerpt: 'A short intro',
                    version: 1
                };

                await createRichTextPost(mockDatabases, postData);

                expect(mockDatabases.createDocument).toHaveBeenCalledOnce();
                expect(mockDatabases.createDocument).toHaveBeenCalledWith(
                    APPWRITE_DATABASE_ID,
                    RICH_TEXT_POSTS_COLLECTION_ID,
                    expect.any(String),
                    postData
                );
            });

            it('should re-throw errors from Appwrite createDocument when creating a RichTextPost', async () => {
                const postData: CreateRichTextPostData = {
                    postId: 'parentPostError',
                    title: 'Error Post',
                    body: '<p>Error content</p>'
                };
                const mockError = new Error('Appwrite createDocument error');

                mockCreateDocument.mockRejectedValue(mockError);

                await expect(createRichTextPost(mockDatabases, postData)).rejects.toThrow(
                    mockError
                );

                expect(mockDatabases.createDocument).toHaveBeenCalledOnce();
                expect(mockDatabases.createDocument).toHaveBeenCalledWith(
                    APPWRITE_DATABASE_ID,
                    RICH_TEXT_POSTS_COLLECTION_ID,
                    expect.any(String),
                    postData
                );
            });
        });
    });

    describe('Fetching', () => {
        describe('getRichTextPostById', () => {
            it('should call getDocument with correct parameters and return the document', async () => {
                const mockDocumentId = 'rtpDoc123';
                const mockFetchedData: CreateRichTextPostData = {
                    postId: 'parentPostFetched',
                    title: 'Fetched Post',
                    body: '<p>Fetched content</p>'
                };
                const mockReturnedDoc: Models.Document = {
                    $id: mockDocumentId,
                    $collectionId: RICH_TEXT_POSTS_COLLECTION_ID,
                    $databaseId: APPWRITE_DATABASE_ID,
                    $createdAt: new Date().toISOString(),
                    $updatedAt: new Date().toISOString(),
                    $permissions: [],
                    ...mockFetchedData
                };
                mockGetDocument.mockResolvedValue(mockReturnedDoc);

                const fetchedDoc = await getRichTextPostById(mockDatabases, mockDocumentId);

                expect(mockDatabases.getDocument).toHaveBeenCalledOnce();
                expect(mockDatabases.getDocument).toHaveBeenCalledWith(
                    APPWRITE_DATABASE_ID,
                    RICH_TEXT_POSTS_COLLECTION_ID,
                    mockDocumentId
                );
                expect(fetchedDoc).toEqual(mockReturnedDoc);
            });

            it('should re-throw errors from Appwrite getDocument', async () => {
                const mockDocumentId = 'rtpDocError';
                const mockError = new Error('Appwrite getDocument error');

                mockGetDocument.mockRejectedValue(mockError);

                await expect(getRichTextPostById(mockDatabases, mockDocumentId)).rejects.toThrow(
                    mockError
                );

                expect(mockDatabases.getDocument).toHaveBeenCalledOnce();
                expect(mockDatabases.getDocument).toHaveBeenCalledWith(
                    APPWRITE_DATABASE_ID,
                    RICH_TEXT_POSTS_COLLECTION_ID,
                    mockDocumentId
                );
            });
        });
    });

    describe('Updating', () => {
        describe('updateRichTextPost', () => {
            it('should call updateDocument with correct parameters and return the updated document', async () => {
                const mockDocumentId = 'rtpDocUpdate123';
                const updateData: UpdateRichTextPostData = {
                    title: 'Updated Title',
                    excerpt: 'Updated excerpt'
                };
                const mockReturnedUpdatedDoc: Models.Document = {
                    $id: mockDocumentId,
                    $collectionId: RICH_TEXT_POSTS_COLLECTION_ID,
                    $databaseId: APPWRITE_DATABASE_ID,
                    $createdAt: new Date().toISOString(), // Original creation time
                    $updatedAt: new Date().toISOString(), // New update time
                    $permissions: [],
                    postId: 'parentPostOriginal', // Assume other fields remain
                    title: updateData.title!,
                    body: '<p>Original body</p>',
                    excerpt: updateData.excerpt
                    // ... other fields from CreateRichTextPostData as needed for full mock
                };
                mockUpdateDocument.mockResolvedValue(mockReturnedUpdatedDoc);

                const updatedDoc = await updateRichTextPost(
                    mockDatabases,
                    mockDocumentId,
                    updateData
                );

                expect(mockDatabases.updateDocument).toHaveBeenCalledOnce();
                expect(mockDatabases.updateDocument).toHaveBeenCalledWith(
                    APPWRITE_DATABASE_ID,
                    RICH_TEXT_POSTS_COLLECTION_ID,
                    mockDocumentId,
                    updateData
                );
                expect(updatedDoc).toEqual(mockReturnedUpdatedDoc);
            });

            it('should re-throw errors from Appwrite updateDocument', async () => {
                const mockDocumentId = 'rtpDocUpdateError';
                const updateData: UpdateRichTextPostData = { title: 'Update Error' };
                const mockError = new Error('Appwrite updateDocument error');

                mockUpdateDocument.mockRejectedValue(mockError);

                await expect(
                    updateRichTextPost(mockDatabases, mockDocumentId, updateData)
                ).rejects.toThrow(mockError);

                expect(mockDatabases.updateDocument).toHaveBeenCalledOnce();
                expect(mockDatabases.updateDocument).toHaveBeenCalledWith(
                    APPWRITE_DATABASE_ID,
                    RICH_TEXT_POSTS_COLLECTION_ID,
                    mockDocumentId,
                    updateData
                );
            });
        });
    });

    describe('Deleting', () => {
        describe('deleteRichTextPost', () => {
            it('should call deleteDocument with correct parameters', async () => {
                const mockDocumentId = 'rtpDocDelete123';
                // deleteDocument usually resolves with undefined or an empty object upon success
                mockDeleteDocument.mockResolvedValue(undefined);

                await deleteRichTextPost(mockDatabases, mockDocumentId);

                expect(mockDatabases.deleteDocument).toHaveBeenCalledOnce();
                expect(mockDatabases.deleteDocument).toHaveBeenCalledWith(
                    APPWRITE_DATABASE_ID,
                    RICH_TEXT_POSTS_COLLECTION_ID,
                    mockDocumentId
                );
            });

            it('should re-throw errors from Appwrite deleteDocument', async () => {
                const mockDocumentId = 'rtpDocDeleteError';
                const mockError = new Error('Appwrite deleteDocument error');

                mockDeleteDocument.mockRejectedValue(mockError);

                await expect(deleteRichTextPost(mockDatabases, mockDocumentId)).rejects.toThrow(
                    mockError
                );

                expect(mockDatabases.deleteDocument).toHaveBeenCalledOnce();
                expect(mockDatabases.deleteDocument).toHaveBeenCalledWith(
                    APPWRITE_DATABASE_ID,
                    RICH_TEXT_POSTS_COLLECTION_ID,
                    mockDocumentId
                );
            });
        });
    });
});
