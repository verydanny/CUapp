import { text, json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { ExecutionMethod, Permission, Role } from 'node-appwrite';
import { createUserSessionClient } from '$lib/server/appwrite-utils/appwrite.js';
import {
    createPost,
    type RequiredPostDocument
} from '$lib/server/appwrite-utils/posts.appwrite.js';

export async function GET(event: RequestEvent): Promise<Response> {
    const { locals, cookies } = event;

    if (!locals.user?.$id) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { functions } = createUserSessionClient({ cookies });

    try {
        const posts = await functions.createExecution(
            'starter',
            JSON.stringify({}),
            undefined,
            'posts',
            ExecutionMethod.GET
        );

        return text(posts.responseBody);
    } catch (_error: unknown) {
        return json({ error: 'Failed to get posts' }, { status: 500 });
    }
}

/**
 * Create a new generic post document.
 */
export async function POST(event: RequestEvent): Promise<Response> {
    const { locals, cookies, request } = event;

    if (!locals.user?.$id) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { databases } = createUserSessionClient({ cookies });

    try {
        const requestData = (await request.json()) as RequiredPostDocument;

        if (!requestData.type || typeof requestData.type !== 'string') {
            return json({ error: 'Post type is required.' }, { status: 400 });
        }

        const dataToCreate: RequiredPostDocument = {
            postId: requestData.postId,
            userId: locals.user.$id,
            type: requestData.type,
            tags: requestData.tags || [],
            accessLevel: requestData.accessLevel || 'private',
            status: requestData.status || 'draft',
            contentRefId: requestData.contentRefId
        };

        // Default permissions: user can read/write, others can read if post is public (logic handled elsewhere)
        const permissions = [
            Permission.read(Role.user(locals.user.$id)),
            Permission.update(Role.user(locals.user.$id)),
            Permission.delete(Role.user(locals.user.$id)),
            Permission.read(Role.any()) // Broad read, actual visibility controlled by app logic + accessLevel
        ];

        const newPost = await createPost(databases, dataToCreate, permissions);
        return json(newPost, { status: 201 });
    } catch (error: unknown) {
        console.error('[API - POST /api/posts] Error:', error);
        const message =
            typeof error === 'object' && error !== null && 'message' in error
                ? String((error as { message: unknown }).message)
                : 'Unknown error';
        return json({ error: 'Failed to create post', details: message }, { status: 500 });
    }
}
