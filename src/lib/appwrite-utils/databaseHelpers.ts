import { createAdminClient } from '$lib/server/appwrite.js'
import { Databases, Query } from 'node-appwrite'

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

export const getSingleDocumentByQuery = async (
    database: Databases,
    databaseId: string,
    collectionId: string,
    queries: string[]
) => {
    const singleDocument = await database.listDocuments(databaseId, collectionId, queries)

    return singleDocument?.documents?.[0]
}
