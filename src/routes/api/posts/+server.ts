import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { Permission, Query, Role } from 'node-appwrite';
import { createUserSessionClient } from '$lib/server/appwrite-utils/appwrite.js';
import {
    createPost,
    type RequiredPostDocument
} from '$lib/server/appwrite-utils/posts.appwrite.js';
import { type PostsDocument, type RichTextPostDocument, PostsTypeType } from '$root/lib/types/appwrite';

export type PostResponse = (RichTextPostDocument & { userId?: string })[]

export async function GET(event: RequestEvent): Promise<Response> {
    const start = performance.now();
    const { locals, cookies } = event;

    if (!locals.user?.$id) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { databases } = createUserSessionClient({ cookies });

    try {
        const allPosts = (await databases.listDocuments('main', 'posts', [Query.limit(10)])).documents as PostsDocument[];

        // Group posts by type and create global postId -> userId lookup
        const postsByType = new Map<PostsTypeType, string[]>();
        const postIdToUserId = new Map<string, string>();
        const posts: PostResponse = [];
        
        allPosts.forEach(post => {
            const existing = postsByType.get(post.type) || [];

            if (post.contentRefId) {
                existing.push(post.contentRefId);
                postIdToUserId.set(post.contentRefId, post.userId);
            }

            postsByType.set(post.type, existing);
        });
        
        await Promise.all(
            Array.from(postsByType.entries()).map(async ([type, postIds]) => {                
                const documentList = (await databases.listDocuments('main', type, [
                    Query.equal('$id', postIds)
                ])).documents as RichTextPostDocument[];
                
                // Attach userId to each document using global lookup and push directly to posts
                documentList.forEach((doc) => {
                    const userId = postIdToUserId.get(doc.$id);
                    posts.push(userId ? { ...doc, userId } : doc);
                });
            })
        )
        const end = performance.now();
        console.log(`Posts function took ${end - start}ms`);

        return json(posts);
    } catch (_error: unknown) {
        console.error('[API - GET /api/posts] Error:', _error);
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
