import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { type Models, Permission, Query, Role } from 'node-appwrite';
import { createUserSessionClient } from '$lib/server/appwrite-utils/appwrite.js';
import { createPost } from '$lib/server/appwrite-utils/posts.appwrite.js';
import { type Posts, PostType, type TextPost } from '$root/lib/types/appwrite';

export type GetPostsResponse = Array<TextPost & { userId?: string }>;

export async function GET(event: RequestEvent): Promise<Response> {
    const { locals, cookies } = event;

    if (!locals.user?.$id) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { databases } = createUserSessionClient({ cookies });

    try {
        const allPosts = (await databases.listDocuments('main', 'posts', [Query.limit(10)]))
            .documents as Posts[];

        // Group posts by type and create global postId -> userId lookup
        const postsByType = new Map<PostType, string[]>();
        const postIdToUserId = new Map<string, string>();
        const posts: GetPostsResponse = [];

        allPosts.forEach((post) => {
            const existing = postsByType.get(post.postType) || [];

            if (post.contentRefId) {
                existing.push(post.contentRefId);
                postIdToUserId.set(post.contentRefId, post.userId);
            }

            postsByType.set(post.postType, existing);
        });

        await Promise.all(
            Array.from(postsByType.entries()).map(async ([type, postIds]) => {
                const documentList = (
                    await databases.listDocuments('main', type, [Query.equal('$id', postIds)])
                ).documents as TextPost[];

                // Attach userId to each document using global lookup and push directly to posts
                documentList.forEach((doc) => {
                    const userId = postIdToUserId.get(doc.$id);
                    posts.push(userId ? { ...doc, userId } : doc);
                });
            })
        );

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
        const requestData = (await request.json()) as Exclude<Posts, keyof Models.Document> & {
            postId: string;
        };

        if (!requestData.postType || typeof requestData.postType !== 'string') {
            return json({ error: 'Post type is required.' }, { status: 400 });
        }

        const dataToCreate = {
            postId: requestData.postId,
            userId: locals.user.$id,
            postType: requestData.postType,
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
