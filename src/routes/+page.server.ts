import type { ServerLoad } from '@sveltejs/kit';
import type { Models } from 'node-appwrite'; // Import Models for Document type
import type { PostDocument } from '$lib/server/appwrite-utils/posts.appwrite.js';

// This defines the expected shape of a rich text post's data fields
// when it's part of a Models.Document
interface RichTextPostSpecificData {
    title: string;
    body: string;
    excerpt?: string;
    // other fields from CreateRichTextPostData if needed for display
}

// The actual document fetched from /api/richtextposts/[id]
type RichTextPostFetchedDocument = Models.Document & RichTextPostSpecificData;

export interface FeedDisplayPost {
    id: string; // PostDocument.$id (the main post ID)
    type: string; // e.g., 'richTextPost'
    createdAt: string; // PostDocument.$createdAt
    userId: string; // from PostDocument.userId
    content: RichTextPostSpecificData | { error: string } | null; // Content specific to the post type
}

export const load: ServerLoad = async ({ fetch }) => {
    try {
        const postsResponse = await fetch('/api/posts'); // Assuming GET /api/posts lists all posts
        if (!postsResponse.ok) {
            console.error(
                'Failed to fetch posts:',
                postsResponse.status,
                await postsResponse.text()
            );
            return {
                posts: [],
                pageTitle: 'Feed',
                error: `Failed to fetch posts: ${postsResponse.statusText}`,
                status: postsResponse.status
            };
        }
        const postsData = await postsResponse.json();
        // Appwrite list calls return { documents: ..., total: ... }
        const posts: PostDocument[] = postsData.documents || [];

        const feedPostsPromises = posts.map(async (post): Promise<FeedDisplayPost> => {
            let contentData: RichTextPostSpecificData | { error: string } | null = null;

            if (post.type === 'richTextPost' && post.contentRefId) {
                try {
                    const richTextResponse = await fetch(`/api/richtextposts/${post.contentRefId}`);
                    if (richTextResponse.ok) {
                        const richTextDoc =
                            (await richTextResponse.json()) as RichTextPostFetchedDocument;
                        contentData = {
                            title: richTextDoc.title,
                            body: richTextDoc.body,
                            excerpt: richTextDoc.excerpt
                        };
                    } else {
                        const errorText = await richTextResponse.text();
                        console.error(
                            `Failed to fetch richTextPost ${post.contentRefId}: ${richTextResponse.status} - ${errorText}`
                        );
                        contentData = {
                            error: `Failed to load content: ${richTextResponse.statusText} (ID: ${post.contentRefId})`
                        };
                    }
                } catch (e) {
                    console.error(`Error fetching richTextPost ${post.contentRefId}:`, e);
                    contentData = { error: `Error loading content for ID: ${post.contentRefId}.` };
                }
            }
            // TODO: Add handlers for other post types here
            // else if (post.type === 'imagePost' && post.contentRefId) { ... }

            return {
                id: post.$id,
                type: post.type,
                createdAt: post.$createdAt,
                userId: post.userId,
                content: contentData
            };
        });

        const feedPosts = await Promise.all(feedPostsPromises);

        // Sort by creation date, newest first
        feedPosts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        return {
            posts: feedPosts,
            pageTitle: 'Feed'
        };
    } catch (error) {
        console.error('Error loading feed:', error);
        // This catch is for errors in the postsResponse.json() or other synchronous parts
        return {
            posts: [],
            pageTitle: 'Feed',
            error: error instanceof Error ? error.message : 'Unknown error loading feed.',
            status: 500 // Generic server error
        };
    }
};
