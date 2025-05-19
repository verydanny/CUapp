import { ID, Query } from 'node-appwrite';
import { redirect, type RequestEvent } from '@sveltejs/kit';

import { cleanupUserSession } from '$lib/server/appwrite-utils/appwrite.js';
import { createUserSessionClient } from '$lib/server/appwrite-utils/appwrite.js';
import { routes } from '$lib/const.js';
import {
    adminCreateDocumentWithUserPermissions,
    adminDeleteDocument,
    adminGetSingleDocumentByQuery
} from '$lib/server/appwrite-utils/databaseHelpers.js';

// Define our log out endpoint/server action.
export const actions = {
    follow: async ({ request, locals }: RequestEvent) => {
        if (!locals.user?.$id) {
            redirect(302, routes?.auth?.signup);
        }

        const formData = await request.formData();
        const followerId = formData.get('followerId') as string;
        const profileId = formData.get('profileId') as string;
        const pending = (formData.get('pending') as string) === 'true';

        if (!followerId || !profileId) {
            return {
                type: 'failure',
                status: 400,
                data: {
                    message: 'Invalid form data'
                }
            };
        }

        const follow = await adminGetSingleDocumentByQuery('main', 'follows', [
            Query.and([Query.equal('followerId', followerId), Query.equal('profileId', profileId)])
        ]);

        if (!follow) {
            await adminCreateDocumentWithUserPermissions(
                'main',
                'follows',
                ID.unique(),
                {
                    followerId,
                    profileId,
                    pending
                },
                followerId
            );
        }

        return {
            success: true
        };
    },
    unfollow: async ({ request }: RequestEvent) => {
        const formData = await request.formData();
        const followerId = formData.get('followerId') as string;
        const profileId = formData.get('profileId') as string;

        if (!followerId || !profileId) {
            return {
                type: 'failure',
                status: 400,
                data: { message: 'Invalid form data' }
            };
        }

        const follow = await adminGetSingleDocumentByQuery('main', 'follows', [
            Query.and([Query.equal('followerId', followerId), Query.equal('profileId', profileId)])
        ]);

        if (follow) {
            await adminDeleteDocument('main', 'follows', follow.$id);
        }

        return {
            success: true
        };
    },
    logout: async (event: RequestEvent) => {
        // Create the Appwrite client.
        const { account } = createUserSessionClient(event);

        await cleanupUserSession(event.cookies, account);

        // Redirect to the sign up page.
        redirect(302, routes?.auth?.signup);
    }
};
