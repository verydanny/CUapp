import { fail, redirect } from '@sveltejs/kit'

import { AppwriteAuth } from '$lib/server/auth/appwrite-auth'
import { verifySigninPasskeyAction, signinPasskeyAction } from '$lib/server/auth/signin/actions'
import { loadAuthenticationOptions } from '$lib/server/auth/load'
import { REDIRECT, SUCCESS } from '$lib/const'

import type { RequestEvent } from './$types'

const auth = new AppwriteAuth()

export async function load(req: RequestEvent) {
    const options = await loadAuthenticationOptions(auth, req.cookies)
    // Logged out users can't access this page.
    if (req.locals.user) redirect(302, '/user/account')

    if (options) {
        return {
            user: req.locals.user,
            options
        }
    }

    // Pass the stored user local to the page.
    return {
        user: req.locals.user
    }
}

export const actions = {
    signin: async (req: RequestEvent) => {
        const {
            request
            // cookies
        } = req

        // Extract the form data.
        const form = await request.formData()
        const username = form.get('username')

        if (!username) {
            return fail(400, {
                error: 'Missing required fields'
            })
        }

        if (typeof username !== 'string') {
            return fail(400, {
                error: 'Invalid form data'
            })
        }

        const signinPasskeyActionResult = await signinPasskeyAction(auth, username)

        if (signinPasskeyActionResult.type === SUCCESS) {
            return signinPasskeyActionResult
        }

        return fail(400, signinPasskeyActionResult.body)
    },
    verifySigninPasskey: async (req: RequestEvent) => {
        const verifyPasskeyResult = await verifySigninPasskeyAction(auth, req)

        // Successfully verified passkey, redirect to the account page
        if (verifyPasskeyResult.type === REDIRECT) {
            return redirect(verifyPasskeyResult.body.status, verifyPasskeyResult.body.url)
        }

        return fail(400, verifyPasskeyResult.body)
    }
}
