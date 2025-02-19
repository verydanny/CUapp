import { Query, type Models } from 'node-appwrite'
import { redirect, type RequestEvent } from '@sveltejs/kit'
import { createAdminClient } from './appwrite-utils/appwrite.js'
import { getSingleProfileImageUrl } from './appwrite-utils/imageUtils.js'
import { adminGetSingleDocumentByQuery } from './appwrite-utils/databaseHelpers.js'
import { routes, IS_PRIVATE_PROFILE } from '$lib/const.js'

import type { BasicProfile } from '../../app.d.ts'

const { databases } = createAdminClient()

export async function getProfileById(id?: string): Promise<BasicProfile> {
    if (!id) {
        return {
            $id: undefined,
            username: undefined,
            profileImage: undefined,
            isPrivateProfile: false
        }
    }

    const profile = await databases.getDocument('main', 'profiles', id)
    const profileImage = getSingleProfileImageUrl(
        profile?.profileImage as (string | { $id: string; mimeType: string })[]
    )

    return {
        $id: profile?.$id,
        username: profile?.username,
        profileImage,
        isPrivateProfile: profile?.permissions.includes(IS_PRIVATE_PROFILE)
    }
}

export async function fetchProfileFromLocals({ locals, cookies }: RequestEvent) {
    const { profile, user } = locals
    const wasLoggedIn = Boolean(cookies.get('was_logged_in') === 'true')

    return {
        loggedInProfile: profile ?? undefined,
        loggedInUser: user ?? undefined,
        wasLoggedIn
    }
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

export async function fetchParamProfileData({
    params,
    locals
}: RequestEvent<import('../../routes/[profile]/$types').RouteParams, '/[profile]'>) {
    const { profile: loggedInProfile, user: loggedInUser } = locals ?? {}
    const { profile: profileParameter } = params

    const userProfileId = await adminGetSingleDocumentByQuery('main', 'profiles_username_map', [
        Query.equal('username', profileParameter)
    ])

    if (!userProfileId) {
        return redirect(302, routes?.feed)
    }

    const { userIsAdmin = false } = loggedInUser ?? {}
    const { isProfileOwner = false } = loggedInProfile ?? {}

    const [profilePromise, followStatusPromise] = isProfileOwner
        ? await Promise.allSettled([loggedInProfile, null])
        : await Promise.allSettled([
              getProfileById(userProfileId?.$id),
              loggedInProfile?.$id
                  ? adminGetSingleDocumentByQuery('main', 'follows', [
                        Query.and([
                            Query.equal('followerId', loggedInProfile.$id),
                            Query.equal('profileId', userProfileId?.$id)
                        ])
                    ])
                  : undefined
          ])

    const profile = unpackSettledPromise(profilePromise)
    const followStatus = getFollowStatus(followStatusPromise)

    if (!profile) {
        return redirect(302, routes?.feed)
    }

    // Future if logged in user is not the profile owner, check if they are a friend on current profile
    /**
     *  followerId: profile ID of the user who is following
     *  profileId: profile ID of the user who is being followed
     */

    return {
        profile,
        canViewProfile: isProfileOwner || userIsAdmin || followStatus === 'following',
        isProfileOwner,
        followStatus
    }
}
