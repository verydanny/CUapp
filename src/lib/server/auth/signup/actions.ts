import {
    generateRegistrationOptions,
    verifyRegistrationResponse,
    generateAuthenticationOptions
} from '@simplewebauthn/server'
import { isoUint8Array } from '@simplewebauthn/server/helpers'

import { createAdminClient } from '$lib/server/auth/appwrite'
import { type AppwriteAuth } from '$lib/server/auth/appwrite-auth'
import { RP_ID, RP_NAME, ORIGIN, SESSION_COOKIE_NAME } from '$env/static/private'
import { signinPasskeyAction } from '$lib/server/auth/signin/actions'

import {
    ERROR,
    SUCCESS,
    type ActionResultError,
    type ActionResultRedirect,
    type ActionResultSuccess
} from '$lib/const'
import type { EmptyObject } from '$lib/types'
import type { RequestEvent } from '@sveltejs/kit'

export async function signupPasskeyAction(
    auth: AppwriteAuth,
    username: string
): Promise<
    | ActionResultError
    | ActionResultRedirect
    | Awaited<ReturnType<typeof signinPasskeyAction>>
    | ActionResultSuccess<
          'signupPasskeyAction',
          {
              challengeId: string
              options: PublicKeyCredentialCreationOptionsJSON
          }
      >
> {
    try {
        const user = await auth.prepareUser(username)
        const credentials = await auth.getCredential(user?.$id)

        if (!user) {
            return {
                type: ERROR,
                body: {
                    error: 'User not found.'
                }
            }
        }

        if (credentials) {
            // const authenticator = JSON.parse(credentials.credentials)

            return signinPasskeyAction(auth, undefined, user?.$id)
            // const options = await generateAuthenticationOptions({
            //     rpID: RP_ID,
            //     // userVerification: 'preferred',
            //     allowCredentials: [
            //         {
            //             id: authenticator?.credentialID,
            //             transports: authenticator?.transports
            //         }
            //     ]
            // })

            // return {
            //     type: SUCCESS,
            //     name: 'signinPasskeyAction',
            //     body: {
            //         credentialID: authenticator?.credentialID,
            //         options
            //     }
            // }
        }

        try {
            const options = await generateRegistrationOptions({
                rpName: RP_NAME,
                rpID: RP_ID,
                // userID: userIdArrayBuffer,
                userName: username,
                attestationType: 'none',
                authenticatorSelection: {
                    residentKey: 'preferred',
                    userVerification: 'preferred',
                    authenticatorAttachment: 'platform'
                },
                extensions: {
                    prf: {
                        eval: {
                            first: isoUint8Array.toHex(
                                new TextEncoder().encode('Foo encryption key')
                            )
                        }
                    }
                }
            })
            const challenge = await auth.createChallenge(user.$id, options.challenge)

            return {
                type: SUCCESS,
                name: 'signupPasskeyAction',
                body: {
                    challengeId: challenge.$id,
                    options
                }
            }
        } catch (e) {
            console.error('Failed to create registration options and/or challenge.', e)
            // Todo: Handle error w/ Sentry or something
            return {
                type: ERROR,
                body: {
                    error: 'Failed to create registration options and/or challenge.'
                }
            }
        }
    } catch (e) {
        console.error('Failed to prepare user and create credential.', e)
        // Todo: Handle error w/ Sentry or something
        return {
            type: ERROR,
            body: {
                error: 'Failed to prepare user and create credential.'
            }
        }
    }
}

export async function verifySignupPasskeyAction(
    auth: AppwriteAuth,
    req: RequestEvent
): Promise<ActionResultError | Awaited<ReturnType<typeof signinPasskeyAction>>> {
    try {
        const { challengeId, registration } = await req.request.json()
        const challenge = await auth.getChallenge(challengeId)
        const verification = await verifyRegistrationResponse({
            response: registration,
            expectedChallenge: challenge?.token,
            expectedOrigin: ORIGIN,
            expectedRPID: RP_ID
        })

        console.log('registration', registration)

        const { verified, registrationInfo } = verification
        if (!verified) {
            return {
                type: ERROR,
                body: {
                    error: 'Registration verification failed.'
                }
            }
        }

        console.log('registrationInfo', registrationInfo)

        if (registrationInfo) {
            await auth.createCredentials(challenge?.userId, {
                credentialID: registrationInfo?.credential?.id,
                credentialPublicKey: isoUint8Array.toHex(registrationInfo?.credential?.publicKey),
                attestationObject: isoUint8Array.toHex(registrationInfo?.attestationObject),
                counter: registrationInfo?.credential?.counter,
                credentialDeviceType: registrationInfo?.credentialDeviceType,
                credentialBackedUp: registrationInfo?.credentialBackedUp,
                transports: registrationInfo?.credential?.transports,
                extensions: registrationInfo?.authenticatorExtensionResults
            })
            await auth.deleteChallenge(challenge.$id)

            // const sessionClient = createAdminClient()
            // const token = await auth.users.createToken(challenge?.userId, 64, 60)
            // const session = await sessionClient.account.createSession(token?.userId, token?.secret)

            // req.cookies.set(SESSION_COOKIE_NAME, session.secret, {
            //     sameSite: 'strict',
            //     expires: new Date(session.expire),
            //     secure: true,
            //     path: '/'
            // })

            return signinPasskeyAction(auth, undefined, challenge?.userId)
        }
    } catch {
        return {
            type: ERROR,
            body: {
                error: `Challenge not found, verification failed, or failed to create credentials. Please start over.`
            }
        }
    }

    return {
        type: ERROR,
        body: {
            error: 'Registration verification failed for unknown reason.'
        }
    }
}
