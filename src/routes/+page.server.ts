import type { ServerLoad } from '@sveltejs/kit';
import type { RichTextPostDocument } from '$root/lib/types/appwrite';

// This defines the expected shape of a rich text post's data fields
// when it's part of a Models.Document
interface RichTextPostSpecificData {
    title: string;
    body: string;
    excerpt?: string;
    // other fields from CreateRichTextPostData if needed for display
}

// The actual document fetched from /api/richtextposts/[id] 

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

        const postsData = await postsResponse.json() as (RichTextPostDocument & { userId?: string })[];

        return {
            posts: postsData,
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
