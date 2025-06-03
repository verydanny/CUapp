import { ID } from 'node-appwrite';
import type { Models, Databases } from 'node-appwrite';
import { DATABASE_ID, RICH_TEXT_POST_COLLECTION_ID } from '$lib/server/model.const.js';
import type { TextPostType } from '$root/lib/types/appwrite';

// --- Data Transfer Object (DTO) Interfaces for textPost Operations ---

// Describes the data structure required when creating a new textPost document.

// For updates, all fields are optional.

// Generic type for Appwrite document data for textPost.

// --- Appwrite Configuration Constants ---
// Values are now imported directly from $env/static/private at the top of the file.

// --- CRUD Functions for textPost Entities ---

/**
 * Creates a textPost document in Appwrite.
 * @param appwriteDatabases Instance of AppwriteDatabasesClient.
 * @param data Data for the new rich text post.
 * @returns The created Appwrite document.
 */
export async function createtextPost(
    appwriteDatabases: Databases,
    data: TextPostType & { $id?: string },
    permissions?: string[]
): Promise<Models.Document> {
    const id = data?.$id ?? ID.unique();

    try {
        const document = await appwriteDatabases.createDocument(
            DATABASE_ID,
            RICH_TEXT_POST_COLLECTION_ID,
            id,
            data,
            permissions ?? []
        );
        return document;
    } catch (error) {
        console.error('Error creating textPost document:', error);
        throw error;
    }
}

/**
 * Fetches a textPost document by its Appwrite document ID.
 * @param appwriteDatabases Instance of AppwriteDatabasesClient.
 * @param documentId The Appwrite document ID of the rich text post.
 * @returns The fetched Appwrite document.
 */
export async function gettextPostById(
    appwriteDatabases: Databases,
    documentId: string
): Promise<Models.Document> {
    try {
        const document = await appwriteDatabases.getDocument(
            DATABASE_ID,
            RICH_TEXT_POST_COLLECTION_ID,
            documentId
        );
        return document;
    } catch (error) {
        console.error(`Error fetching textPost by ID ${documentId}:`, error);
        throw error;
    }
}

/**
 * Updates a textPost document in Appwrite.
 * @param appwriteDatabases Instance of AppwriteDatabasesClient.
 * @param documentId The Appwrite document ID of the rich text post to update.
 * @param data Partial data containing fields to update.
 * @returns The updated Appwrite document.
 */
export async function updatetextPost(
    appwriteDatabases: Databases,
    documentId: string,
    data: Partial<TextPostType> & { $id?: string },
    permissions?: string[]
): Promise<Models.Document> {
    try {
        const document = await appwriteDatabases.updateDocument(
            DATABASE_ID,
            RICH_TEXT_POST_COLLECTION_ID,
            documentId,
            data,
            permissions ?? []
        );
        return document;
    } catch (error) {
        console.error(`Error updating textPost ${documentId}:`, error);
        throw error;
    }
}

/**
 * Deletes a textPost document from Appwrite.
 * @param appwriteDatabases Instance of AppwriteDatabasesClient.
 * @param documentId The Appwrite document ID of the rich text post to delete.
 */
export async function deletetextPost(
    appwriteDatabases: Databases,
    documentId: string
): Promise<void> {
    try {
        await appwriteDatabases.deleteDocument(
            DATABASE_ID,
            RICH_TEXT_POST_COLLECTION_ID,
            documentId
        );
    } catch (error) {
        console.error(`Error deleting textPost ${documentId}:`, error);
        throw error;
    }
}
