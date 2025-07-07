import type { GetPostsResponse } from './api/posts/+server.js';
import type { UserIdsToUsernamesMapResponse } from './api/users/+server.js';

// export const prerender = true;
export const ssr = true;

const getUniqueUserIds = (posts: GetPostsResponse) => {
    const seen = new Set<string>();
    let result = '';

    for (let i = 0, len = posts.length; i < len; i++) {
        const userId = posts[i]!.userId;
        if (!seen.has(userId!)) {
            seen.add(userId!);
            result += result ? ',' + userId : userId;
        }
    }
    return result;
};

export const load = async ({ fetch }) => {
    try {
        const postsResponse = await fetch('/api/posts');

        if (postsResponse.ok) {
            const posts = (await postsResponse.json()) as GetPostsResponse;
            const uniqueUserIds = getUniqueUserIds(posts);
            const { userIdsToUsernamesMap } = (await (
                await fetch('/api/users?userIds=' + uniqueUserIds)
            ).json()) as UserIdsToUsernamesMapResponse;

            return {
                posts,
                userIdsToUsernamesMap,
                pageTitle: 'Feed',
                error: null,
                status: postsResponse.status
            };
        }
    } catch (error) {
        console.error('Error loading feed:', error);
    }

    return {
        posts: null,
        userIdsToUsernamesMap: null,
        pageTitle: 'Feed',
        error: 'Unknown error loading feed.',
        status: 500
    };
};
