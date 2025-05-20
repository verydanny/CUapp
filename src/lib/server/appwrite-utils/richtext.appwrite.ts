import { ID } from 'node-appwrite';
import type { Models, Databases } from 'node-appwrite';
import { DATABASE_ID, RICH_TEXT_POSTS_COLLECTION_ID } from '$env/static/private';

// --- Data Transfer Object (DTO) Interfaces for RichTextPost Operations ---

// Describes the data structure required when creating a new RichTextPost document.
export interface CreateRichTextPostData {
    postId: string;
    title: string;
    body: string;
    excerpt?: string;
    coverImageFileId?: string;
    coverImageUrl?: string;
    coverImageAltText?: string;
    version?: number;
    estimatedReadTimeMinutes?: number;
    contentSchemaVersion?: string;
}

// For updates, all fields are optional.
export type UpdateRichTextPostData = Partial<CreateRichTextPostData>;

// Generic type for Appwrite document data for RichTextPost.

// --- Appwrite Configuration Constants ---
// Values are now imported directly from $env/static/private at the top of the file.

// --- CRUD Functions for RichTextPost Entities ---

/**
 * Creates a RichTextPost document in Appwrite.
 * @param appwriteDatabases Instance of AppwriteDatabasesClient.
 * @param data Data for the new rich text post.
 * @returns The created Appwrite document.
 */
export async function createRichTextPost(
    appwriteDatabases: Databases,
    data: CreateRichTextPostData,
    permissions?: string[]
): Promise<Models.Document> {
    try {
        const document = await appwriteDatabases.createDocument(
            DATABASE_ID,
            RICH_TEXT_POSTS_COLLECTION_ID,
            ID.unique(), // Appwrite generates the document ID
            data,
            permissions ?? []
        );
        return document;
    } catch (error) {
        console.error('Error creating RichTextPost document:', error);
        throw error;
    }
}

/**
 * Fetches a RichTextPost document by its Appwrite document ID.
 * @param appwriteDatabases Instance of AppwriteDatabasesClient.
 * @param documentId The Appwrite document ID of the rich text post.
 * @returns The fetched Appwrite document.
 */
export async function getRichTextPostById(
    appwriteDatabases: Databases,
    documentId: string
): Promise<Models.Document> {
    try {
        const document = await appwriteDatabases.getDocument(
            DATABASE_ID,
            RICH_TEXT_POSTS_COLLECTION_ID,
            documentId
        );
        return document;
    } catch (error) {
        console.error(`Error fetching RichTextPost by ID ${documentId}:`, error);
        throw error;
    }
}

/**
 * Updates a RichTextPost document in Appwrite.
 * @param appwriteDatabases Instance of AppwriteDatabasesClient.
 * @param documentId The Appwrite document ID of the rich text post to update.
 * @param data Partial data containing fields to update.
 * @returns The updated Appwrite document.
 */
export async function updateRichTextPost(
    appwriteDatabases: Databases,
    documentId: string,
    data: UpdateRichTextPostData,
    permissions?: string[]
): Promise<Models.Document> {
    try {
        const document = await appwriteDatabases.updateDocument(
            DATABASE_ID,
            RICH_TEXT_POSTS_COLLECTION_ID,
            documentId,
            data,
            permissions ?? []
        );
        return document;
    } catch (error) {
        console.error(`Error updating RichTextPost ${documentId}:`, error);
        throw error;
    }
}

/**
 * Deletes a RichTextPost document from Appwrite.
 * @param appwriteDatabases Instance of AppwriteDatabasesClient.
 * @param documentId The Appwrite document ID of the rich text post to delete.
 */
export async function deleteRichTextPost(
    appwriteDatabases: Databases,
    documentId: string
): Promise<void> {
    try {
        await appwriteDatabases.deleteDocument(
            DATABASE_ID,
            RICH_TEXT_POSTS_COLLECTION_ID,
            documentId
        );
    } catch (error) {
        console.error(`Error deleting RichTextPost ${documentId}:`, error);
        throw error;
    }
}
