import { decrypt } from '$lib/server/crypto.js'
import { createPublicAccountClient } from '$lib/server/appwrite.js'
import { MY_SALT } from '$env/static/private'

import type { PageServerLoadEvent } from './$types'

export async function load(req: PageServerLoadEvent) {
    const { url } = req
    const query = url.searchParams.get('query')
    const secret = url.searchParams.get('secret')
    const userId = url.searchParams.get('userId')

    // Todo: check if userId already verified

    if (query && secret && userId) {
        const { account } = createPublicAccountClient()

        try {
            await account.updateVerification(userId, secret)
        } catch (verificationError) {
            console.error(`email verification error: ${verificationError}`)
        }

        return {
            password: decrypt(query, MY_SALT)
        }
    }
}
