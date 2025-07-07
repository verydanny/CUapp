import type { Databases } from 'node-appwrite';
import { DATABASE_ID, POSTS_COLLECTION_ID } from '$lib/server/model.const.js';
import type { Posts } from '$root/lib/types/appwrite';
import type { WithoutDocument } from '$root/lib/types/appwrite-types-utils';
/**
 * Creates a generic Post document in Appwrite.
 * @param databases Instance of Appwrite Databases service.
 * @param data Data for the new post.
 * @param permissions Optional document-level permissions.
 * @returns The created Appwrite document.
 */

export async function createPost(
    databases: Databases,
    data: WithoutDocument<Posts> & { postId: string },
    permissions?: string[]
): Promise<Posts> {
    const { postId, ...rest } = data;

    console.log('data', data);
    try {
        const document = await databases.createDocument(
            DATABASE_ID,
            POSTS_COLLECTION_ID,
            postId,
            rest,
            permissions ?? []
        );
        return document as Posts;
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
    data: Posts,
    permissions?: string[] // Typically permissions aren't updated like this, but included for flexibility
): Promise<Posts> {
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
        return document as Posts;
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
export async function getPostById(databases: Databases, documentId: string): Promise<Posts | null> {
    try {
        const document = await databases.getDocument(DATABASE_ID, POSTS_COLLECTION_ID, documentId);
        return document as Posts;
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
