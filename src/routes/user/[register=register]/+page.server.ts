import { fail } from '@sveltejs/kit'
import { createAdminClient } from '$lib/server/auth/appwrite.js'
import { SESSION_COOKIE_NAME } from '$env/static/private'
import { redirect } from '@sveltejs/kit'
import {
    ID,
    Query
    // OAuthProvider
} from 'node-appwrite'

export const load = async ({ url, locals }) => {
    const pageType = url.pathname.split('/').pop()

    if (pageType === 'signupusername') {
        if (!locals.user) {
            return redirect(302, '/user/signin')
        }
    }

    return {
        pageType,
        userId: locals?.user?.$id,
        messaging:
            pageType === 'signup'
                ? 'Sign Up'
                : pageType === 'signin'
                  ? 'Sign In'
                  : 'Register Username'
    }
}

export const actions = {
    signup: async ({ request, cookies }) => {
        // Extract the form data.
        const form = await request.formData()
        const email = form.get('email')
        const password = form.get('password')

        // Create the Appwrite client.
        const { account } = createAdminClient()

        if (typeof email !== 'string' || typeof password !== 'string') {
            return {
                success: false,
                message: 'Invalid form data'
            }
        }

        try {
            // Create the session using the client
            await account.create(ID.unique(), email, password)
        } catch {
            return fail(400, {
                success: false,
                message: 'User probably already exists'
            })
        }

        const session = await account.createEmailPasswordSession(email, password)
        cookies.set(SESSION_COOKIE_NAME, session.secret, {
            sameSite: 'strict',
            expires: new Date(session.expire),
            secure: true,
            path: '/'
        })

        // Redirect to the account page.
        redirect(302, '/user/signupusername')
    },
    signupusername: async ({ request, locals }) => {
        // Extract the form data.
        const form = await request.formData()
        const username = form.get('username')

        if (typeof username !== 'string' || !locals?.user?.$id) {
            return {
                success: false,
                message: 'Invalid form data'
            }
        }

        const { databases } = createAdminClient()

        const existingUsers = await databases.listDocuments('main', 'profiles', [
            Query.equal('username', username)
        ])

        if (existingUsers?.documents?.length > 0) {
            return fail(400, {
                success: false,
                message: `Username "${username}" already taken`
            })
        }

        await databases.createDocument('main', 'profiles', ID.unique(), {
            username: username,
            userId: locals.user.$id
        })

        redirect(302, '/user/account')
    },
    signin: async ({ request, cookies }) => {
        // Extract the form data.
        const form = await request.formData()
        const email = form.get('email')
        const password = form.get('password')

        // Create the Appwrite client.
        const { account } = createAdminClient()

        if (typeof email !== 'string' || typeof password !== 'string') {
            return {
                success: false,
                message: 'Invalid form data'
            }
        }

        // Create the session using the client
        const session = await account.createEmailPasswordSession(email, password)
        cookies.set(SESSION_COOKIE_NAME, session.secret, {
            sameSite: 'strict',
            expires: new Date(session.expire),
            secure: true,
            path: '/'
        })

        // Redirect to the account page.
        redirect(302, '/user/account')
    }
}
