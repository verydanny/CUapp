import { type Models, Query } from 'node-appwrite'
import { redirect, type RequestEvent } from '@sveltejs/kit'
import { createAdminClient } from './server/auth/appwrite'
import { getProfileImageUrls } from './utils/imageUtils'

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

export async function fetchParamProfileData(
    routeParams: RequestEvent['params'],
    locals: App.Locals
) {
    const { profile: profileLocals, user } = locals
    const { profile: profileParam } = routeParams

    if (!profileLocals?.username) redirect(302, '/auth/set-username')

    if (profileLocals?.username === profileParam) {
        const profileData = await normalizeProfileData(profileLocals)

        return {
            ...profileData,
            canViewProfile: true,
            user: {
                email: user?.email
            }
        }
    }

    const profile = (
        await databases.listDocuments('main', 'profiles', [
            Query.equal('username', profileParam as string)
        ])
    )?.documents?.[0]

    const profileData = await normalizeProfileData(profile)
    const canViewProfile = Boolean(!profile?.permissions.includes('isPrivateProfile'))

    return {
        ...profileData,
        canViewProfile,
        user: {
            email: user?.email
        }
    }
}
