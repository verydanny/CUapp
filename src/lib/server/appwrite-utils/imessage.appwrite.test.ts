// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';

import {
    createIMessageConversation,
    createIMessageMessage,
    createIMessageParticipant,
    getIMessageConversationById,
    getIMessageMessagesByConversationId,
    getIMessageParticipantsByIds,
    updateIMessageConversation,
    updateIMessageMessage,
    updateIMessageParticipant,
    deleteIMessageConversation,
    deleteIMessageMessage,
    deleteIMessageParticipant,
    type CreateIMessageConversationData,
    type CreateIMessageMessageData,
    type CreateIMessageParticipantData,
    type UpdateIMessageConversationData,
    type UpdateIMessageMessageData,
    type UpdateIMessageParticipantData
} from './imessage.appwrite.js'; // Import the actual function and type
import type { Models, Databases } from 'node-appwrite'; // For Models.Document type hint
import { Query } from 'node-appwrite'; // Import Query for test assertions

// Mock Appwrite Databases client and createDocument method
const mockCreateDocument = vi.fn();
const mockGetDocument = vi.fn(); // Mock for getDocument
const mockListDocuments = vi.fn(); // Mock for listDocuments
const mockUpdateDocument = vi.fn(); // Mock for updateDocument
const mockDeleteDocument = vi.fn(); // Mock for deleteDocument
// Cast to AppwriteDatabasesClient for type safety as we are only mocking parts of it
const mockDatabases = {
    createDocument: mockCreateDocument,
    getDocument: mockGetDocument, // Add to mock client
    listDocuments: mockListDocuments, // Add to mock client
    updateDocument: mockUpdateDocument, // Add to mock client
    deleteDocument: mockDeleteDocument // Add to mock client
} as unknown as Databases;

// Configuration for Appwrite (replace with actual values or env variables)
const APPWRITE_DATABASE_ID = 'main'; // As per posts-model-ai-context.md
const IMESSAGE_CONVERSATIONS_COLLECTION_ID = 'imessageConversations'; // As per imessage-models-ai-context.md
const IMESSAGE_MESSAGES_COLLECTION_ID = 'imessageMessages'; // New constant for tests
const IMESSAGE_PARTICIPANTS_COLLECTION_ID = 'imessageParticipants'; // New constant for tests

describe('Appwrite: iMessage Interactions', () => {
    // Reset the mock before each test
    beforeEach(() => {
        vi.clearAllMocks();
        // Set default successful responses for mocks
        mockCreateDocument.mockResolvedValue({
            $id: 'mock-id',
            $collectionId: 'mock-collection',
            $databaseId: 'mock-db',
            $createdAt: new Date().toISOString(),
            $updatedAt: new Date().toISOString(),
            $permissions: [],
            ...{}
        });
        mockUpdateDocument.mockResolvedValue({
            $id: 'mock-id',
            $collectionId: 'mock-collection',
            $databaseId: 'mock-db',
            $createdAt: new Date().toISOString(),
            $updatedAt: new Date().toISOString(),
            $permissions: [],
            ...{}
        });
        mockDeleteDocument.mockResolvedValue(undefined); // deleteDocument typically resolves with void or undefined
        // Add other mocks if needed later
    });

    describe('Creation', () => {
        describe('Conversation Creation', () => {
            it('should call createDocument with correct parameters when creating an iMessage conversation', async () => {
                const conversationData: CreateIMessageConversationData = {
                    postId: 'post123',
                    conversationId: 'conv456',
                    participantDocRefs: ['part1', 'part2'],
                    rightSideParticipantDocRef: 'part1',
                    screenshotMessageIds: ['msgX', 'msgY'],
                    totalScreenshots: 1
                };

                // Call the actual function (which is currently a placeholder)
                await createIMessageConversation(mockDatabases, conversationData);

                // Because the placeholder doesn't call mockDatabases.createDocument, this will fail.
                expect(mockDatabases.createDocument).toHaveBeenCalledOnce();
                expect(mockDatabases.createDocument).toHaveBeenCalledWith(
                    APPWRITE_DATABASE_ID,
                    IMESSAGE_CONVERSATIONS_COLLECTION_ID,
                    expect.any(String), // Use expect.any(String) for the document ID
                    conversationData
                );
            });

            it('should re-throw errors from Appwrite createDocument when creating a conversation', async () => {
                const conversationData = {
                    // Use minimal data required to call the function
                    postId: 'postError',
                    conversationId: 'convError',
                    participantDocRefs: [],
                    rightSideParticipantDocRef: '',
                    screenshotMessageIds: [],
                    totalScreenshots: 0
                };
                const mockError = new Error('Appwrite createDocument error');

                // Mock the createDocument method to reject with an error
                mockCreateDocument.mockRejectedValue(mockError);

                // Expect the utility function call to reject with the same error
                await expect(
                    createIMessageConversation(mockDatabases, conversationData)
                ).rejects.toThrow(mockError);

                // Optionally, verify that createDocument was still called
                expect(mockDatabases.createDocument).toHaveBeenCalledOnce();
                expect(mockDatabases.createDocument).toHaveBeenCalledWith(
                    APPWRITE_DATABASE_ID,
                    IMESSAGE_CONVERSATIONS_COLLECTION_ID,
                    expect.any(String),
                    conversationData
                );
            });
        });

        describe('Message Creation', () => {
            it('should call createDocument with correct parameters when creating an iMessage message', async () => {
                const messageData: CreateIMessageMessageData = {
                    conversationId: 'conv456',
                    messageId: 'msgUnique1',
                    participantDocId: 'part1',
                    content: 'Hello there!',
                    timestamp: new Date().toISOString(),
                    isEdited: false,
                    screenshotIndex: 0,
                    deliveryStatus: 'sent'
                };

                await createIMessageMessage(mockDatabases, messageData);

                expect(mockDatabases.createDocument).toHaveBeenCalledOnce();
                expect(mockDatabases.createDocument).toHaveBeenCalledWith(
                    APPWRITE_DATABASE_ID,
                    IMESSAGE_MESSAGES_COLLECTION_ID, // Use the correct collection ID
                    expect.any(String), // For ID.unique() or similar in implementation
                    messageData
                );
            });

            it('should re-throw errors from Appwrite createDocument when creating a message', async () => {
                const messageData: CreateIMessageMessageData = {
                    // Use minimal data required to call the function
                    conversationId: 'convError',
                    messageId: 'msgError',
                    participantDocId: 'partError',
                    content: 'Error message',
                    timestamp: new Date().toISOString(),
                    isEdited: false,
                    screenshotIndex: 0,
                    deliveryStatus: 'sent'
                };
                const mockError = new Error('Appwrite createDocument error');

                // Mock the createDocument method to reject with an error
                mockCreateDocument.mockRejectedValue(mockError);

                // Expect the utility function call to reject with the same error
                await expect(createIMessageMessage(mockDatabases, messageData)).rejects.toThrow(
                    mockError
                );

                // Optionally, verify that createDocument was still called
                expect(mockDatabases.createDocument).toHaveBeenCalledOnce();
                expect(mockDatabases.createDocument).toHaveBeenCalledWith(
                    APPWRITE_DATABASE_ID,
                    IMESSAGE_MESSAGES_COLLECTION_ID,
                    expect.any(String),
                    messageData
                );
            });
        });

        describe('Participant Creation', () => {
            it('should call createDocument with correct parameters when creating an iMessage participant', async () => {
                const participantData: CreateIMessageParticipantData = {
                    userId: 'userTest1',
                    name: 'Test User',
                    avatarFileId: 'avatarFile123'
                };

                await createIMessageParticipant(mockDatabases, participantData);

                expect(mockDatabases.createDocument).toHaveBeenCalledOnce();
                expect(mockDatabases.createDocument).toHaveBeenCalledWith(
                    APPWRITE_DATABASE_ID,
                    IMESSAGE_PARTICIPANTS_COLLECTION_ID, // Use the correct collection ID
                    expect.any(String), // For ID.unique() or similar in implementation
                    participantData
                );
            });

            it('should re-throw errors from Appwrite createDocument when creating a participant', async () => {
                const participantData: CreateIMessageParticipantData = {
                    // Use minimal data required to call the function
                    userId: 'userError',
                    name: 'Error Participant',
                    avatarFileId: undefined
                };
                const mockError = new Error('Appwrite createDocument error');

                // Mock the createDocument method to reject with an error
                mockCreateDocument.mockRejectedValue(mockError);

                // Expect the utility function call to reject with the same error
                await expect(
                    createIMessageParticipant(mockDatabases, participantData)
                ).rejects.toThrow(mockError);

                // Optionally, verify that createDocument was still called
                expect(mockDatabases.createDocument).toHaveBeenCalledOnce();
                expect(mockDatabases.createDocument).toHaveBeenCalledWith(
                    APPWRITE_DATABASE_ID,
                    IMESSAGE_PARTICIPANTS_COLLECTION_ID,
                    expect.any(String),
                    participantData
                );
            });
        });
    });

    describe('Fetching', () => {
        describe('Get Conversation By ID', () => {
            it('should call getDocument with correct parameters and return the document', async () => {
                const mockConversationDocId = 'docConv123';
                const mockFetchedConversationData: CreateIMessageConversationData = {
                    postId: 'postFetched',
                    conversationId: 'convFetched',
                    participantDocRefs: ['partFetched1'],
                    rightSideParticipantDocRef: 'partFetched1',
                    screenshotMessageIds: ['msgFetched'],
                    totalScreenshots: 1
                };
                const mockReturnedDoc: Models.Document = {
                    $id: mockConversationDocId,
                    $collectionId: IMESSAGE_CONVERSATIONS_COLLECTION_ID,
                    $databaseId: APPWRITE_DATABASE_ID,
                    $createdAt: new Date().toISOString(),
                    $updatedAt: new Date().toISOString(),
                    $permissions: [],
                    ...mockFetchedConversationData
                };
                mockGetDocument.mockResolvedValue(mockReturnedDoc);

                const fetchedDoc = await getIMessageConversationById(
                    mockDatabases,
                    mockConversationDocId
                );

                expect(mockDatabases.getDocument).toHaveBeenCalledOnce();
                expect(mockDatabases.getDocument).toHaveBeenCalledWith(
                    APPWRITE_DATABASE_ID,
                    IMESSAGE_CONVERSATIONS_COLLECTION_ID,
                    mockConversationDocId
                );
                expect(fetchedDoc).toEqual(mockReturnedDoc);
            });
        });

        describe('Get Messages By Conversation ID', () => {
            it('should call listDocuments with correct query and return documents', async () => {
                const targetConversationId = 'convToFetchMessagesFor';
                const mockMessageData: CreateIMessageMessageData = {
                    conversationId: targetConversationId,
                    messageId: 'msgFetched1',
                    participantDocId: 'part1',
                    content: 'Fetched message',
                    timestamp: new Date().toISOString(),
                    isEdited: false,
                    screenshotIndex: 0
                };
                const mockMessageDoc: Models.Document = {
                    $id: 'msgDocFetched1',
                    $collectionId: IMESSAGE_MESSAGES_COLLECTION_ID,
                    $databaseId: APPWRITE_DATABASE_ID,
                    $createdAt: new Date().toISOString(),
                    $updatedAt: new Date().toISOString(),
                    $permissions: [],
                    ...mockMessageData
                };
                const mockDocumentList: Models.DocumentList<Models.Document> = {
                    total: 1,
                    documents: [mockMessageDoc]
                };
                mockListDocuments.mockResolvedValue(mockDocumentList);

                const fetchedMessagesList = await getIMessageMessagesByConversationId(
                    mockDatabases,
                    targetConversationId
                );

                expect(mockDatabases.listDocuments).toHaveBeenCalledOnce();
                expect(mockDatabases.listDocuments).toHaveBeenCalledWith(
                    APPWRITE_DATABASE_ID,
                    IMESSAGE_MESSAGES_COLLECTION_ID,
                    [Query.equal('conversationId', targetConversationId)]
                );
                expect(fetchedMessagesList).toEqual(mockDocumentList);
            });

            it('should re-throw errors from Appwrite listDocuments when fetching messages by conversation ID', async () => {
                const targetConversationId = 'convToFetchErrorMessages';
                const mockError = new Error('Appwrite listDocuments error');

                // Mock the listDocuments method to reject with an error
                mockListDocuments.mockRejectedValue(mockError);

                // Expect the utility function call to reject with the same error
                await expect(
                    getIMessageMessagesByConversationId(mockDatabases, targetConversationId)
                ).rejects.toThrow(mockError);

                // Optionally, verify that listDocuments was still called
                expect(mockDatabases.listDocuments).toHaveBeenCalledOnce();
                expect(mockDatabases.listDocuments).toHaveBeenCalledWith(
                    APPWRITE_DATABASE_ID,
                    IMESSAGE_MESSAGES_COLLECTION_ID,
                    [Query.equal('conversationId', targetConversationId)]
                );
            });
        });

        describe('Get Messages With Pagination', () => {
            it('should call listDocuments with correct limit and offset queries', async () => {
                const targetConversationId = 'convForPagination';
                const limit = 5;
                const offset = 10;
                const mockDocumentList: Models.DocumentList<Models.Document> = {
                    // Mock response from Appwrite
                    total: 20,
                    documents: [
                        /* array of mock documents */
                    ]
                };

                mockListDocuments.mockResolvedValue(mockDocumentList);

                await getIMessageMessagesByConversationId(
                    mockDatabases,
                    targetConversationId,
                    [], // No additional queries for this test
                    limit,
                    offset
                );

                expect(mockDatabases.listDocuments).toHaveBeenCalledOnce();
                expect(mockDatabases.listDocuments).toHaveBeenCalledWith(
                    APPWRITE_DATABASE_ID,
                    IMESSAGE_MESSAGES_COLLECTION_ID,
                    [
                        Query.equal('conversationId', targetConversationId),
                        Query.limit(limit),
                        Query.offset(offset)
                    ]
                );
            });
        });

        describe('Get Participants By IDs', () => {
            it('should call getDocument for each ID and return the documents', async () => {
                const participantIds = ['partDoc1', 'partDoc2'];
                const mockParticipantData1: CreateIMessageParticipantData = {
                    userId: 'user1',
                    name: 'Participant 1'
                };
                const mockParticipantDoc1: Models.Document = {
                    $id: participantIds[0],
                    $collectionId: IMESSAGE_PARTICIPANTS_COLLECTION_ID,
                    $databaseId: APPWRITE_DATABASE_ID,
                    $createdAt: new Date().toISOString(),
                    $updatedAt: new Date().toISOString(),
                    $permissions: [],
                    ...mockParticipantData1
                };
                const mockParticipantData2: CreateIMessageParticipantData = {
                    userId: 'user2',
                    name: 'Participant 2'
                };
                const mockParticipantDoc2: Models.Document = {
                    $id: participantIds[1],
                    $collectionId: IMESSAGE_PARTICIPANTS_COLLECTION_ID,
                    $databaseId: APPWRITE_DATABASE_ID,
                    $createdAt: new Date().toISOString(),
                    $updatedAt: new Date().toISOString(),
                    $permissions: [],
                    ...mockParticipantData2
                };

                // Setup mockGetDocument to return specific docs based on ID
                mockGetDocument
                    .mockResolvedValueOnce(mockParticipantDoc1)
                    .mockResolvedValueOnce(mockParticipantDoc2);

                const fetchedParticipants = await getIMessageParticipantsByIds(
                    mockDatabases,
                    participantIds
                );

                expect(mockDatabases.getDocument).toHaveBeenCalledTimes(participantIds.length);
                expect(mockDatabases.getDocument).toHaveBeenNthCalledWith(
                    1,
                    APPWRITE_DATABASE_ID,
                    IMESSAGE_PARTICIPANTS_COLLECTION_ID,
                    participantIds[0]
                );
                expect(mockDatabases.getDocument).toHaveBeenNthCalledWith(
                    2,
                    APPWRITE_DATABASE_ID,
                    IMESSAGE_PARTICIPANTS_COLLECTION_ID,
                    participantIds[1]
                );
                expect(fetchedParticipants).toEqual([mockParticipantDoc1, mockParticipantDoc2]);
            });
        });
    });

    describe('Error Handling', () => {
        it('should re-throw errors from Appwrite getDocument when fetching a conversation', async () => {
            const mockConversationDocId = 'docConvToFetchError';
            const mockError = new Error('Appwrite getDocument error');

            // Mock the getDocument method to reject with an error
            mockGetDocument.mockRejectedValue(mockError);

            // Expect the utility function call to reject with the same error
            await expect(
                getIMessageConversationById(mockDatabases, mockConversationDocId)
            ).rejects.toThrow(mockError);

            // Optionally, verify that getDocument was still called
            expect(mockDatabases.getDocument).toHaveBeenCalledOnce();
            expect(mockDatabases.getDocument).toHaveBeenCalledWith(
                APPWRITE_DATABASE_ID,
                IMESSAGE_CONVERSATIONS_COLLECTION_ID,
                mockConversationDocId
            );
        });

        it('should re-throw errors from Appwrite updateDocument when updating a conversation', async () => {
            const documentIdToUpdate = 'convDocToUpdateError';
            const updateData: UpdateIMessageConversationData = { totalScreenshots: 99 }; // Use minimal data
            const mockError = new Error('Appwrite updateDocument error');

            // Mock the updateDocument method to reject with an error
            mockUpdateDocument.mockRejectedValue(mockError);

            // Expect the utility function call to reject with the same error
            await expect(
                updateIMessageConversation(mockDatabases, documentIdToUpdate, updateData)
            ).rejects.toThrow(mockError);

            // Optionally, verify that updateDocument was still called
            expect(mockDatabases.updateDocument).toHaveBeenCalledOnce();
            expect(mockDatabases.updateDocument).toHaveBeenCalledWith(
                APPWRITE_DATABASE_ID,
                IMESSAGE_CONVERSATIONS_COLLECTION_ID,
                documentIdToUpdate,
                updateData
            );
        });
    });

    describe('Updating', () => {
        describe('Conversation Updating', () => {
            it('should call updateDocument with correct parameters when updating an iMessage conversation', async () => {
                const mockConversationDocId = 'docConvUpdate123';
                const updateData: UpdateIMessageConversationData = {
                    totalScreenshots: 2
                };

                await updateIMessageConversation(mockDatabases, mockConversationDocId, updateData);

                expect(mockDatabases.updateDocument).toHaveBeenCalledOnce();
                expect(mockDatabases.updateDocument).toHaveBeenCalledWith(
                    APPWRITE_DATABASE_ID,
                    IMESSAGE_CONVERSATIONS_COLLECTION_ID,
                    mockConversationDocId,
                    updateData
                );
            });
        });

        describe('Update Message', () => {
            it('should call updateDocument with correct parameters and return the updated document', async () => {
                const documentIdToUpdate = 'msgDocToUpdate123';
                const updateData: UpdateIMessageMessageData = {
                    content: 'Updated message content',
                    isEdited: true
                };
                // Simulate the full data of the document as it would be after the update
                const mockUpdatedMessageFullData: CreateIMessageMessageData = {
                    conversationId: 'convOriginalMsg',
                    messageId: 'msgOriginal',
                    participantDocId: 'partOrig',
                    content: updateData.content!,
                    timestamp: new Date().toISOString(), // Original timestamp typically doesn't change on content edit
                    isEdited: updateData.isEdited!,
                    screenshotIndex: 0 // Original index
                };
                const mockReturnedUpdatedDoc: Models.Document = {
                    $id: documentIdToUpdate,
                    $collectionId: IMESSAGE_MESSAGES_COLLECTION_ID,
                    $databaseId: APPWRITE_DATABASE_ID,
                    $createdAt: new Date().toISOString(),
                    $updatedAt: new Date().toISOString(),
                    $permissions: [],
                    ...mockUpdatedMessageFullData
                };

                mockUpdateDocument.mockResolvedValue(mockReturnedUpdatedDoc);

                const updatedDoc = await updateIMessageMessage(
                    mockDatabases,
                    documentIdToUpdate,
                    updateData
                );

                expect(mockDatabases.updateDocument).toHaveBeenCalledOnce();
                expect(mockDatabases.updateDocument).toHaveBeenCalledWith(
                    APPWRITE_DATABASE_ID,
                    IMESSAGE_MESSAGES_COLLECTION_ID,
                    documentIdToUpdate,
                    updateData
                );
                expect(updatedDoc).toEqual(mockReturnedUpdatedDoc);
            });

            it('should re-throw errors from Appwrite updateDocument when updating a message', async () => {
                const documentIdToUpdate = 'msgDocToUpdateError';
                const updateData: UpdateIMessageMessageData = {
                    content: 'Error message update'
                }; // Use minimal data
                const mockError = new Error('Appwrite updateDocument error');

                // Mock the updateDocument method to reject with an error
                mockUpdateDocument.mockRejectedValue(mockError);

                // Expect the utility function call to reject with the same error
                await expect(
                    updateIMessageMessage(mockDatabases, documentIdToUpdate, updateData)
                ).rejects.toThrow(mockError);

                // Optionally, verify that updateDocument was still called
                expect(mockDatabases.updateDocument).toHaveBeenCalledOnce();
                expect(mockDatabases.updateDocument).toHaveBeenCalledWith(
                    APPWRITE_DATABASE_ID,
                    IMESSAGE_MESSAGES_COLLECTION_ID,
                    documentIdToUpdate,
                    updateData
                );
            });
        });

        describe('Update Participant', () => {
            it('should call updateDocument with correct parameters and return the updated document', async () => {
                const documentIdToUpdate = 'partDocToUpdate456';
                const updateData: UpdateIMessageParticipantData = {
                    name: 'Updated Participant Name', // Example partial update
                    avatarFileId: 'newAvatarFile789'
                };
                // Simulate the full data of the document as it would be after the update
                const mockUpdatedParticipantFullData: CreateIMessageParticipantData = {
                    userId: 'userOriginal', // Assume original user ID remains
                    name: updateData.name!,
                    avatarFileId: updateData.avatarFileId!
                };
                const mockReturnedUpdatedDoc: Models.Document = {
                    $id: documentIdToUpdate,
                    $collectionId: IMESSAGE_PARTICIPANTS_COLLECTION_ID,
                    $databaseId: APPWRITE_DATABASE_ID,
                    $createdAt: new Date().toISOString(), // Assume original creation time
                    $updatedAt: new Date().toISOString(), // New update time
                    $permissions: [],
                    ...mockUpdatedParticipantFullData
                };

                mockUpdateDocument.mockResolvedValue(mockReturnedUpdatedDoc);

                const updatedDoc = await updateIMessageParticipant(
                    mockDatabases,
                    documentIdToUpdate,
                    updateData
                );

                expect(mockDatabases.updateDocument).toHaveBeenCalledOnce();
                expect(mockDatabases.updateDocument).toHaveBeenCalledWith(
                    APPWRITE_DATABASE_ID,
                    IMESSAGE_PARTICIPANTS_COLLECTION_ID,
                    documentIdToUpdate,
                    updateData
                );
                expect(updatedDoc).toEqual(mockReturnedUpdatedDoc);
            });

            it('should re-throw errors from Appwrite updateDocument when updating a participant', async () => {
                const documentIdToUpdate = 'partDocToUpdateError';
                const updateData: UpdateIMessageParticipantData = {
                    name: 'Error Participant Update'
                }; // Use minimal data
                const mockError = new Error('Appwrite updateDocument error');

                // Mock the updateDocument method to reject with an error
                mockUpdateDocument.mockRejectedValue(mockError);

                // Expect the utility function call to reject with the same error
                await expect(
                    updateIMessageParticipant(mockDatabases, documentIdToUpdate, updateData)
                ).rejects.toThrow(mockError);

                // Optionally, verify that updateDocument was still called
                expect(mockDatabases.updateDocument).toHaveBeenCalledOnce();
                expect(mockDatabases.updateDocument).toHaveBeenCalledWith(
                    APPWRITE_DATABASE_ID,
                    IMESSAGE_PARTICIPANTS_COLLECTION_ID,
                    documentIdToUpdate,
                    updateData
                );
            });
        });
    });

    describe('Deleting', () => {
        describe('Conversation Deletion', () => {
            it('should call deleteDocument with correct parameters when deleting an iMessage conversation', async () => {
                const conversationDocIdToDelete = 'docConvToDelete123';

                await deleteIMessageConversation(mockDatabases, conversationDocIdToDelete);

                expect(mockDatabases.deleteDocument).toHaveBeenCalledOnce();
                expect(mockDatabases.deleteDocument).toHaveBeenCalledWith(
                    APPWRITE_DATABASE_ID,
                    IMESSAGE_CONVERSATIONS_COLLECTION_ID,
                    conversationDocIdToDelete
                );
            });

            it('should re-throw errors from Appwrite deleteDocument when deleting a conversation', async () => {
                const documentIdToDelete = 'convDocToDeleteError';
                const mockError = new Error('Appwrite deleteDocument error');

                // Mock the deleteDocument method to reject with an error
                mockDeleteDocument.mockRejectedValue(mockError);

                // Expect the utility function call to reject with the same error
                await expect(
                    deleteIMessageConversation(mockDatabases, documentIdToDelete)
                ).rejects.toThrow(mockError);

                // Optionally, verify that deleteDocument was still called
                expect(mockDatabases.deleteDocument).toHaveBeenCalledOnce();
                expect(mockDatabases.deleteDocument).toHaveBeenCalledWith(
                    APPWRITE_DATABASE_ID,
                    IMESSAGE_CONVERSATIONS_COLLECTION_ID,
                    documentIdToDelete
                );
            });
        });

        describe('Message Deletion', () => {
            it('should call deleteDocument with correct parameters when deleting an iMessage message', async () => {
                const messageDocIdToDelete = 'docMsgToDelete456';

                await deleteIMessageMessage(mockDatabases, messageDocIdToDelete);

                expect(mockDatabases.deleteDocument).toHaveBeenCalledOnce();
                expect(mockDatabases.deleteDocument).toHaveBeenCalledWith(
                    APPWRITE_DATABASE_ID,
                    IMESSAGE_MESSAGES_COLLECTION_ID,
                    messageDocIdToDelete
                );
            });

            it('should re-throw errors from Appwrite deleteDocument when deleting a message', async () => {
                const documentIdToDelete = 'msgDocToDeleteError';
                const mockError = new Error('Appwrite deleteDocument error');

                // Mock the deleteDocument method to reject with an error
                mockDeleteDocument.mockRejectedValue(mockError);

                // Expect the utility function call to reject with the same error
                await expect(
                    deleteIMessageMessage(mockDatabases, documentIdToDelete)
                ).rejects.toThrow(mockError);

                // Optionally, verify that deleteDocument was still called
                expect(mockDatabases.deleteDocument).toHaveBeenCalledOnce();
                expect(mockDatabases.deleteDocument).toHaveBeenCalledWith(
                    APPWRITE_DATABASE_ID,
                    IMESSAGE_MESSAGES_COLLECTION_ID,
                    documentIdToDelete
                );
            });
        });

        describe('Participant Deletion', () => {
            it('should call deleteDocument with correct parameters when deleting an iMessage participant', async () => {
                const participantDocIdToDelete = 'docPartToDelete789';

                await deleteIMessageParticipant(mockDatabases, participantDocIdToDelete);

                expect(mockDatabases.deleteDocument).toHaveBeenCalledOnce();
                expect(mockDatabases.deleteDocument).toHaveBeenCalledWith(
                    APPWRITE_DATABASE_ID,
                    IMESSAGE_PARTICIPANTS_COLLECTION_ID,
                    participantDocIdToDelete
                );
            });

            it('should re-throw errors from Appwrite deleteDocument when deleting a participant', async () => {
                const documentIdToDelete = 'partDocToDeleteError';
                const mockError = new Error('Appwrite deleteDocument error');

                // Mock the deleteDocument method to reject with an error
                mockDeleteDocument.mockRejectedValue(mockError);

                // Expect the utility function call to reject with the same error
                await expect(
                    deleteIMessageParticipant(mockDatabases, documentIdToDelete)
                ).rejects.toThrow(mockError);

                // Optionally, verify that deleteDocument was still called
                expect(mockDatabases.deleteDocument).toHaveBeenCalledOnce();
                expect(mockDatabases.deleteDocument).toHaveBeenCalledWith(
                    APPWRITE_DATABASE_ID,
                    IMESSAGE_PARTICIPANTS_COLLECTION_ID,
                    documentIdToDelete
                );
            });
        });
    });
});
