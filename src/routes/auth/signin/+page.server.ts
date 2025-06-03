import { redirect } from '@sveltejs/kit';
import type { LoadEvent, RequestEvent } from '@sveltejs/kit';
import { AppwriteException } from 'node-appwrite';

// Define the messages constant if it's not exported from const.js
const messages = {
    invalidCredentials: 'Invalid email or password',
    unknownError: 'An unexpected error occurred'
};

import { routes } from '$lib/const.js';
import { adminCreateEmailPasswordSession } from '$root/lib/server/appwrite-utils/accountHelpers.js';

export const load = async ({ parent }: LoadEvent) => {
    const data = await parent();

    if (data?.loggedInProfile?.username) {
        redirect(302, `/${data?.loggedInProfile?.username}`);
    }
};

export const actions = {
    signin: async ({ request, cookies }: RequestEvent) => {
        const formData = await request.formData();
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;

        if (!email || !password) {
            return { 
                type: 'failure',
                status: 400,
                data: {
                    message: messages.invalidCredentials
                }
            };
        }

        try {
            await adminCreateEmailPasswordSession(email, password, cookies);
        } catch (error) {
            console.log('Error creating email password session:', error);
            if (error instanceof AppwriteException) {
                return {
                    type: 'failure',
                    status: error.code,
                    data: {
                        message: error.message
                    }
                };
            }

            return {
                type: 'failure',
                status: 500,
                data: {
                    message: messages.unknownError
                }
            };
        }

        redirect(302, routes.feed);
    }
};
