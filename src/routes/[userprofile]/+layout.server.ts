import { redirect, type LoadEvent } from '@sveltejs/kit';
import { getProfileByUsername } from '$lib/server/profile';
import { routes } from '$root/lib/const.js';

export async function load({ parent, params }: LoadEvent) {
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
        const profile = await getProfileByUsername(params?.userprofile);

        return {
            ...data,
            profile: {
                ...profile,
                viewingOwnProfile: false
            }
        };
    } catch {
        // There is no profile with this username

        redirect(302, routes?.feed);
    }
}
