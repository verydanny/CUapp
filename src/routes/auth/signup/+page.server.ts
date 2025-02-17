import { type ActionResult, type RequestEvent } from '@sveltejs/kit'
import {
    createAdminClient,
    deleteSessionCookies,
    setSessionCookies
} from '$lib/server/auth/appwrite.js'
import { redirect } from '@sveltejs/kit'
import { AppwriteException, ID } from 'node-appwrite'

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
                const [, getSession] = await Promise.all([
                    databases.createDocument('main', 'profiles', userId, {
                        permissions: []
                    }),
                    account.createEmailPasswordSession(email, password)
                ])

                setSessionCookies(cookies, getSession)

                return {
                    type: 'redirect',
                    status: 302,
                    location: '/'
                }
            } catch (err: unknown) {
                deleteSessionCookies(cookies)
                await users.delete(userId)

                if (err instanceof AppwriteException) {
                    return {
                        type: 'failure',
                        status: 400,
                        data: {
                            message: 'Error creating account, user might already exist?'
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
