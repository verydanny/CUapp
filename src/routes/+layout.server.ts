import { fetchProfileFromLocals, type ProfileFromLocals } from '$lib/server/profile.js'
import type { ServerLoadEvent } from '@sveltejs/kit'
import type { LayoutRouteId } from './$types'

import type { EmptyObject } from '$root/lib/types.d.ts'

export function load(
    requestEvent: ServerLoadEvent<{ profile?: string }, EmptyObject, LayoutRouteId>
): ProfileFromLocals {
    return fetchProfileFromLocals(requestEvent)
}
