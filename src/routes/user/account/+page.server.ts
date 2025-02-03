// src/routes/user/account/+page.server.ts
import { Query } from 'node-appwrite'
import { createAdminClient } from '$lib/server/auth/appwrite.js'
import { PUBLIC_SESSION_COOKIE_NAME } from '$env/static/public'

import { createSessionClient } from '$lib/server/auth/appwrite.js'
import { redirect } from '@sveltejs/kit'

export async function load({ locals, cookies }) {
    // Logged out users can't access this page.
    if (!locals.user) redirect(302, '/')

    const { databases } = createAdminClient()
    const userExisting = await databases.listDocuments('main', 'profiles', [
        Query.equal('userId', locals.user.$id)
    ])

    if (!userExisting) {
        redirect(302, '/')
    }

    const currentUser = userExisting.documents[0]

    // Pass the stored user local to the page.
    return {
        user: locals.user,
        currentUser,
        session: cookies.get(PUBLIC_SESSION_COOKIE_NAME)!
    }
}

// Define our log out endpoint/server action.
export const actions = {
    logout: async (event) => {
        // Create the Appwrite client.
        const { account } = createSessionClient(event)

        // Delete the session on Appwrite, and delete the session cookie.
        await account.deleteSession('current')
        event.cookies.delete(PUBLIC_SESSION_COOKIE_NAME, { path: '/' })

        // Redirect to the sign up page.
        redirect(302, '/user/signin')
    },
    upload: async ({ request, locals }) => {
        if (!locals.user) redirect(302, '/')

        const { databases, storage } = createAdminClient()
        const formData = await request.formData()
        const userId = formData.get('userId') as string
        const fileId = formData.get('file') as string

        try {
            const currentUser = (
                await databases.listDocuments('main', 'profiles', [Query.equal('userId', userId)])
            )?.documents?.[0]

            if (currentUser?.profileImage) {
                await storage.deleteFile('profileImages', currentUser.profileImage)
            }

            await databases.updateDocument('main', 'profiles', currentUser.$id, {
                profileImage: fileId
            })
        } catch (e) {
            console.log('Error uploading profile image:', e)
        }

        return { success: true }
    }
}
