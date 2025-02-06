import { fail } from '@sveltejs/kit'
import { createAdminClient, setSessionCookies } from '$lib/server/auth/appwrite.js'
import { redirect } from '@sveltejs/kit'

export const load = async ({ locals }) => {
    if (locals.user) {
        redirect(302, '/user/account')
    }
}

export const actions = {
    signin: async ({ request, cookies }) => {
        // Extract the form data.
        const form = await request.formData()
        const email = form.get('email')
        const password = form.get('password')

        // Create the Appwrite client.
        const { account } = createAdminClient()

        if (typeof email !== 'string' || typeof password !== 'string') {
            return fail(400, {
                success: false,
                message: 'Invalid form data'
            })
        }

        const trySignin = async () => {
            try {
                const session = await account.createEmailPasswordSession(email, password)
                setSessionCookies(cookies, session)

                return {
                    success: true
                }
            } catch {
                return {
                    success: false,
                    message: 'Failed to sign in, sorry about that'
                }
            }
        }

        const result = await trySignin()

        if (result.success) {
            redirect(302, '/user/account')
        }

        return fail(400, result)
    }
}
