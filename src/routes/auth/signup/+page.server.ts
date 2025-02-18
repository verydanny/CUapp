import { type ActionResult, type RequestEvent } from '@sveltejs/kit'
import {
    cleanupUserSession,
    createAdminClient,
    setSessionCookies
} from '$lib/server/auth/appwrite.js'
import { redirect } from '@sveltejs/kit'
import { AppwriteException, ID, Permission, Role } from 'node-appwrite'

import type { RouteParams, ActionsExport } from './$types'
import { normalizeRedirect } from '$lib/utils/redirect'

export const load = async ({
    locals
}: RequestEvent<RouteParams, '/user/signup'>): Promise<void> => {
    if (locals.user) {
        redirect(302, '/user/account')
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
        const { account, databases, users } = createAdminClient()

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
                await account.create(userId, email, password)

                // Parallelize account creation and profile creation
                // When user first signs up, we create a profile for them. The username is the same as the userId initially.
                const [, , getSession] = await Promise.all([
                    databases.createDocument(
                        'main',
                        'profiles',
                        userId,
                        {
                            username: userId,
                            bio: null,
                            permissions: [],
                            profileImage: [],
                            followers: [],
                            following: [userId]
                        },
                        [
                            Permission.read(Role.user(userId)),
                            Permission.update(Role.user(userId)),
                            Permission.delete(Role.user(userId))
                        ]
                    ),
                    databases.createDocument(
                        'main',
                        'profiles_username_map',
                        userId,
                        {
                            username: userId
                        },
                        [
                            Permission.read(Role.user(userId)),
                            Permission.update(Role.user(userId)),
                            Permission.delete(Role.user(userId))
                        ]
                    ),
                    account.createEmailPasswordSession(email, password)
                ])

                setSessionCookies(cookies, getSession)

                return {
                    type: 'redirect',
                    status: 302,
                    location: '/'
                }
            } catch (err: unknown) {
                await Promise.allSettled([
                    cleanupUserSession(cookies, account),
                    users.delete(userId)
                ])

                if (err instanceof AppwriteException) {
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
