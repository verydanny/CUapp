import { type Models, Query } from 'node-appwrite'
import { type RequestEvent } from '@sveltejs/kit'
import { createAdminClient } from './server/auth/appwrite'
import { getProfileImageUrls, getSingleProfileImageUrl } from './utils/imageUtils'
import { getSingleDocumentByQuery } from './server/databaseHelpers'
import { ADMIN_LABEL, IS_PRIVATE_PROFILE } from './const'

const { databases, storage } = createAdminClient()

const normalizeProfileImageUrls = (profileImageFiles: Models.FileList) => {
    const profileImageUrls = getProfileImageUrls(profileImageFiles?.files)

    return [
        profileImageUrls.highest,
        profileImageUrls.high,
        profileImageUrls.medium,
        profileImageUrls.low
    ].filter(Boolean)
}

export async function normalizeProfileData(profile?: Models.Document) {
    if (!profile?.$id) {
        return {
            profile: null,
            profileImageUrlsArray: null
        }
    }

    const profileImages = await storage.listFiles('profile-images', [], profile?.$id)

    return {
        profile: {
            username: profile?.username as string,
            bio: profile?.bio as string,
            permissions: profile?.permissions as string[]
        },
        profileImageUrlsArray: normalizeProfileImageUrls(profileImages)
    }
}

export async function fetchProfileFromLocals({ locals, cookies }: RequestEvent) {
    const { user } = locals
    const wasLoggedIn = Boolean(cookies.get('was_logged_in') === 'true')

    if (!user) {
        return {
            profile: null,
            wasLoggedIn
        }
    }

    const profile = await databases.getDocument('main', 'profiles', user.$id)
    const profileImage = getSingleProfileImageUrl(
        profile?.profileImage as (string | { $id: string; mimeType: string })[]
    )

    return {
        profile: {
            username: profile?.username as string,
            profileImage: profileImage
        },
        wasLoggedIn
    }
}

export async function fetchParamProfileData({
    params,
    locals
}: RequestEvent<import('../routes/[profile]/$types').RouteParams, '/user/[profile]'>) {
    const { user: loggedInUser } = locals
    const { profile } = params

    const userProfileId = await getSingleDocumentByQuery(
        databases,
        'main',
        'profiles_username_map',
        [Query.equal('username', profile)]
    )

    const userProfile = await databases.getDocument('main', 'profiles', userProfileId?.$id)
    const profileImage = getSingleProfileImageUrl(
        userProfile?.profileImage as (string | { $id: string; mimeType: string })[]
    )
    const isCurrentlyLoggedInUser = loggedInUser?.$id === userProfileId?.$id
    const isAdmin = Boolean(loggedInUser?.labels?.includes(ADMIN_LABEL))
    const isPrivateProfile = Boolean(userProfile?.permissions?.includes(IS_PRIVATE_PROFILE))
    const canViewProfile = isCurrentlyLoggedInUser || isAdmin || !isPrivateProfile

    return {
        user: {
            email: loggedInUser?.email
        },
        profile: {
            username: userProfile?.username as string,
            profileImage
        },
        canViewProfile
    }
}
