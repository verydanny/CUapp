import { createAdminClient, createUserSessionClient } from '$lib/server/appwrite-utils/appwrite.js'
import type { RequestEvent } from '@sveltejs/kit'

const { account } = createAdminClient()

export const adminCreateEmailPasswordAccount = async (
    userId: string,
    email: string,
    password: string
) => {
    return account.create(userId, email, password)
}

export const adminCreateEmailPasswordSession = async (email: string, password: string) => {
    return account.createEmailPasswordSession(email, password)
}

export const clientDeleteEmailPasswordSession = async (request: RequestEvent) => {
    const { account } = createUserSessionClient(request)

    return account.deleteSession('current')
}
