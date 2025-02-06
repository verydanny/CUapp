import { createAdminClient } from '$lib/server/auth/appwrite.js'
import { Query } from 'node-appwrite'

export const isNotUniqueAttribute = async (
    database: string,
    collection: string,
    attribute: string,
    value: string
) => {
    const { databases } = createAdminClient()

    const existingUsers = await databases.listDocuments(database, collection, [
        Query.equal(attribute, value)
    ])

    return existingUsers?.documents?.length > 0
}

export const isUniqueAttribute = async (
    database: string,
    collection: string,
    attribute: string,
    value: string
) => {
    return !isNotUniqueAttribute(database, collection, attribute, value)
}
