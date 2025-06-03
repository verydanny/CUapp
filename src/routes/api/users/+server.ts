// import { createUserSessionClient } from '$lib/server/appwrite-utils/appwrite.server.js';
// import type { RequestEvent } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import { Query } from 'node-appwrite';
import { createAdminClient } from '$root/lib/server/appwrite-utils/appwrite.js';
import { PROFILE_COLLECTION_ID } from '$root/lib/server/model.const.js';

export async function GET(event) {
    const { url } = event;
    const userIds = url.searchParams.get('userIds');

    if (!userIds) {
        return json({ error: 'User ID is required in the path.' }, { status: 400 });
    }

    const { databases } = createAdminClient();

    const users = await databases.listDocuments('main', PROFILE_COLLECTION_ID, [
        Query.equal('userId', userIds)
    ]);

    return json({ users });
}
