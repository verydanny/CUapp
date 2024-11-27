import { generateAuthenticationOptions } from '@simplewebauthn/server'

import { RP_ID, DEVICE_ID_COOKIE } from '$env/static/private'

import type { AuthenticatorTransportFuture } from '@simplewebauthn/types'
import type { AppwriteAuth } from '$lib/server/auth/appwrite-auth'

/**
 *
 * @description This doesn't return standared {ActionResultError | ActionResultRedirect | ActionResultSuccess}
 * because it's used in load() functions, not actions.
 */
export async function loadAuthenticationOptions(
    auth: AppwriteAuth,
    cookies: import('@sveltejs/kit').Cookies
): Promise<null | PublicKeyCredentialRequestOptionsJSON> {
    try {
        const cookieArray = cookies.get(DEVICE_ID_COOKIE)?.split(',')

        if (cookieArray) {
            const matchingCredentialsDocuments = await auth.getMatchingCredentials(cookieArray)
            const matchingCredentials = matchingCredentialsDocuments.map((credential) => {
                const authentication = JSON.parse(credential.credentials)

                return {
                    userId: credential.userId,
                    id: authentication.credentialID as string,
                    transports: authentication.transports as AuthenticatorTransportFuture[],
                    type: authentication.type
                }
            })

            const options = await generateAuthenticationOptions({
                rpID: RP_ID,
                allowCredentials: matchingCredentials.map((credential) => ({
                    id: credential.id,
                    transports: credential.transports
                })),
                userVerification: 'preferred'
            })

            return options
        }
    } catch {
        return null
    }

    return null
}
