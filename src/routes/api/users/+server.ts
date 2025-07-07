import { json } from '@sveltejs/kit';
import { type Models, Query } from 'node-appwrite';
import type { Profiles } from '$root/lib/types/appwrite';
import { createAdminClient } from '$root/lib/server/appwrite-utils/appwrite.js';
import { PROFILE_COLLECTION_ID } from '$root/lib/server/model.const.js';

export type UserIdsToUsernamesMapResponse = { userIdsToUsernamesMap: Record<string, string> };

export async function GET(event) {
    const { url } = event;
    const userIds = url.searchParams.get('userIds');

    if (!userIds) {
        return json({ error: 'User ID is required in the path.' }, { status: 400 });
    }

    const { databases } = createAdminClient();

    const users = (await databases.listDocuments('main', PROFILE_COLLECTION_ID, [
        Query.equal('$id', userIds)
    ])) as Models.DocumentList<Profiles>;

    return json({
        userIdsToUsernamesMap: users.documents.reduce(
            (acc, user) => ({
                ...acc,
                [user.$id]: user.username
            }),
            {} as Record<string, string>
        )
    });
}
