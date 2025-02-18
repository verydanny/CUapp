import { Query } from 'node-appwrite'
import { type RequestEvent } from '@sveltejs/kit'
import { createAdminClient } from './appwrite.js'
import { getSingleProfileImageUrl } from '../appwrite-utils/imageUtils.js'
import { getSingleDocumentByQuery } from '../appwrite-utils/databaseHelpers.js'
import { ADMIN_LABEL, IS_PRIVATE_PROFILE } from '../const.js'

const { databases } = createAdminClient()

export async function getProfileById(id?: string): Promise<{
    username: string | null
    profileImage: string | null
    permissions: string[]
}> {
    if (!id) {
        return {
            username: null,
            profileImage: null,
            permissions: []
        }
    }

    const profile = await databases.getDocument('main', 'profiles', id)
    const profileImage = getSingleProfileImageUrl(
        profile?.profileImage as (string | { $id: string; mimeType: string })[]
    )

    return {
        username: profile?.username as string,
        profileImage,
        permissions: profile?.permissions as string[]
    }
}

export async function fetchProfileFromLocals({ locals, cookies }: RequestEvent) {
    const { user } = locals
    const wasLoggedIn = Boolean(cookies.get('was_logged_in') === 'true')
    const profile = await getProfileById(user?.$id)

    return {
        localsProfile: user ? profile : null,
        wasLoggedIn
    }
}

export async function fetchParamProfileData({
    params,
    locals
}: RequestEvent<import('../../routes/[profile]/$types').RouteParams, '/[profile]'>) {
    const { user: loggedInUser } = locals
    const { profile: profileUsername } = params

    const userProfileId = await getSingleDocumentByQuery(
        databases,
        'main',
        'profiles_username_map',
        [Query.equal('username', profileUsername)]
    )

    const profile = await getProfileById(userProfileId?.$id)
    const isUserCurrentlyLoggedIn = loggedInUser?.$id === userProfileId?.$id
    const isAdmin = Boolean(loggedInUser?.labels?.includes(ADMIN_LABEL))
    const isPrivateProfile = Boolean(profile?.permissions?.includes(IS_PRIVATE_PROFILE))
    const canViewProfile = isUserCurrentlyLoggedIn || isAdmin || !isPrivateProfile

    return {
        user: {
            email: loggedInUser?.email
        },
        profile,
        canViewProfile,
        isUserCurrentlyLoggedIn
    }
}
