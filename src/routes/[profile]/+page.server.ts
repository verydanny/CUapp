import { redirect, type RequestEvent } from '@sveltejs/kit'
import { cleanupUserSession } from '$lib/server/auth/appwrite.js'

import { createUserSessionClient } from '$lib/server/auth/appwrite.js'
import { fetchParamProfileData } from '$lib/profile.js'

import type { RouteParams } from './$types'
import { routes } from '$lib/const'

export async function load(event: RequestEvent<RouteParams, '/[profile]'>) {
    return fetchParamProfileData(event)
}

// Define our log out endpoint/server action.
export const actions = {
    logout: async (event) => {
        // Create the Appwrite client.
        const { account } = createUserSessionClient(event)
        await cleanupUserSession(event.cookies, account)

        // Redirect to the sign up page.
        redirect(302, routes?.auth?.signup)
    }
}
