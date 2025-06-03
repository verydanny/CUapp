import type { PostResponse } from './api/posts/+server.js';

export const load = async ({ fetch }) => {
    try {
        const postsResponse = await fetch('/api/posts');

        if (postsResponse.ok) {
            return {
                posts: (await postsResponse.json()) as PostResponse,
                pageTitle: 'Feed',
                error: null,
                status: postsResponse.status
            };
        }
    } catch (error) {
        console.error('Error loading feed:', error);
    }

    return {
        posts: [],
        pageTitle: 'Feed',
        error: 'Unknown error loading feed.',
        status: 500
    };
};
