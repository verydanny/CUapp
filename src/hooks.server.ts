// src/hooks.server.js
import { sequence } from '@sveltejs/kit/hooks';
import type { Handle } from '@sveltejs/kit';
import { ADMIN_LABEL } from '$lib/const.js';
import { createUserSessionClient } from '$lib/server/appwrite-utils/appwrite.js';

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
export const userSessionHandler: Handle = async ({ event, resolve }) => {
    const userWasLoggedIn = event.cookies.get('was_logged_in') === 'true';

    event.locals.user = {
        $id: undefined,
        name: undefined,
        email: undefined,
        phone: undefined,
        labels: undefined,
        userIsAdmin: false,
        userWasLoggedIn
    };

    try {
        // Use our helper function to create the Appwrite client.
        const { account } = createUserSessionClient(event);

        const user = await account.get();

        event.locals.user = {
            ...event.locals.user,
            $id: user.$id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            labels: user.labels,
            userIsAdmin: user?.labels?.includes(ADMIN_LABEL)
        };
    } catch {
        // do nothing maybe Sentry error later
    }

    // Continue with the request.
    return resolve(event);
};

export const chromeDevToolsSilencer: Handle = async ({ event, resolve }) => {
    // Suppress well-known Chrome DevTools requests

    if (event.url.pathname.startsWith('/.well-known/appspecific/com.chrome.devtools')) {
        return new Response(null, { status: 204 }); // Return empty response with 204 No Content
    }

    return await resolve(event);
};

export const handle = sequence(userSessionHandler, chromeDevToolsSilencer);
