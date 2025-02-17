// src/hooks.server.js
import { createAdminClient, createUserSessionClient } from '$lib/server/auth/appwrite'

const { databases } = createAdminClient()

export async function handle({ event, resolve }) {
    try {
        // Use our helper function to create the Appwrite client.
        const { account } = createUserSessionClient(event)

        // Store the current logged in user in locals,
        // for easy access in our other routes.
        event.locals.user = await account.get()
        event.locals.profile = await databases.getDocument(
            'main',
            'profiles',
            event.locals.user.$id
        )
    } catch {
        // Do nothing
    }

    // Continue with the request.
    return resolve(event)
}
