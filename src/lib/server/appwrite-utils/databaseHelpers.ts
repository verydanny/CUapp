import { createAdminClient } from '$lib/server/appwrite-utils/appwrite.js'
import { Permission, Query, Role, type Models } from 'node-appwrite'

const { databases } = createAdminClient()

export const isNotUniqueAttribute = async (
    database: string,
    collection: string,
    attribute: string,
    value: string
): Promise<boolean> => {
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
): Promise<boolean> => {
    return !isNotUniqueAttribute(database, collection, attribute, value)
}

export const adminGetSingleDocumentByQuery = async (
    databaseId: string,
    collectionId: string,
    queries: string[]
): Promise<Models.Document | null> => {
    const singleDocument = await databases.listDocuments(databaseId, collectionId, queries)

    return singleDocument?.documents?.[0] || null
}

export const adminCreateDocumentWithUserPermissions = async (
    databaseId: string,
    collectionId: string,
    documentId: string,
    document: Record<string, unknown>,
    userId?: string
): Promise<Models.Document> => {
    if (userId) {
        return databases.createDocument(databaseId, collectionId, documentId, document, [
            Permission.read(Role.user(userId)),
            Permission.update(Role.user(userId)),
            Permission.delete(Role.user(userId))
        ])
    }

    return databases.createDocument(databaseId, collectionId, documentId, document, [
        Permission.read(Role.user(documentId)),
        Permission.update(Role.user(documentId)),
        Permission.delete(Role.user(documentId))
    ])
}

export const adminDeleteDocument = async (
    databaseId: string,
    collectionId: string,
    documentId: string
) => {
    return databases.deleteDocument(databaseId, collectionId, documentId)
}

export const adminUpdateDocument = async (
    databaseId: string,
    collectionId: string,
    documentId: string,
    document: Record<string, unknown>
) => {
    return databases.updateDocument(databaseId, collectionId, documentId, document)
}
