import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { createUserSessionClient } from '$lib/server/appwrite-utils/appwrite.js';
import {
    updatePost,
    getPostById,
    type RequiredPostDocument
    // type PostDocument // Not strictly needed for PATCH if only returning updated data
} from '$lib/server/appwrite-utils/posts.appwrite.js';

/**
 * Update an existing generic post document, e.g., to add contentRefId.
 */
export async function PATCH(event: RequestEvent): Promise<Response> {
    const { locals, cookies, request, params } = event;
    const postId = params['id'];

    if (!locals.user?.$id) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!postId) {
        // This case should ideally be caught by SvelteKit routing if param is mandatory
        return json({ error: 'Post ID is required in the path.' }, { status: 400 });
    }

    const { databases } = createUserSessionClient({ cookies });

    try {
        const existingPost = await getPostById(databases, postId);
        if (!existingPost) {
            return json({ error: 'Post not found.' }, { status: 404 });
        }
        if (existingPost.userId !== locals.user.$id) {
            return json({ error: 'Forbidden: You do not own this post.' }, { status: 403 });
        }

        const requestData = (await request.json()) as Partial<RequiredPostDocument>;

        const dataToUpdate: RequiredPostDocument = {
            postId: existingPost.postId,
            userId: existingPost.userId,
            type: existingPost.type,
            status: existingPost.status,
            accessLevel: existingPost.accessLevel,
            contentRefId: existingPost.contentRefId
        };
        if (requestData.contentRefId !== undefined)
            dataToUpdate.contentRefId = requestData.contentRefId;
        if (requestData.tags !== undefined) dataToUpdate.tags = requestData.tags;
        if (requestData.accessLevel !== undefined)
            dataToUpdate.accessLevel = requestData.accessLevel;
        if (requestData.status !== undefined) dataToUpdate.status = requestData.status;

        if (Object.keys(dataToUpdate).length === 0) {
            return json({ error: 'No updateable fields provided.' }, { status: 400 });
        }

        const updatedPost = await updatePost(databases, postId, dataToUpdate);
        return json(updatedPost, { status: 200 });
    } catch (error: unknown) {
        console.error(`[API - PATCH /api/posts/${postId}] Error:`, error);
        const message =
            typeof error === 'object' && error !== null && 'message' in error
                ? String((error as { message: unknown }).message)
                : 'Unknown error';
        return json({ error: 'Failed to update post', details: message }, { status: 500 });
    }
}
