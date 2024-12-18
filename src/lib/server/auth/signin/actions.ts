import { isoUint8Array } from '@simplewebauthn/server/helpers'
import { verifyAuthenticationResponse, generateAuthenticationOptions } from '@simplewebauthn/server'

import { createAdminClient } from '$lib/server/auth/appwrite'
import { RP_ID, SESSION_COOKIE_NAME, ORIGIN } from '$env/static/private'

import { AppwriteAuth } from '$lib/server/auth/appwrite-auth'
import {
    ERROR,
    REDIRECT,
    SUCCESS,
    type ActionResultError,
    type ActionResultRedirect,
    type ActionResultSuccess
} from '$lib/const'

export async function signinPasskeyAction(
    auth: AppwriteAuth,
    username: string
): Promise<
    | ActionResultError
    | ActionResultSuccess<{
          credentialID: string
          options: PublicKeyCredentialRequestOptionsJSON
      }>
> {
    const user = await auth.prepareUser(username.toLowerCase())
    const credentials = await auth.getCredential(user?.$id)

    if (!credentials) {
        return {
            success: false,
            type: ERROR,
            body: {
                error: 'You do not have passkey yet. Please sign up.'
            }
        }
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

    return {
        success: true,
        type: SUCCESS,
        body: {
            credentialID: authenticator?.credentialID,
            options
        }
    }
}

export async function verifyPasskeyAction(
    auth: AppwriteAuth,
    req: import('../../../../routes/user/signin/$types').RequestEvent
): Promise<ActionResultError | ActionResultRedirect> {
    try {
        const {
            authentication = null,
            challenge = null,
            credentialID = null
        } = (await req.request.json()) || {}
        const sessionClient = createAdminClient()

        // const challenge = await auth.getChallenge(challengeId)
        const userId = await auth.getUserBasedOnCredentialId(credentialID)
        const credentials = await auth.getCredential(userId)

        // Lazily delete all challenges for the user
        // auth.deleteAllChallenges(challenge?.userId)

        if (!credentials) {
            return {
                success: false,
                type: ERROR,
                body: {
                    error: 'You do not have passkey yet. Please sign up.'
                }
            }
        }

        const authenticator = JSON.parse(credentials.credentials)
        const verification = await verifyAuthenticationResponse({
            response: authentication,
            expectedChallenge: challenge,
            expectedOrigin: ORIGIN,
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
            return {
                success: false,
                type: ERROR,
                body: {
                    error: 'Authentication failed. Incorrect passkey?'
                }
            }
        }

        const token = await auth.users.createToken(userId, 64, 60)
        const session = await sessionClient.account.createSession(token?.userId, token?.secret)

        req.cookies.set(SESSION_COOKIE_NAME, session.secret, {
            sameSite: 'strict',
            expires: new Date(session.expire),
            secure: true,
            path: '/'
        })

        return {
            type: REDIRECT,
            body: {
                status: 302,
                url: '/user/account'
            }
        }
    } catch {
        return {
            success: false,
            type: ERROR,
            body: {
                error: 'Authentication verification failed.'
            }
        }
    }
}
