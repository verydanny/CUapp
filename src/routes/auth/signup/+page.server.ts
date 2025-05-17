import { type ActionResult, type RequestEvent } from '@sveltejs/kit'
import {
    cleanupUserSession,
    createAdminClient,
    setSessionCookies
} from '$lib/server/appwrite-utils/appwrite.js'
import { redirect } from '@sveltejs/kit'
import { AppwriteException, ID } from 'node-appwrite'

import type { RouteParams, ActionsExport } from './$types.ts'
import { normalizeRedirect } from '$lib/utils/redirect.js'
import {
    adminCreateDocumentWithUserPermissions,
    adminDeleteDocument
} from '$lib/server/appwrite-utils/databaseHelpers.js'
import { adminDeleteUser } from '$lib/server/appwrite-utils/userHelpers.js'
import {
    adminCreateEmailPasswordAccount,
    adminCreateEmailPasswordSession
} from '$lib/server/appwrite-utils/accountHelpers.js'

export const load = async ({ parent }) => {
    const data = await parent()

    if (data?.loggedInProfile?.username) {
        redirect(302, `/${data?.loggedInProfile?.username}`)
    }
}

export const actions: ActionsExport = {
    signup: async ({
        request,
        cookies
    }: RequestEvent<RouteParams, '/user/signup'>): Promise<
        ActionResult<undefined, { message: string }>
    > => {
        // Extract the form data.
        const form = await request.formData()
        const email = form.get('email')
        const password = form.get('password')

        // Create the Appwrite client.
        const { account } = createAdminClient()

        if (typeof email !== 'string' || typeof password !== 'string') {
            return {
                type: 'failure',
                status: 400,
                data: {
                    message: 'Missing email or password'
                }
            }
        }

        /**
         * Try to sign up the user.
         * @todo SCALING: Move this into Appwrite functions later, but no big deal until scaling.
         * @returns {Promise<{ success: boolean, message?: string }>}
         */
        const trySignup = async (): Promise<ActionResult<undefined, { message: string }>> => {
            const userId = ID.unique()

            try {
                await adminCreateEmailPasswordAccount(userId, email, password)

                // Parallelize account creation and profile creation
                // When user first signs up, we create a profile for them. The username is the same as the userId initially.
                const [, getSession] = await Promise.all([
                    adminCreateDocumentWithUserPermissions('main', 'profiles', userId, {
                        username: userId,
                        bio: null,
                        profileImage: []
                    }),
                    adminCreateEmailPasswordSession(email, password)
                ])

                setSessionCookies(cookies, getSession)

                return {
                    type: 'redirect',
                    status: 302,
                    location: '/'
                }
            } catch (err: unknown) {
                Promise.allSettled([
                    cleanupUserSession(cookies, account),
                    adminDeleteDocument('main', 'profiles', userId),
                    adminDeleteUser(userId)
                ])

                if (err instanceof AppwriteException) {
                    if (err.code === 409 || err.type === 'user_already_exists') {
                        return {
                            type: 'failure',
                            status: 400,
                            data: {
                                message:
                                    'This email might already be in use, or the password is not secure enough'
                            }
                        }
                    }

                    return {
                        type: 'failure',
                        status: 400,
                        data: {
                            message:
                                err?.message ?? 'Error creating account, user might already exist?'
                        }
                    }
                }

                return {
                    type: 'failure',
                    status: 500,
                    data: { message: 'Internal server error' }
                }
            }
        }

        return normalizeRedirect(await trySignup())
    }
}
