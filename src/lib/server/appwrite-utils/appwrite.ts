import { type Cookies } from '@sveltejs/kit';
import { Client, Account, Databases, Users, Storage, type Models, Functions } from 'node-appwrite';
import { SECRET_APPWRITE_API_KEY } from '$env/static/private';
import {
    ORIGIN,
    APPWRITE_ENDPOINT,
    APPWRITE_PROJECT_ID,
    SESSION_COOKIE_PREFIX
} from '$env/static/public';

export const COOKIE_NAME = SESSION_COOKIE_PREFIX + APPWRITE_PROJECT_ID;
export const COOKIE_NAME_LEGACY = COOKIE_NAME + '_legacy';
export const COOKIE_NAME_WAS_LOGGED_IN = 'was_logged_in';

export const setSessionCookies = (cookies: Cookies, session: Models.Session) => {
    [COOKIE_NAME, COOKIE_NAME_LEGACY].forEach((cookieName) =>
        cookies.set(cookieName, session.secret, {
            httpOnly: true,
            sameSite: 'strict',
            expires: new Date(session.expire),
            secure: true,
            path: '/',
            domain: ORIGIN
        })
    );

    cookies.set(COOKIE_NAME_WAS_LOGGED_IN, 'true', {
        httpOnly: false,
        sameSite: 'strict',
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 10), // 10 days
        secure: true,
        path: '/'
    });
};

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

export function createAdminClient() {
    const client = new Client()
        .setEndpoint(APPWRITE_ENDPOINT)
        .setProject(APPWRITE_PROJECT_ID)
        .setKey(SECRET_APPWRITE_API_KEY); // Set the Appwrite API key

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

export function createUserSessionClient({ cookies }: { cookies: Cookies }) {
    const client = new Client().setEndpoint(APPWRITE_ENDPOINT).setProject(APPWRITE_PROJECT_ID);

    // Extract our custom domain's session cookie from the request
    const session = getSessionCookie(cookies);

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
        },
        get databases() {
            return new Databases(client);
        },
        get functions() {
            return new Functions(client);
        }
    };
}
