import { redirect, type RequestEvent } from '@sveltejs/kit'
import { cleanupUserSession } from '$lib/server/appwrite.js'

import { createUserSessionClient } from '$lib/server/appwrite.js'
import { fetchParamProfileData } from '$lib/server/profile.js'

import type { RouteParams } from './$types.ts'
import { routes } from '$lib/const.js'

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
