import { fail, redirect } from '@sveltejs/kit'
import { generateAuthenticationOptions, verifyAuthenticationResponse } from '@simplewebauthn/server'
import { isoUint8Array } from '@simplewebauthn/server/helpers'

import { RP_ID, SESSION_COOKIE_NAME } from '$env/static/private'
import { AppwriteAuth } from '$lib/server/appwrite-auth'
import { createAdminClient } from '$lib/server/appwrite'

import type { RequestEvent } from './$types'

const auth = new AppwriteAuth()
const expectedOrigin =
    process.env.NODE_ENV === 'development' ? 'https://dev.' + RP_ID : 'https://' + RP_ID

export async function load({ locals }) {
    // Logged out users can't access this page.
    if (locals.user) redirect(302, '/user/account')

    // Pass the stored user local to the page.
    return {
        user: locals.user
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

        const user = await auth.prepareUser(username.toLowerCase())
        const credentials = await auth.getCredential(user?.$id)

        if (!credentials) {
            return fail(400, {
                error: 'You do not have passkey yet. Please sign up.'
            })
        }

        const authenticator = JSON.parse(credentials.credentials)
        const options = await generateAuthenticationOptions({
            rpID: RP_ID,
            // userVerification: 'preferred',
            allowCredentials: [
                {
                    id: authenticator?.credentialID,
                    transports: authenticator?.transports
                }
            ]
        })
        const challenge = await auth.createChallenge(user.$id, options.challenge)

        return {
            success: true,
            body: {
                challengeId: challenge.$id,
                options
            }
        }
    },
    verifyPasskey: async (req: RequestEvent) => {
        const { challengeId, authentication } = await req.request.json()
        const sessionClient = createAdminClient()

        const challenge = await auth.getChallenge(challengeId)
        const credentials = await auth.getCredential(challenge?.userId)

        if (!credentials) {
            return fail(400, {
                error: 'You do not have passkey yet. Please sign up.'
            })
        }

        const authenticator = JSON.parse(credentials.credentials)
        const verification = await verifyAuthenticationResponse({
            response: authentication,
            expectedChallenge: challenge?.token,
            expectedOrigin,
            expectedRPID: RP_ID,
            credential: {
                id: authenticator?.credentialID,
                publicKey: isoUint8Array.fromHex(authenticator?.credentialPublicKey),
                counter: authenticator?.counter,
                transports: authenticator?.transports
            }
        })

        const { verified } = verification
        if (!verified) {
            return fail(400, {
                error: 'Authentication failed. Incorrect passkey?'
            })
        }

        const token = await auth.users.createToken(challenge.userId, 64, 60)
        const session = await sessionClient.account.createSession(token?.userId, token?.secret)

        req.cookies.set(SESSION_COOKIE_NAME, session.secret, {
            sameSite: 'strict',
            expires: new Date(session.expire),
            secure: true,
            path: '/'
        })

        return redirect(302, '/user/account')

        // console.log('verifyPasskey')
        // console.log('challengeId', challengeId, 'authentication', authentication)
        // try {
        //
        //     console.log('challenge', challenge)
        //     try {
        //
        //         console.log('credentials', credentials)
        //         if (!credentials) {
        //             return fail(400, {
        //                 error: 'You do not have passkey yet. Please sign up.'
        //             })
        //         }
        //         const authenticator = JSON.parse(credentials.credentials)
        //         try {
        //             const verification = await verifyAuthenticationResponse({
        //                 response: authentication,
        //                 expectedChallenge: challenge?.token,
        //                 expectedOrigin,
        //                 expectedRPID: RP_ID,
        //                 credential: {
        //                     id: authenticator?.credentialID,
        //                     publicKey: isoUint8Array.fromHex(authenticator?.credentialPublicKey),
        //                     counter: authenticator?.counter,
        //                     transports: authenticator?.transports
        //                 }
        //             })
        //             const { verified } = verification
        //             console.log('verification', verification)
        //             if (!verified) {
        //                 return fail(400, {
        //                     error: 'Authentication failed. Incorrect passkey?'
        //                 })
        //             }
        //             const token = await auth.users.createToken(challenge.userId)
        //             // console.log('Token >>>', token)
        //             // const session = await auth.users.createSession(challenge.userId)
        //             // console.log('session', session)
        //             const session = await sessionClient.account.createSession(
        //                 token?.userId,
        //                 token?.secret
        //             )
        //             console.log('session >>>', session)
        //             req.cookies.set(SESSION_COOKIE_NAME, session.secret, {
        //                 sameSite: 'strict',
        //                 expires: new Date(session.expire),
        //                 secure: true,
        //                 path: '/'
        //             })
        //             // redirect(302, '/user/account')
        //             return {
        //                 success: true
        //             }
        //         } catch (error) {
        //             console.error('Authentication verification failed.', error)
        //             return fail(400, {
        //                 error: 'Authentication verification failed.'
        //             })
        //         }
        //     } catch (error) {
        //         console.error('Errors getting credentials', error)
        //         return fail(400, {
        //             error: 'Errors getting credentials'
        //         })
        //     }
        // } catch (error) {
        //     console.error(error)
        //     return fail(400, {
        //         error: 'Challenge not found. Please start over.'
        //     })
        // }
    }
}
