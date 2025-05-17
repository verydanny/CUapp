import { ID, Query } from 'node-appwrite'
import { redirect } from '@sveltejs/kit'

import { cleanupUserSession } from '$lib/server/appwrite-utils/appwrite.js'
import { createUserSessionClient } from '$lib/server/appwrite-utils/appwrite.js'
import { routes } from '$lib/const.js'
import {
    adminCreateDocumentWithUserPermissions,
    adminDeleteDocument,
    adminGetSingleDocumentByQuery
} from '$lib/server/appwrite-utils/databaseHelpers.js'
import { getProfileByUsername } from '$lib/server/profile'

export async function load({ parent, params }) {
    const data = await parent()
    /**
     * Here we should establish permissions about viewing "this" current profile
     *
     * - Is there a logged in user?
     * - Is the profile the logged in user's?
     * - If not, is the logged in user following the profile?
     * - Is the profile private?
     * - Is the profile public?
     * - Is the profile not found?
     *
     */

    const isTheProfileTheLoggedInUser =
        params?.userprofile === data?.loggedInProfile?.username &&
        data?.loggedInProfile?.$id === data?.loggedInUser?.$id

    if (isTheProfileTheLoggedInUser) {
        return {
            ...data,
            profile: {
                ...data?.loggedInProfile,
                permissions: [],
                viewingOwnProfile: true
            }
        }
    }

    const profile = await getProfileByUsername(params?.userprofile)

    if (profile) {
        return {
            ...data,
            profile: {
                ...profile,
                viewingOwnProfile: false
            }
        }
    }

    return data
}

// Define our log out endpoint/server action.
export const actions = {
    follow: async ({ request }) => {
        const formData = await request.formData()
        const followerId = formData.get('followerId') as string
        const profileId = formData.get('profileId') as string
        const pending = (formData.get('pending') as string) === 'true'

        if (!followerId || !profileId) {
            return {
                type: 'failure',
                status: 400,
                data: {
                    message: 'Invalid form data'
                }
            }
        }

        const follow = await adminGetSingleDocumentByQuery('main', 'follows', [
            Query.and([Query.equal('followerId', followerId), Query.equal('profileId', profileId)])
        ])

        if (!follow) {
            await adminCreateDocumentWithUserPermissions(
                'main',
                'follows',
                ID.unique(),
                {
                    followerId,
                    profileId,
                    pending
                },
                followerId
            )
        }

        return {
            success: true
        }
    },
    unfollow: async ({ request }) => {
        const formData = await request.formData()
        const followerId = formData.get('followerId') as string
        const profileId = formData.get('profileId') as string

        if (!followerId || !profileId) {
            return {
                type: 'failure',
                status: 400,
                data: { message: 'Invalid form data' }
            }
        }

        const follow = await adminGetSingleDocumentByQuery('main', 'follows', [
            Query.and([Query.equal('followerId', followerId), Query.equal('profileId', profileId)])
        ])

        if (follow) {
            await adminDeleteDocument('main', 'follows', follow.$id)
        }

        return {
            success: true
        }
    },
    logout: async (event) => {
        // Create the Appwrite client.
        const { account } = createUserSessionClient(event)
        await cleanupUserSession(event.cookies, account)

        // Redirect to the sign up page.
        redirect(302, routes?.auth?.signup)
    }
}
