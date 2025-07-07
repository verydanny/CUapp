import { Databases, type Models, Query } from 'node-appwrite';

import type { BasicProfile, UserWithAdmin } from '$root/app.d.ts'; // Keep this import
import type { Profiles } from '../types/appwrite';

export async function getProfileById(id: string, databases: Databases) {
    if (!id) {
        throw new Error('ID is required');
    }

    const profile = (await databases.getDocument('main', 'profiles', id)) as Profiles;

    return {
        $id: profile?.$id,
        username: profile?.['username'],
        permissions: profile?.['permissions'] ?? null,
        profileImage: profile?.['profileImage'] ?? null
    };
}

export async function getProfileByUsername(
    username: string,
    databases: Databases
) {
    if (!username) {
        throw new Error('Username is required');
    }

    const profile = (await databases.listDocuments('main', 'profiles', [
        Query.equal('username', username),
        Query.limit(1)
    ])) as Models.DocumentList<Profiles>;

    if (profile.documents.length === 0) {
        throw new Error('Profile not found', {
            cause: {
                $id: undefined,
                username: undefined,
                profileImage: undefined,
                permissions: []
            }
        });
    }

    return {
        $id: profile.documents[0]?.$id,
        username: profile.documents[0]?.username,
        permissions: profile.documents[0]?.permissions
    };
}

export interface ProfileFromLocals {
    loggedInUser: UserWithAdmin;
    loggedInProfile: BasicProfile;
}

// const getFollowStatus = (
//     followStatus: PromiseRejectedResult | PromiseFulfilledResult<Models.Document | null | undefined>
// ): 'pending' | 'following' | null => {
//     if (followStatus.status === 'fulfilled') {
//         if (!followStatus.value) {
//             return null;
//         }

//     return followStatus.value?.pending ? 'pending' : 'following';
//     }

//     return null;
// };

// const unpackSettledPromise = <T>(
//     promise: PromiseRejectedResult | PromiseFulfilledResult<T>
// ): NonNullable<T> | null => {
//     if (promise.status === 'fulfilled' && promise.value) {
//         return promise.value;
//     }

//     return null;
// };

export interface ProfileData {
    profile: {
        isProfileOwner: boolean;
        followStatus: 'pending' | 'following' | null;
        canViewProfileDetails: boolean;
    } & BasicProfile;
}

// export async function fetchProfileData({
//     params,
//     locals
// }: RequestEvent<import('../../routes/[userprofile]/$types.d.ts').RouteParams, '/[userprofile]'>) {
// ... existing code ...
