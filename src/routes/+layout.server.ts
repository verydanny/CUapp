import { getProfileById } from '$lib/server/profile.js'; // Adjust path if necessary
import type { LayoutServerLoad } from './$types.d.ts';
import type { BasicProfile } from '$root/app.d.ts';
import { createUserSessionClient } from '$root/lib/server/appwrite-utils/appwrite.js';

export const load: LayoutServerLoad = async ({ locals, depends, cookies }) => {
    depends('app:user-profile');

    const loggedInProfile: BasicProfile = {
        $id: undefined,
        username: undefined,
        profileImage: undefined,
        permissions: []
    };

    if (locals?.user?.$id) {
        try {
            const { databases } = createUserSessionClient({ cookies });
            const profile = await getProfileById(locals.user.$id, databases);

            if (profile) {
                return {
                    loggedInUser: locals.user,
                    loggedInProfile: profile
                };
            }
        } catch (error) {
            console.error('Failed to load profile in root layout:', error);
            // profileData remains in its default state
        }
    }

    return {
        loggedInUser: locals.user, // This is event.locals.user from the hook
        loggedInProfile
    };
};
