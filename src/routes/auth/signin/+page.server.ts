import { fail } from '@sveltejs/kit'
import { setSessionCookies } from '$lib/server/appwrite-utils/appwrite.js'
import { redirect } from '@sveltejs/kit'
import { adminCreateEmailPasswordSession } from '$lib/server/appwrite-utils/accountHelpers.js'

export const load = async ({ parent }) => {
    const data = await parent()

    if (data?.loggedInProfile?.username) {
        redirect(302, `/${data?.loggedInProfile?.username}`)
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
                cookies.set('was_logged_in', 'true', {
                    httpOnly: true,
                    sameSite: 'strict',
                    // 10 Day expiration
                    expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 10),
                    secure: true,
                    path: '/'
                })

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
