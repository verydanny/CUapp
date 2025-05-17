import { Query, type Models } from 'node-appwrite'
import { type RequestEvent } from '@sveltejs/kit'
import { createAdminClient } from './appwrite-utils/appwrite.js'
import { getSingleProfileImageUrl } from './appwrite-utils/imageUtils.js'

import type { BasicProfile, UserWithAdmin } from '$root/app.d.ts'

const { databases } = createAdminClient()

export async function getProfileById(id?: string): Promise<BasicProfile> {
    if (!id) {
        throw new Error('ID is required')
    }

    const profile = await databases.getDocument('main', 'profiles', id)
    const profileImage = getSingleProfileImageUrl(
        profile?.profileImage as (string | { $id: string; mimeType: string })[]
    )

    return {
        $id: profile?.$id,
        username: profile?.username,
        profileImage,
        permissions: profile?.permissions ?? []
    }
}

export async function getProfileByUsername(username?: string): Promise<BasicProfile> {
    if (!username) {
        throw new Error('Username is required')
    }

    const profile = await databases.listDocuments('main', 'profiles', [
        Query.equal('username', username),
        Query.limit(1)
    ])

    if (profile.documents.length === 0) {
        throw new Error('Profile not found', {
            cause: {
                $id: undefined,
                username: undefined,
                profileImage: undefined,
                permissions: []
            }
        })
    }

    return {
        $id: profile.documents[0].$id,
        username: profile.documents[0].username,
        profileImage: getSingleProfileImageUrl(
            profile.documents[0].profileImage as (string | { $id: string; mimeType: string })[]
        ),
        permissions: profile.documents[0].permissions ?? []
    }
}

export interface ProfileFromLocals {
    loggedInUser: UserWithAdmin
    loggedInProfile: BasicProfile
}

const getFollowStatus = (
    followStatus: PromiseRejectedResult | PromiseFulfilledResult<Models.Document | null | undefined>
): 'pending' | 'following' | null => {
    if (followStatus.status === 'fulfilled') {
        if (!followStatus.value) {
            return null
        }

        return followStatus.value?.pending ? 'pending' : 'following'
    }

    return null
}

const unpackSettledPromise = <T>(
    promise: PromiseRejectedResult | PromiseFulfilledResult<T>
): NonNullable<T> | null => {
    if (promise.status === 'fulfilled' && promise.value) {
        return promise.value
    }

    return null
}

export interface ProfileData {
    profile: {
        isProfileOwner: boolean
        followStatus: 'pending' | 'following' | null
        canViewProfileDetails: boolean
    } & BasicProfile
}

export async function fetchProfileData({
    params,
    locals
}: RequestEvent<import('../../routes/[userprofile]/$types.d.ts').RouteParams, '/[userprofile]'>) {
    // const userProfileId = await adminGetSingleDocumentByQuery('main', 'profiles_username_map', [
    //     Query.equal('username', profileParameter)
    // ])
    // if (!userProfileId) {
    //     return redirect(302, routes?.feed)
    // }
    // const { userIsAdmin = false } = loggedInUser ?? {}
    // const { isProfileOwner = false } = loggedInProfile ?? {}
    // const [profilePromise, followStatusPromise] = isProfileOwner
    //     ? await Promise.allSettled([loggedInProfile, null])
    //     : await Promise.allSettled([
    //           getProfileById(userProfileId?.$id),
    //           loggedInProfile?.$id
    //               ? adminGetSingleDocumentByQuery('main', 'follows', [
    //                     Query.and([
    //                         Query.equal('followerId', loggedInProfile.$id),
    //                         Query.equal('profileId', userProfileId?.$id)
    //                     ])
    //                 ])
    //               : undefined
    //       ])
    // const profile = unpackSettledPromise(profilePromise)
    // const followStatus = getFollowStatus(followStatusPromise)
    // const canViewProfileDetails = isProfileOwner || userIsAdmin || followStatus === 'following'
    // if (!profile) {
    //     return redirect(302, routes?.feed)
    // }
    // // Future if logged in user is not the profile owner, check if they are a friend on current profile
    // /**
    //  *  followerId: profile ID of the user who is following
    //  *  profileId: profile ID of the user who is being followed
    //  */
    // return {
    //     profile: {
    //         ...profile,
    //         isProfileOwner,
    //         followStatus,
    //         canViewProfileDetails
    //     }
    // }
}
