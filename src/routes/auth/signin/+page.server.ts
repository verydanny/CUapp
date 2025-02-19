import { fail } from '@sveltejs/kit'
import { setSessionCookies } from '$lib/server/appwrite-utils/appwrite.js'
import { redirect } from '@sveltejs/kit'
import { adminCreateEmailPasswordSession } from '$lib/server/appwrite-utils/accountHelpers.js'

export const load = async ({ locals }) => {
    if (locals.user) {
        redirect(302, `/${locals?.profile?.username}`)
    }
}

export const actions = {
    signin: async ({ request, cookies }) => {
        // Extract the form data.
        const form = await request.formData()
        const email = form.get('email')
        const password = form.get('password')

        if (typeof email !== 'string' || typeof password !== 'string') {
            return fail(400, {
                success: false,
                message: 'Invalid form data'
            })
        }

        const trySignin = async () => {
            try {
                const session = await adminCreateEmailPasswordSession(email, password)
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

        // In the future, we should redirect to the feed.
        if (result.success) {
            redirect(302, '/')
        }

        return fail(400, result)
    }
}
