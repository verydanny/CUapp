import { Databases, Query } from 'node-appwrite';

import type { BasicProfile, UserWithAdmin } from '$root/app.d.ts'; // Keep this import

export async function getProfileById(id: string, databases: Databases): Promise<BasicProfile> {
    if (!id) {
        throw new Error('ID is required');
    }

    const profile = await databases.getDocument('main', 'profiles', id);

    return {
        $id: profile?.$id,
        username: profile?.username,
        profileImage: undefined,
        permissions: profile?.permissions ?? []
    };
}

export async function getProfileByUsername(
    username: string,
    databases: Databases
): Promise<BasicProfile> {
    if (!username) {
        throw new Error('Username is required');
    }

    const profile = await databases.listDocuments('main', 'profiles', [
        Query.equal('username', username),
        Query.limit(1)
    ]);

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
        $id: profile.documents[0].$id,
        username: profile.documents[0].username,
        profileImage: undefined,
        permissions: profile.documents[0].permissions ?? []
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
