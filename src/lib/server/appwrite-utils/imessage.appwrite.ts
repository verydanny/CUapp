import { ID, Query } from 'appwrite';
import type { Models } from 'appwrite';
import {
    APPWRITE_DATABASE_ID,
    IMESSAGE_CONVERSATIONS_COLLECTION_ID,
    IMESSAGE_MESSAGES_COLLECTION_ID,
    IMESSAGE_PARTICIPANTS_COLLECTION_ID
} from '$env/static/private';

// --- Data Transfer Object (DTO) Interfaces for Appwrite Operations ---

// Describes the data structure required when creating a new iMessage conversation document.
export interface CreateIMessageConversationData {
    conversationId: string; // Unique logical ID for the conversation
    participantDocRefs: string[]; // Array of Appwrite document IDs for participants
    rightSideParticipantDocRef: string; // Appwrite document ID of the participant on the right
    screenshotMessageIds: string[]; // Array of `messageId`s (from iMessageMessage) for ordering
    totalScreenshots: number; // Count of messages/screenshots
    postId: string; // ID of a related parent post/entity
}

// For updates, all fields are optional.
export type UpdateIMessageConversationData = Partial<CreateIMessageConversationData>;

// Describes the data structure for creating a new iMessage message document.
export interface CreateIMessageMessageData {
    conversationId: string; // Links to iMessageConversation.conversationId
    messageId: string; // Unique identifier for this message within the conversation
    participantDocId: string; // Appwrite document ID of the sender (iMessageParticipant)
    content: string; // Textual content or caption for images
    timestamp: string; // ISO 8601 datetime string of when the message was created/sent
    timestampDisplay?: string; // Optional pre-formatted display string for the timestamp
    isEdited: boolean; // Flag if the message has been edited
    screenshotIndex: number; // Zero-based index for ordering from a screenshot
    deliveryStatus?: 'sent' | 'delivered' | 'read'; // Delivery status
    messageType?: 'text' | 'image'; // Type of message, defaults to 'text'
    imageUrl?: string; // URL for image messages (if externally hosted)
    imageFileId?: string; // Appwrite File ID for image messages (if in Appwrite Storage)
    imageAltText?: string; // Alt text for image messages
}

// For updates, all fields are optional.
export type UpdateIMessageMessageData = Partial<CreateIMessageMessageData>;

// Describes the data structure for creating a new iMessage participant document.
export interface CreateIMessageParticipantData {
    userId: string; // User identifier (e.g., Appwrite User ID)
    name: string; // Display name of the participant
    avatarFileId?: string; // Optional Appwrite File ID for the avatar
}

// For updates, all fields are optional.
export type UpdateIMessageParticipantData = Partial<CreateIMessageParticipantData>;

// Generic type for Appwrite document data, accommodating all iMessage entity types and updates.
// Using Record<string, unknown> for broader compatibility than `any`.
type AppwriteDocumentData =
    | CreateIMessageConversationData
    | CreateIMessageMessageData
    | CreateIMessageParticipantData
    | UpdateIMessageConversationData
    | UpdateIMessageMessageData
    | UpdateIMessageParticipantData
    | Record<string, unknown>;

/**
 * Interface defining the expected structure of an Appwrite Databases client.
 * This allows for type-safe interaction with the Appwrite SDK's database methods.
 * Only includes methods currently used by this utility module.
 */
export interface AppwriteDatabasesClient {
    createDocument: (
        databaseId: string,
        collectionId: string,
        documentId: string, // Use ID.unique() for auto-generation by Appwrite
        data: AppwriteDocumentData
    ) => Promise<Models.Document>;
    getDocument: (
        databaseId: string,
        collectionId: string,
        documentId: string
    ) => Promise<Models.Document>;
    listDocuments: (
        databaseId: string,
        collectionId: string,
        queries?: string[] // Optional array of Appwrite query strings
    ) => Promise<Models.DocumentList<Models.Document>>;
    updateDocument: (
        databaseId: string,
        collectionId: string,
        documentId: string,
        data: AppwriteDocumentData // Can be partial data for updates
    ) => Promise<Models.Document>;
    deleteDocument: (
        databaseId: string,
        collectionId: string,
        documentId: string
    ) => Promise<unknown>; // Appwrite delete typically returns an empty response or throws
}

// --- CRUD Functions for iMessage Entities ---

/**
 * Creates an iMessage conversation document in Appwrite.
 * @param appwriteDatabases Instance of AppwriteDatabasesClient.
 * @param data Data for the new conversation.
 * @returns The created Appwrite document.
 */
export async function createIMessageConversation(
    appwriteDatabases: AppwriteDatabasesClient,
    data: CreateIMessageConversationData
): Promise<Models.Document> {
    try {
        const document = await appwriteDatabases.createDocument(
            APPWRITE_DATABASE_ID,
            IMESSAGE_CONVERSATIONS_COLLECTION_ID,
            ID.unique(), // Appwrite generates the document ID
            data
        );
        return document;
    } catch (error) {
        // Log server-side error and re-throw for the caller to handle
        console.error('Error creating iMessage conversation document:', error);
        throw error;
    }
}

/**
 * Creates an iMessage message document in Appwrite.
 * @param appwriteDatabases Instance of AppwriteDatabasesClient.
 * @param data Data for the new message.
 * @returns The created Appwrite document.
 */
export async function createIMessageMessage(
    appwriteDatabases: AppwriteDatabasesClient,
    data: CreateIMessageMessageData
): Promise<Models.Document> {
    try {
        const document = await appwriteDatabases.createDocument(
            APPWRITE_DATABASE_ID,
            IMESSAGE_MESSAGES_COLLECTION_ID,
            ID.unique(),
            data
        );
        return document;
    } catch (error) {
        console.error('Error creating iMessage message document:', error);
        throw error;
    }
}

/**
 * Creates an iMessage participant document in Appwrite.
 * @param appwriteDatabases Instance of AppwriteDatabasesClient.
 * @param data Data for the new participant.
 * @returns The created Appwrite document.
 */
export async function createIMessageParticipant(
    appwriteDatabases: AppwriteDatabasesClient,
    data: CreateIMessageParticipantData
): Promise<Models.Document> {
    try {
        const document = await appwriteDatabases.createDocument(
            APPWRITE_DATABASE_ID,
            IMESSAGE_PARTICIPANTS_COLLECTION_ID,
            ID.unique(),
            data
        );
        return document;
    } catch (error) {
        console.error('Error creating iMessage participant document:', error);
        throw error;
    }
}

/**
 * Fetches an iMessage conversation document by its Appwrite document ID.
 * @param appwriteDatabases Instance of AppwriteDatabasesClient.
 * @param conversationDocumentId The Appwrite document ID of the conversation.
 * @returns The fetched Appwrite document.
 */
export async function getIMessageConversationById(
    appwriteDatabases: AppwriteDatabasesClient,
    conversationDocumentId: string
): Promise<Models.Document> {
    try {
        const document = await appwriteDatabases.getDocument(
            APPWRITE_DATABASE_ID,
            IMESSAGE_CONVERSATIONS_COLLECTION_ID,
            conversationDocumentId
        );
        return document;
    } catch (error) {
        console.error(
            `Error fetching iMessage conversation by ID ${conversationDocumentId}:`,
            error
        );
        throw error;
    }
}

/**
 * Fetches all iMessage message documents belonging to a specific conversation logical ID.
 * @param appwriteDatabases Instance of AppwriteDatabasesClient.
 * @param conversationId The logical `conversationId` (not the Appwrite document ID of the conversation).
 * @param queries Optional array of additional Appwrite query strings (e.g., for ordering, pagination).
 * @param limit Optional limit for pagination.
 * @param offset Optional offset for pagination.
 * @returns A list of Appwrite documents representing the messages.
 */
export async function getIMessageMessagesByConversationId(
    appwriteDatabases: AppwriteDatabasesClient,
    conversationId: string,
    queries: string[] = [],
    limit?: number,
    offset?: number
): Promise<Models.DocumentList<Models.Document>> {
    try {
        // Base query to filter by the logical conversationId field
        const effectiveQueries = [
            Query.equal('conversationId', conversationId),
            ...queries // Spread any additional queries (e.g., for ordering by screenshotIndex)
        ];

        if (limit !== undefined) {
            effectiveQueries.push(Query.limit(limit));
        }

        if (offset !== undefined) {
            effectiveQueries.push(Query.offset(offset));
        }

        const documentList = await appwriteDatabases.listDocuments(
            APPWRITE_DATABASE_ID,
            IMESSAGE_MESSAGES_COLLECTION_ID,
            effectiveQueries
        );
        return documentList;
    } catch (error) {
        console.error(
            `Error fetching iMessage messages for conversation ID ${conversationId}:`,
            error
        );
        throw error;
    }
}

/**
 * Fetches multiple iMessage participant documents by their Appwrite document IDs.
 * @param appwriteDatabases Instance of AppwriteDatabasesClient.
 * @param participantDocumentIds Array of Appwrite document IDs for the participants.
 * @returns An array of fetched Appwrite documents.
 */
export async function getIMessageParticipantsByIds(
    appwriteDatabases: AppwriteDatabasesClient,
    participantDocumentIds: string[]
): Promise<Models.Document[]> {
    try {
        // Fetch each participant document individually and await all promises
        const participantPromises = participantDocumentIds.map((id) =>
            appwriteDatabases.getDocument(
                APPWRITE_DATABASE_ID,
                IMESSAGE_PARTICIPANTS_COLLECTION_ID,
                id
            )
        );
        const participants = await Promise.all(participantPromises);
        return participants;
    } catch (error) {
        console.error('Error fetching iMessage participants by IDs:', error);
        throw error;
    }
}

/**
 * Updates an iMessage conversation document in Appwrite.
 * @param appwriteDatabases Instance of AppwriteDatabasesClient.
 * @param documentId The Appwrite document ID of the conversation to update.
 * @param data Partial data containing fields to update.
 * @returns The updated Appwrite document.
 */
export async function updateIMessageConversation(
    appwriteDatabases: AppwriteDatabasesClient,
    documentId: string,
    data: UpdateIMessageConversationData
): Promise<Models.Document> {
    try {
        const document = await appwriteDatabases.updateDocument(
            APPWRITE_DATABASE_ID,
            IMESSAGE_CONVERSATIONS_COLLECTION_ID,
            documentId,
            data
        );
        return document;
    } catch (error) {
        console.error(`Error updating iMessage conversation ${documentId}:`, error);
        throw error;
    }
}

/**
 * Deletes an iMessage conversation document from Appwrite.
 * @param appwriteDatabases Instance of AppwriteDatabasesClient.
 * @param documentId The Appwrite document ID of the conversation to delete.
 */
export async function deleteIMessageConversation(
    appwriteDatabases: AppwriteDatabasesClient,
    documentId: string
): Promise<void> {
    try {
        await appwriteDatabases.deleteDocument(
            APPWRITE_DATABASE_ID,
            IMESSAGE_CONVERSATIONS_COLLECTION_ID,
            documentId
        );
    } catch (error) {
        console.error(`Error deleting iMessage conversation ${documentId}:`, error);
        throw error;
    }
}

/**
 * Updates an iMessage message document in Appwrite.
 * @param appwriteDatabases Instance of AppwriteDatabasesClient.
 * @param documentId The Appwrite document ID of the message to update.
 * @param data Partial data containing fields to update.
 * @returns The updated Appwrite document.
 */
export async function updateIMessageMessage(
    appwriteDatabases: AppwriteDatabasesClient,
    documentId: string,
    data: UpdateIMessageMessageData
): Promise<Models.Document> {
    try {
        const document = await appwriteDatabases.updateDocument(
            APPWRITE_DATABASE_ID,
            IMESSAGE_MESSAGES_COLLECTION_ID,
            documentId,
            data
        );
        return document;
    } catch (error) {
        console.error(`Error updating iMessage message ${documentId}:`, error);
        throw error;
    }
}

/**
 * Deletes an iMessage message document from Appwrite.
 * @param appwriteDatabases Instance of AppwriteDatabasesClient.
 * @param documentId The Appwrite document ID of the message to delete.
 */
export async function deleteIMessageMessage(
    appwriteDatabases: AppwriteDatabasesClient,
    documentId: string
): Promise<void> {
    try {
        await appwriteDatabases.deleteDocument(
            APPWRITE_DATABASE_ID,
            IMESSAGE_MESSAGES_COLLECTION_ID,
            documentId
        );
    } catch (error) {
        console.error(`Error deleting iMessage message ${documentId}:`, error);
        throw error;
    }
}

/**
 * Updates an iMessage participant document in Appwrite.
 * @param appwriteDatabases Instance of AppwriteDatabasesClient.
 * @param documentId The Appwrite document ID of the participant to update.
 * @param data Partial data containing fields to update.
 * @returns The updated Appwrite document.
 */
export async function updateIMessageParticipant(
    appwriteDatabases: AppwriteDatabasesClient,
    documentId: string,
    data: UpdateIMessageParticipantData
): Promise<Models.Document> {
    try {
        const document = await appwriteDatabases.updateDocument(
            APPWRITE_DATABASE_ID,
            IMESSAGE_PARTICIPANTS_COLLECTION_ID,
            documentId,
            data
        );
        return document;
    } catch (error) {
        console.error(`Error updating iMessage participant ${documentId}:`, error);
        throw error;
    }
}

/**
 * Deletes an iMessage participant document from Appwrite.
 * @param appwriteDatabases Instance of AppwriteDatabasesClient.
 * @param documentId The Appwrite document ID of the participant to delete.
 */
export async function deleteIMessageParticipant(
    appwriteDatabases: AppwriteDatabasesClient,
    documentId: string
): Promise<void> {
    try {
        await appwriteDatabases.deleteDocument(
            APPWRITE_DATABASE_ID,
            IMESSAGE_PARTICIPANTS_COLLECTION_ID,
            documentId
        );
    } catch (error) {
        console.error(`Error deleting iMessage participant ${documentId}:`, error);
        throw error;
    }
}
