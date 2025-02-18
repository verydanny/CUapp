import { redirect, type RequestEvent } from '@sveltejs/kit'
import { fetchParamProfileData } from '$lib/server/profile.js'

import type { RouteParams } from './$types.ts'

export async function load(event: RequestEvent<RouteParams, '/[profile]'>) {
    if (!event.locals.user) {
        return redirect(302, '/')
    }

    return fetchParamProfileData(event)
}

export const actions = {
    save: async (event: RequestEvent<RouteParams, '/[profile]/edit'>) => {
        const { user } = event.locals

        console.log(user)
    }
}
