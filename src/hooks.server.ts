// src/hooks.server.js
import { createSessionClient } from '$lib/server/auth/appwrite'

export async function handle({ event, resolve }) {
    try {
        // Use our helper function to create the Appwrite client.
        const { account } = createSessionClient(event)

        console.log('account', account)
        // Store the current logged in user in locals,
        // for easy access in our other routes.
        event.locals.user = await account.get()
    } catch {
        // Do nothing
    }

    // Continue with the request.
    return resolve(event)
}
