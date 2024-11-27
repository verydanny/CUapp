import { json } from '@sveltejs/kit'
import { generateAuthenticationOptions } from '@simplewebauthn/server'

import { AppwriteAuth } from '$lib/server/auth/appwrite-auth'
import { DEVICE_ID_COOKIE } from '$lib/const'
import { RP_ID } from '$env/static/private'

import type { AuthenticatorTransportFuture } from '@simplewebauthn/types'
import type { RequestEvent } from './$types'

const auth = new AppwriteAuth()

export const GET = async (req: RequestEvent) => {
    const cookies = req.cookies.get(DEVICE_ID_COOKIE)?.split(',')

    if (cookies) {
        const matchingCredentials = (await auth.getMatchingCredentials(cookies)).map(
            (credential) => {
                const authentication = JSON.parse(credential.credentials)

                return {
                    userId: credential.userId,
                    id: authentication.credentialID as string,
                    transports: authentication.transports as AuthenticatorTransportFuture[],
                    type: authentication.type
                }
            }
        )
        const userId = matchingCredentials[0].userId
        const options = await generateAuthenticationOptions({
            rpID: RP_ID,
            allowCredentials: matchingCredentials.map((credential) => ({
                id: credential.id,
                transports: credential.transports
            })),
            userVerification: 'preferred'
        })
        const challenge = await auth.createChallenge(userId, options.challenge)

        return json({
            challengeId: challenge.$id,
            options
        })
    }

    return new Response('OK')
}
