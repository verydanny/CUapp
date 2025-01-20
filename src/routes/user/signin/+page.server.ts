// src/routes/signin/+page.server.js
import { fail, redirect } from '@sveltejs/kit'

import { REDIRECT, SUCCESS } from '$lib/const'
import { AppwriteAuth } from '$lib/server/auth/appwrite-auth'
import { signupPasskeyAction, verifySignupPasskeyAction } from '$lib/server/auth/signup/actions'
import { verifySigninPasskeyAction, signinPasskeyAction } from '$lib/server/auth/signin/actions'
import { loadAuthenticationOptions } from '$lib/server/auth/load'

import type { RequestEvent } from './$types'
import type { Models } from 'node-appwrite'

const auth = new AppwriteAuth()

export async function load(req: RequestEvent): Promise<{
    user: Models.User<Models.Preferences> | undefined
    options: Awaited<ReturnType<typeof loadAuthenticationOptions>>
}> {
    const options = await loadAuthenticationOptions(auth, req.cookies)
    // Logged out users can't access this page.
    // if (req.locals.user) redirect(302, '/user/account')

    // Pass the stored user local to the page.
    return {
        user: req.locals.user,
        options
    }
}

export const actions = {
    signup: async (req: RequestEvent) => {
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
        /**
         * @todo: Allow for magic link email signup
         */

        /**
         * @todo: Move this to an Appwrite Function to avoid blocking the main thread
         */
        const signupPasskeyActionResult = await signupPasskeyAction(auth, username.toLowerCase())

        if (signupPasskeyActionResult.type === SUCCESS) {
            return signupPasskeyActionResult
        }

        if (signupPasskeyActionResult.type === REDIRECT) {
            return redirect(
                signupPasskeyActionResult?.body?.status,
                signupPasskeyActionResult?.body?.url
            )
        }

        return fail(400, signupPasskeyActionResult.body)
    },
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
    verifySignupPasskey: async (req: RequestEvent) => {
        const verifyPasskeyResult = await verifySignupPasskeyAction(auth, req)

        if (verifyPasskeyResult.type === SUCCESS) {
            return verifyPasskeyResult
        }

        return fail(400, verifyPasskeyResult.body)
    },
    verifySigninPasskey: async (req: RequestEvent) => {
        const verifyPasskeyResult = await verifySigninPasskeyAction(auth, req)

        // Successfully verified passkey, redirect to the account page
        if (verifyPasskeyResult.type === SUCCESS) {
            return verifyPasskeyResult
        }

        return fail(400, verifyPasskeyResult.body)
    }
}
// Old flow
// export const actions = {
// 	signup: async (req: RequestEvent) => {
// 		// Create the Appwrite client.
// 		const { account } = createAdminClient();
// 		const password = generatePassword(16, 48);
// 		const encryptedPassword = encodeURIComponent(encrypt(password, MY_SALT));

// 		// Create the session using the client
// 		await account.create(ID.unique(), email, password);
// 		const session = await account.createEmailPasswordSession(email, password);

// 		const verificationUrl = `http://localhost:5173/user/verify?query=${encryptedPassword}`;

// 		// Set the session cookie with the secret
// 		cookies.set(SESSION_COOKIE, session.secret, {
// 			sameSite: 'strict',
// 			expires: new Date(session.expire),
// 			secure: true,
// 			path: '/'
// 		});

// 		const sessionClient = createSessionClient(req);

// 		try {
// 			await sessionClient.account.createVerification(verificationUrl);
// 		} catch (error) {
// 			console.error('Error creating verification:', error);
// 		}

// 		// Redirect to the account page.
// 		// redirect(302, '/user/account');
// 	}
// }
