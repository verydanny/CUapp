import { type Cookies } from '@sveltejs/kit';
import { Client, Account, Databases, Users, Storage, type Models } from 'node-appwrite';
import { APPWRITE_KEY } from '$env/static/private';
import {
    PUBLIC_ORIGIN,
    PUBLIC_APPWRITE_ENDPOINT,
    PUBLIC_APPWRITE_PROJECT,
    PUBLIC_SESSION_COOKIE_PREFIX
} from '$env/static/public';

export const COOKIE_NAME = PUBLIC_SESSION_COOKIE_PREFIX + PUBLIC_APPWRITE_PROJECT;
export const COOKIE_NAME_LEGACY = COOKIE_NAME + '_legacy';

export const setSessionCookies = (cookies: Cookies, session: Models.Session) =>
    [COOKIE_NAME, COOKIE_NAME_LEGACY].forEach((cookieName) =>
        cookies.set(cookieName, session.secret, {
            httpOnly: true,
            sameSite: 'strict',
            expires: new Date(session.expire),
            secure: true,
            path: '/',
            domain: PUBLIC_ORIGIN
        })
    );

export const deleteSessionCookies = (cookies: Cookies) => {
    cookies.delete(COOKIE_NAME, { path: '/' });
    cookies.delete(COOKIE_NAME_LEGACY, { path: '/' });
};

export const getSessionCookie = (cookies: Cookies) =>
    cookies.get(COOKIE_NAME) || cookies.get(COOKIE_NAME_LEGACY) || '';

export const cleanupUserSession = async (cookies: Cookies, account: Account) => {
    await account.deleteSession('current');
    deleteSessionCookies(cookies);
};

export function createPublicAccountClient() {
    const client = new Client()
        .setEndpoint(PUBLIC_APPWRITE_ENDPOINT)
        .setProject(PUBLIC_APPWRITE_PROJECT);

    return {
        get account() {
            return new Account(client);
        }
    };
}

export function createAdminClient() {
    const client = new Client()
        .setEndpoint(PUBLIC_APPWRITE_ENDPOINT)
        .setProject(PUBLIC_APPWRITE_PROJECT)
        .setKey(APPWRITE_KEY); // Set the Appwrite API key!

    // Return the services we want to use.
    return {
        get account() {
            return new Account(client);
        },
        get databases() {
            return new Databases(client);
        },
        get users() {
            return new Users(client);
        },
        get storage() {
            return new Storage(client);
        }
    };
}

export function accountClient() {
    const client = new Client()
        .setEndpoint(PUBLIC_APPWRITE_ENDPOINT)
        .setProject(PUBLIC_APPWRITE_PROJECT);

    return {
        get account() {
            return new Account(client);
        },
        get storage() {
            return new Storage(client);
        },
        get users() {
            return new Users(client);
        }
    };
}

export function createUserSessionClient({ cookies }: { cookies: Cookies }) {
    const client = new Client()
        .setEndpoint(PUBLIC_APPWRITE_ENDPOINT)
        .setProject(PUBLIC_APPWRITE_PROJECT);

    // Extract our custom domain's session cookie from the request
    const session = cookies.get(COOKIE_NAME);
    if (!session) {
        throw new Error('No user session');
    }

    client.setSession(session);

    // Return the services we want to use.
    return {
        get account() {
            return new Account(client);
        },
        get storage() {
            return new Storage(client);
        }
    };
}
