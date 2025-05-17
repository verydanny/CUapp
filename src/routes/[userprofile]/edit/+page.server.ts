import { redirect, type RequestEvent } from '@sveltejs/kit'
import { fetchProfileData } from '$lib/server/profile.js'

import type { RouteParams } from './$types.ts'

export async function load(event: RequestEvent<RouteParams, '/[profile]/edit'>) {
    if (!event.locals.user.$id) {
        return redirect(302, '/')
    }

    return fetchProfileData(event)
}

export const actions = {
    save: async (event: RequestEvent<RouteParams, '/[profile]/edit'>) => {
        const { user } = event.locals
    }
}
