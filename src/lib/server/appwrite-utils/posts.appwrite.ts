import type { Databases, Models } from 'node-appwrite';
import { DATABASE_ID, POSTS_COLLECTION_ID } from '$lib/server/model.const.js';

export interface RequiredPostDocument {
    postId: string;
    userId: string;
    type: 'textPost' | 'imagePost' | 'status'; // Add other valid post types
    tags?: string[];
    likesCount?: number;
    commentsCount?: number;
    status: 'published' | 'draft' | 'archived';
    accessLevel: 'public' | 'followers' | 'private' | 'mutuals' | 'unlisted' | 'team'; // Define access levels
    contentRefId: string;
}

export type PostDocument = Models.Document & RequiredPostDocument;
/**
 * Creates a generic Post document in Appwrite.
 * @param databases Instance of Appwrite Databases service.
 * @param data Data for the new post.
 * @param permissions Optional document-level permissions.
 * @returns The created Appwrite document.
 */
export async function createPost(
    databases: Databases,
    data: RequiredPostDocument,
    permissions?: string[]
): Promise<PostDocument> {
    const { postId, ...rest } = data;
    try {
        const document = await databases.createDocument(
            DATABASE_ID,
            POSTS_COLLECTION_ID,
            postId,
            rest,
            permissions ?? []
        );
        return document as PostDocument;
    } catch (error) {
        console.error('Error creating Post document:', error);
        throw error;
    }
}

/**
 * Updates a generic Post document in Appwrite.
 * @param databases Instance of Appwrite Databases service.
 * @param documentId The ID of the post document to update.
 * @param data Partial data containing fields to update.
 * @param permissions Optional document-level permissions (usually not changed on update, but possible).
 * @returns The updated Appwrite document.
 */
export async function updatePost(
    databases: Databases,
    documentId: string,
    data: RequiredPostDocument,
    permissions?: string[] // Typically permissions aren't updated like this, but included for flexibility
): Promise<PostDocument> {
    try {
        // If permissions are provided, it implies wanting to update them.
        // Otherwise, pass undefined so Appwrite doesn't attempt to clear them.
        const document = await databases.updateDocument(
            DATABASE_ID,
            POSTS_COLLECTION_ID,
            documentId,
            data,
            permissions // Pass permissions if provided, otherwise undefined
        );
        return document as PostDocument;
    } catch (error) {
        console.error(`Error updating Post document ${documentId}:`, error);
        throw error;
    }
}

/**
 * Fetches a Post document by its Appwrite document ID.
 * @param databases Instance of Appwrite Databases service.
 * @param documentId The Appwrite document ID of the post.
 * @returns The fetched Appwrite document.
 */
export async function getPostById(
    databases: Databases,
    documentId: string
): Promise<PostDocument | null> {
    try {
        const document = await databases.getDocument(DATABASE_ID, POSTS_COLLECTION_ID, documentId);
        return document as PostDocument;
    } catch (error) {
        // Appwrite throws an error if document not found
        // Check if error is an AppwriteException-like object with a code property
        if (
            typeof error === 'object' &&
            error !== null &&
            'code' in error &&
            (error as { code: unknown }).code === 404
        ) {
            return null;
        }
        console.error(`Error fetching Post by ID ${documentId}:`, error);
        throw error;
    }
}
