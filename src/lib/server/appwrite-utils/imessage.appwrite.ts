import { ID, Query } from 'node-appwrite';
import type { Models } from 'node-appwrite';
import {
    DATABASE_ID,
    IMESSAGE_CONVERSATION_COLLECTION_ID,
    IMESSAGE_MESSAGES_COLLECTION_ID,
    IMESSAGE_PARTICIPANTS_COLLECTION_ID
} from '$lib/server/model.const.js';
import type { Databases } from 'node-appwrite';
import type {
    ImessageConversation,
    ImessageMessages,
    ImessageParticipants
} from '$root/lib/types/appwrite';

/**
 * Creates an iMessage conversation document in Appwrite.
 * @param appwriteDatabases Instance of AppwriteDatabasesClient.
 * @param data Data for the new conversation.
 * @returns The created Appwrite document.
 */
export async function createIMessageConversation(
    appwriteDatabases: Databases,
    data: ImessageConversation,
    permissions?: string[]
): Promise<Models.Document> {
    try {
        const document = await appwriteDatabases.createDocument(
            DATABASE_ID,
            IMESSAGE_CONVERSATION_COLLECTION_ID,
            ID.unique(), // Appwrite generates the document ID
            data,
            permissions
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
    appwriteDatabases: Databases,
    data: ImessageMessages,
    permissions?: string[]
): Promise<Models.Document> {
    try {
        const document = await appwriteDatabases.createDocument(
            DATABASE_ID,
            IMESSAGE_MESSAGES_COLLECTION_ID,
            ID.unique(),
            data,
            permissions
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
    appwriteDatabases: Databases,
    data: ImessageParticipants,
    permissions?: string[]
): Promise<Models.Document> {
    try {
        const document = await appwriteDatabases.createDocument(
            DATABASE_ID,
            IMESSAGE_PARTICIPANTS_COLLECTION_ID,
            ID.unique(),
            data,
            permissions
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
    appwriteDatabases: Databases,
    conversationDocumentId: string,
    permissions?: string[]
): Promise<Models.Document> {
    try {
        const document = await appwriteDatabases.getDocument(
            DATABASE_ID,
            IMESSAGE_CONVERSATION_COLLECTION_ID,
            conversationDocumentId,
            permissions
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
    appwriteDatabases: Databases,
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
            DATABASE_ID,
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
    appwriteDatabases: Databases,
    participantDocumentIds: string[],
    permissions?: string[]
): Promise<Models.Document[]> {
    try {
        // Fetch each participant document individually and await all promises
        const participantPromises = participantDocumentIds.map((id) =>
            appwriteDatabases.getDocument(
                DATABASE_ID,
                IMESSAGE_PARTICIPANTS_COLLECTION_ID,
                id,
                permissions
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
    appwriteDatabases: Databases,
    documentId: string,
    data: ImessageParticipants
): Promise<Models.Document> {
    try {
        const document = await appwriteDatabases.updateDocument(
            DATABASE_ID,
            IMESSAGE_CONVERSATION_COLLECTION_ID,
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
    appwriteDatabases: Databases,
    documentId: string
): Promise<void> {
    try {
        await appwriteDatabases.deleteDocument(
            DATABASE_ID,
            IMESSAGE_CONVERSATION_COLLECTION_ID,
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
    appwriteDatabases: Databases,
    documentId: string,
    data: ImessageMessages
): Promise<Models.Document> {
    try {
        const document = await appwriteDatabases.updateDocument(
            DATABASE_ID,
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
    appwriteDatabases: Databases,
    documentId: string
): Promise<void> {
    try {
        await appwriteDatabases.deleteDocument(
            DATABASE_ID,
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
    appwriteDatabases: Databases,
    documentId: string,
    data: ImessageParticipants
): Promise<Models.Document> {
    try {
        const document = await appwriteDatabases.updateDocument(
            DATABASE_ID,
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
    appwriteDatabases: Databases,
    documentId: string
): Promise<void> {
    try {
        await appwriteDatabases.deleteDocument(
            DATABASE_ID,
            IMESSAGE_PARTICIPANTS_COLLECTION_ID,
            documentId
        );
    } catch (error) {
        console.error(`Error deleting iMessage participant ${documentId}:`, error);
        throw error;
    }
}
