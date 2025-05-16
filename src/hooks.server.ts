// src/hooks.server.js
import { ADMIN_LABEL } from '$lib/const'
import { createUserSessionClient } from '$lib/server/appwrite-utils/appwrite'
import { getProfileById } from '$lib/server/profile'

/**
 * This hook is used to create the Appwrite client and store the current logged in user in locals,
 * for easy access in our other routes.
 *
 * WARNING: Please do not add lots of querying here because this is run on every request.
 *          We want to keep the hooks as light as possible.
 *
 * @param event - The event object.
 * @param resolve - The resolve function.
 * @returns The event object.
 */
export async function handle({ event, resolve }) {
    const wasLoggedIn = Boolean(event.cookies.get('was_logged_in') === 'true')

    event.locals.user = {
        $id: undefined,
        name: undefined,
        email: undefined,
        phone: undefined,
        labels: undefined,
        userIsAdmin: false,
        wasLoggedIn
    }
    event.locals.profile = {
        $id: undefined,
        username: undefined,
        profileImage: undefined,
        isPrivateProfile: undefined,
        isProfileOwner: false
    }

    try {
        // Use our helper function to create the Appwrite client.
        const { account } = createUserSessionClient(event)

        const user = await account.get()
        const userIsAdmin = Boolean(user?.labels?.includes(ADMIN_LABEL))

        const profile = await getProfileById(user.$id)
        const isProfileOwner = Boolean(event.params?.profile === profile?.username)

        event.locals.user = {
            ...event.locals.user,
            $id: user.$id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            labels: user.labels,
            userIsAdmin,
            wasLoggedIn
        }
        event.locals.profile = {
            ...event.locals.profile,
            ...profile,
            isProfileOwner
        }
    } catch {
        // do nothing maybe Sentry error later
    }

    // Continue with the request.
    return resolve(event)
}
