import { redirect } from '@sveltejs/kit';
import { getProfileByUsername } from '$lib/server/profile.js';
import { routes } from '$root/lib/const.js';
import { createUserSessionClient } from '$root/lib/server/appwrite-utils/appwrite.js';

export async function load({ parent, params, cookies }) {
    const data = await parent();
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
        data?.loggedInProfile?.$id === data?.loggedInUser?.$id;

    if (isTheProfileTheLoggedInUser) {
        return {
            ...data,
            profile: {
                ...data?.loggedInProfile,
                permissions: [],
                viewingOwnProfile: true
            }
        };
    }

    try {
        const { databases } = createUserSessionClient({ cookies });
        const profile = await getProfileByUsername(params?.userprofile, databases);

        return {
            ...data,
            profile: {
                ...profile,
                viewingOwnProfile: false
            }
        };
    } catch {
        // There is no profile with this username

        redirect(302, routes.feed);
    }
}
