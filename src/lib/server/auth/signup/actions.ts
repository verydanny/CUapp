import { type Models } from 'node-appwrite'
import { generateRegistrationOptions, verifyRegistrationResponse } from '@simplewebauthn/server'
import { isoUint8Array } from '@simplewebauthn/server/helpers'

import { type AppwriteAuth } from '$lib/server/auth/appwrite-auth'
import { RP_ID, RP_NAME, ORIGIN } from '$env/static/private'

import {
    ERROR,
    REDIRECT,
    SUCCESS,
    type ActionResultError,
    type ActionResultRedirect,
    type ActionResultSuccess
} from '$lib/const'
import type { EmptyObject } from '$lib/types'

export async function createRegistrationOptionsAndChallenge(
    auth: AppwriteAuth,
    user: Models.User<Models.Preferences>,
    username: string
): Promise<
    | ActionResultError
    | ActionResultSuccess<{ challengeId: string; options: PublicKeyCredentialCreationOptionsJSON }>
> {
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
            }
        })
        const challenge = await auth.createChallenge(user.$id, options.challenge)

        return {
            success: true,
            type: SUCCESS,
            body: {
                challengeId: challenge.$id,
                options
            }
        }
    } catch {
        // Todo: Handle error w/ Sentry or something
        return {
            success: false,
            type: ERROR,
            body: {
                error: 'Failed to create registration options and/or challenge.'
            }
        }
    }
}

export async function signupPasskeyAction(
    auth: AppwriteAuth,
    username: string
): Promise<
    | ActionResultError
    | ActionResultRedirect
    | ActionResultSuccess<{
          challengeId: string
          options: PublicKeyCredentialCreationOptionsJSON
      }>
> {
    try {
        const user = await auth.prepareUser(username)
        const credentials = await auth.getCredential(user.$id)

        if (credentials) {
            return {
                type: REDIRECT,
                body: {
                    status: 303,
                    url: '/user/signin'
                }
            }
        }

        return createRegistrationOptionsAndChallenge(auth, user, username)
    } catch {
        // Todo: Handle error w/ Sentry or something
        return {
            success: false,
            type: ERROR,
            body: {
                error: 'Failed to prepare user and create credential.'
            }
        }
    }
}

export async function verifyPasskeyAction(
    auth: AppwriteAuth,
    req: import('../../../../routes/user/signup/$types').RequestEvent
): Promise<ActionResultError | ActionResultSuccess<EmptyObject>> {
    try {
        const { challengeId, registration } = await req.request.json()
        const challenge = await auth.getChallenge(challengeId)
        const verification = await verifyRegistrationResponse({
            response: registration,
            expectedChallenge: challenge?.token,
            expectedOrigin: ORIGIN,
            expectedRPID: RP_ID
        })

        const { verified, registrationInfo } = verification
        if (!verified) {
            return {
                success: false,
                type: ERROR,
                body: {
                    error: 'Registration verification failed.'
                }
            }
        }

        if (registrationInfo) {
            await auth.createCredentials(challenge?.userId, {
                credentialID: registrationInfo?.credential?.id,
                credentialPublicKey: isoUint8Array.toHex(registrationInfo?.credential?.publicKey),
                counter: registrationInfo?.credential?.counter,
                credentialDeviceType: registrationInfo?.credentialDeviceType,
                credentialBackedUp: registrationInfo?.credentialBackedUp,
                transports: registrationInfo?.credential?.transports
            })
            await auth.deleteChallenge(challenge.$id)

            return {
                success: true,
                type: SUCCESS,
                body: {}
            }
        }
    } catch {
        return {
            success: false,
            type: ERROR,
            body: {
                error: `Challenge not found, verification failed, or failed to create credentials. Please start over.`
            }
        }
    }

    return {
        success: false,
        type: ERROR,
        body: {
            error: 'Registration verification failed for unknown reason.'
        }
    }
}
