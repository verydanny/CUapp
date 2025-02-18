import { fetchProfileFromLocals } from '$lib/profile.js'

import type { RequestEvent } from './$types'

export async function load(requestEvent: RequestEvent) {
    return fetchProfileFromLocals(requestEvent)
}
