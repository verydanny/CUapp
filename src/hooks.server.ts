// src/hooks.server.js
import { createUserSessionClient } from '$lib/server/auth/appwrite'

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
    try {
        // Use our helper function to create the Appwrite client.
        const { account } = createUserSessionClient(event)

        // Store the current logged in user in locals,
        // for easy access in our other routes.
        event.locals.user = await account.get()
    } catch {
        // Do nothing
    }

    // Continue with the request.
    return resolve(event)
}
