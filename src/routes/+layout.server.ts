import { normalizeProfileData } from '$lib/profile.js'

export async function load({ locals }) {
    if (!locals.user) {
        return {
            profile: null,
            profileImage: null
        }
    }

    const { profile, profileImageUrlsArray } = await normalizeProfileData(locals.profile)

    return {
        profile: {
            username: profile?.username,
            profileImage: profileImageUrlsArray?.[0]
        }
    }
}
