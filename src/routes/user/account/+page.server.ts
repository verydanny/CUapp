// src/routes/user/account/+page.server.ts

import { SESSION_COOKIE_NAME } from '$env/static/private'

import { createSessionClient } from '$lib/server/auth/appwrite.js'
import { redirect } from '@sveltejs/kit'

export async function load({ locals }) {
    // Logged out users can't access this page.
    if (!locals.user) redirect(302, '/user/signup')

    // Pass the stored user local to the page.
    return {
        user: locals.user
    }
}

// Define our log out endpoint/server action.
export const actions = {
    default: async (event) => {
        // Create the Appwrite client.
        const { account } = createSessionClient(event)

        // Delete the session on Appwrite, and delete the session cookie.
        await account.deleteSession('current')
        event.cookies.delete(SESSION_COOKIE_NAME, { path: '/' })

        // Redirect to the sign up page.
        redirect(302, '/user/signup')
    }
}
