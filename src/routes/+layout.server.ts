import { fetchProfileFromLocals } from '$lib/server/profile.js'

import type { RequestEvent } from './$types.ts'

export async function load(requestEvent: RequestEvent) {
    return fetchProfileFromLocals(requestEvent)
}
