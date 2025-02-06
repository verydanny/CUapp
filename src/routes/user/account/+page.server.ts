export const prerender = false
export const csr = true
import {
    createAdminClient,
    deleteSessionCookies,
    getSessionCookie
} from '$lib/server/auth/appwrite.js'
import { createBucketUrl } from '$lib/utils/storageUtils.js'

import { createUserSessionClient } from '$lib/server/auth/appwrite.js'
import { redirect } from '@sveltejs/kit'

export async function load({ locals, cookies }) {
    // Logged out users can't access this page.
    if (!locals.user) redirect(302, '/user/signin')

    const { databases, storage } = createAdminClient()
    const userProfile = await databases.getDocument('main', 'profiles', locals.user.$id)
    const session = getSessionCookie(cookies) as string

    if (!userProfile) {
        redirect(302, '/user/signin')
    }

    const { files: profileImageFiles } = await storage.listFiles(
        'profile-images',
        [],
        locals.user.$id
    )

    return {
        user: {
            $id: locals.user.$id,
            email: locals.user.email,
            name: locals.user.name,
            profileId: userProfile?.$id,
            username: userProfile?.username,
            profileImage: userProfile?.profileImage,
            bio: userProfile?.bio
        },
        session,
        profileImageUrls: profileImageFiles?.map((file) => {
            return {
                url: createBucketUrl('profile-images', file.$id),
                mimeType: file.mimeType
            }
        })
    }
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
        redirect(302, '/user/signin')
    }
}
