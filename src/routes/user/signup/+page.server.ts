import { fail } from '@sveltejs/kit'
import { createAdminClient, setSessionCookies } from '$lib/server/auth/appwrite.js'
import { redirect } from '@sveltejs/kit'
import { ID } from 'node-appwrite'

export const load = async ({ locals }) => {
    if (locals.user) {
        redirect(302, '/user/account')
    }
}

export const actions = {
    signup: async ({ request, cookies }) => {
        // Extract the form data.
        const form = await request.formData()
        const email = form.get('email')
        const password = form.get('password')

        // Create the Appwrite client.
        const { account, databases } = createAdminClient()

        if (typeof email !== 'string' || typeof password !== 'string') {
            return fail(400, {
                success: false,
                message: 'Missing email or password'
            })
        }

        const trySignup = async () => {
            try {
                const userId = ID.unique()
                await account.create(userId, email, password)

                // Parallelize document creation and session creation
                const [, session] = await Promise.all([
                    databases.createDocument('main', 'profiles', userId, {
                        userId
                    }),
                    account.createEmailPasswordSession(email, password)
                ])

                setSessionCookies(cookies, session)

                return {
                    success: true
                }
            } catch {
                return {
                    success: false,
                    message: 'Failed to register user, sorry about that'
                }
            }
        }

        const result = await trySignup()

        if (result.success) {
            redirect(302, '/user/set-username')
        }

        return fail(400, result)
    }
}
