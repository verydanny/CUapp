// src/routes/signup/+page.server.js
import { fail, redirect } from '@sveltejs/kit'
import { verifyRegistrationResponse } from '@simplewebauthn/server'
import { isoUint8Array } from '@simplewebauthn/server/helpers'

import { RP_ID } from '$env/static/private'

import { expectedOrigin, REDIRECT } from '$lib/const'
import {
    AppwriteAuth,
    attemptToGenerateAuthenticationOptions,
    createRegistrationOptionsAndChallenge,
    prepareUserAndCreateCredential
} from '$lib/server/appwrite-auth'

import type { RequestEvent } from './$types'

const auth = new AppwriteAuth()

export async function load(req: RequestEvent) {
    const options = await attemptToGenerateAuthenticationOptions(auth, req.cookies)
    // Logged out users can't access this page.
    if (req.locals.user) redirect(302, '/user/account')

    // Pass the stored user local to the page.
    return {
        user: req.locals.user,
        ...options
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
         * @todo: Move this to an Appwrite Function to avoid blocking the main thread
         */
        const userOrErrorOrRedirect = await prepareUserAndCreateCredential(
            auth,
            username.toLowerCase()
        )

        if (userOrErrorOrRedirect.success) {
            const registrationOptionsOrError = await createRegistrationOptionsAndChallenge(
                auth,
                userOrErrorOrRedirect.body.user,
                username
            )

            if (registrationOptionsOrError.success) {
                return {
                    success: true,
                    body: registrationOptionsOrError.body
                }
            }

            return fail(400, registrationOptionsOrError.body)
        }

        if (userOrErrorOrRedirect.type === REDIRECT) {
            return redirect(userOrErrorOrRedirect?.body?.status, userOrErrorOrRedirect?.body?.url)
        }

        return fail(400, userOrErrorOrRedirect.body)
    },
    verifyPasskey: async (req: RequestEvent) => {
        const { challengeId, registration } = await req.request.json()

        try {
            const challenge = await auth.getChallenge(challengeId)

            try {
                const verification = await verifyRegistrationResponse({
                    response: registration,
                    expectedChallenge: challenge?.token,
                    expectedOrigin,
                    expectedRPID: RP_ID
                })

                const { verified, registrationInfo } = verification

                if (!verified) {
                    return fail(400, {
                        error: 'Registration verification failed.'
                    })
                }

                if (registrationInfo) {
                    await auth.createCredentials(challenge?.userId, {
                        credentialID: registrationInfo?.credential?.id,
                        credentialPublicKey: isoUint8Array.toHex(
                            registrationInfo?.credential?.publicKey
                        ),
                        counter: registrationInfo?.credential?.counter,
                        credentialDeviceType: registrationInfo?.credentialDeviceType,
                        credentialBackedUp: registrationInfo?.credentialBackedUp,
                        transports: registrationInfo?.credential?.transports
                    })
                    await auth.deleteChallenge(challenge.$id)

                    return {
                        success: true
                    }
                }
            } catch (error) {
                console.error('Registration verification failed.', error)
                return fail(400, {
                    error: 'Registration verification failed.'
                })
            }
        } catch (error) {
            console.error('Challenge not found. Please start over.', error)
            return fail(400, {
                error: 'Challenge not found. Please start over.'
            })
        }

        return fail(400, {
            error: 'Registration verification failed.'
        })
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
