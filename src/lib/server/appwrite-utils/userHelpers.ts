import { createAdminClient } from '$lib/server/appwrite-utils/appwrite.js'

const { users } = createAdminClient()

export const adminDeleteUser = async (userId: string) => {
    return users.delete(userId)
}

export const adminGetUser = async (userId: string) => {
    return users.get(userId)
}
