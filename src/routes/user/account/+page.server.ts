export const prerender = false
export const csr = true
import { createAdminClient, COOKIE_NAME, COOKIE_NAME_LEGACY } from '$lib/server/auth/appwrite.js'
import { PUBLIC_APPWRITE_ENDPOINT, PUBLIC_APPWRITE_PROJECT } from '$env/static/public'

import { createSessionClient } from '$lib/server/auth/appwrite.js'
import { redirect } from '@sveltejs/kit'

export async function load({ locals, cookies }) {
    // Logged out users can't access this page.
    if (!locals.user) redirect(302, '/user/signin')

    const { databases } = createAdminClient()

    const currentUser = await databases.getDocument('main', 'profiles', locals.user.$id)

    if (!currentUser) {
        redirect(302, '/user/signin')
    }

    // if there is a locals.user, then there is a session
    const session = cookies.get(COOKIE_NAME) as string

    return {
        user: locals.user,
        currentUser,
        session,
        profileImageUrl: currentUser?.profileImage
            ? `${PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/profile-images/files/${currentUser?.profileImage}/view?project=${PUBLIC_APPWRITE_PROJECT}`
            : null
    }
}

// Define our log out endpoint/server action.
export const actions = {
    logout: async (event) => {
        // Create the Appwrite client.
        const { account } = createSessionClient(event)

        // Delete the session on Appwrite, and delete the session cookie.
        await account.deleteSession('current')

        // Delete the legacy session cookies too.
        event.cookies.delete(COOKIE_NAME, { path: '/' })
        event.cookies.delete(COOKIE_NAME_LEGACY, { path: '/' })

        // Redirect to the sign up page.
        redirect(302, '/user/signin')
    }
}
