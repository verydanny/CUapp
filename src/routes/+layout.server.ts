import { getProfileById } from '$lib/server/profile' // Adjust path if necessary
import type { LayoutServerLoad } from './$types'
import type { BasicProfile } from '$root/app'

export const load: LayoutServerLoad = async ({ locals, depends }) => {
    // depends() will invalidate the data when the specified dependencies change
    depends('app:user-profile')

    const loggedInProfile: BasicProfile = {
        $id: undefined,
        username: undefined,
        profileImage: undefined
    }

    if (locals?.user?.$id) {
        try {
            const profile = await getProfileById(locals.user.$id)

            if (profile) {
                return {
                    loggedInUser: locals.user,
                    loggedInProfile: profile
                }
            }
        } catch (error) {
            console.error('Failed to load profile in root layout:', error)
            // profileData remains in its default state
        }
    }

    return {
        loggedInUser: locals.user, // This is event.locals.user from the hook
        loggedInProfile
    }
}
