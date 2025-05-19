import {
    createAdminClient,
    createUserSessionClient,
    setSessionCookies
} from '$lib/server/appwrite-utils/appwrite.js';
import type { Cookies, RequestEvent } from '@sveltejs/kit';

const { account } = createAdminClient();

export const adminCreateEmailPasswordAccount = async (
    userId: string,
    email: string,
    password: string
) => {
    return account.create(userId, email, password);
};

export const adminCreateEmailPasswordSession = async (
    email: string,
    password: string,
    cookies: Cookies
) => {
    const session = await account.createEmailPasswordSession(email, password);
    setSessionCookies(cookies, session);
};

export const clientDeleteEmailPasswordSession = async (request: RequestEvent) => {
    const { account } = createUserSessionClient(request);

    return account.deleteSession('current');
};
