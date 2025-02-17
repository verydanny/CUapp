import { redirect } from '@sveltejs/kit'
import { deleteSessionCookies } from '$lib/server/auth/appwrite.js'

import { createUserSessionClient } from '$lib/server/auth/appwrite.js'
import { fetchParamProfileData } from '$lib/profile.js'

export async function load({ params, locals }) {
    return fetchParamProfileData(params, locals)
}

// Define our log out endpoint/server action.
export const actions = {
    logout: async (event) => {
        // Create the Appwrite client.
        const { account } = createUserSessionClient(event)

        // Delete the session on Appwrite, and delete the session cookie.
        await account.deleteSession('current')
        deleteSessionCookies(event.cookies)

        // Redirect to the sign up page.
        redirect(302, '/auth/signin')
    }
}
