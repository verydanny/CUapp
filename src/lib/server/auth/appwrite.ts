import { type Cookies } from '@sveltejs/kit'
import { Client, Account, Databases, Users, Storage } from 'node-appwrite'
import { APPWRITE_KEY } from '$env/static/private'
import {
    PUBLIC_APPWRITE_ENDPOINT,
    PUBLIC_APPWRITE_PROJECT,
    PUBLIC_SESSION_COOKIE_NAME
} from '$env/static/public'

export function createPublicAccountClient() {
    const client = new Client()
        .setEndpoint(PUBLIC_APPWRITE_ENDPOINT)
        .setProject(PUBLIC_APPWRITE_PROJECT)

    return {
        get account() {
            return new Account(client)
        }
    }
}

export function createAdminClient() {
    const client = new Client()
        .setEndpoint(PUBLIC_APPWRITE_ENDPOINT)
        .setProject(PUBLIC_APPWRITE_PROJECT)
        .setKey(APPWRITE_KEY) // Set the Appwrite API key!

    // Return the services we want to use.
    return {
        get account() {
            return new Account(client)
        },
        get databases() {
            return new Databases(client)
        },
        get users() {
            return new Users(client)
        },
        get storage() {
            return new Storage(client)
        }
    }
}

export function accountClient() {
    const client = new Client()
        .setEndpoint(PUBLIC_APPWRITE_ENDPOINT)
        .setProject(PUBLIC_APPWRITE_PROJECT)

    return {
        get account() {
            return new Account(client)
        },
        get storage() {
            return new Storage(client)
        },
        get users() {
            return new Users(client)
        }
    }
}

export function createSessionClient({ cookies }: { cookies: Cookies }) {
    const client = new Client()
        .setEndpoint(PUBLIC_APPWRITE_ENDPOINT)
        .setProject(PUBLIC_APPWRITE_PROJECT)

    // Extract our custom domain's session cookie from the request
    const session = cookies.get(PUBLIC_SESSION_COOKIE_NAME)
    if (!session) {
        throw new Error('No user session')
    }

    client.setSession(session)
    // Return the services we want to use.
    return {
        get account() {
            return new Account(client)
        },
        get storage() {
            return new Storage(client)
        }
    }
}
