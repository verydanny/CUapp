import { Client, Users, ID, Databases, Query } from 'node-appwrite'

import { PUBLIC_APPWRITE_ENDPOINT, PUBLIC_APPWRITE_PROJECT } from '$env/static/public'
import { APPWRITE_KEY } from '$env/static/private'

import type { AuthenticatorTransportFuture } from '@simplewebauthn/types'

/**
 * @todo: Move this to an Appwrite Function to avoid blocking the main thread. Also, add try/catch blocks.
 * @todo: Add support for multiple credentials (passkeys) per user.
 * @todo: Logging in on desktop browsers should not require a challenge/verification process. Instead, send a magic link email.
 */
export class AppwriteAuth {
    users: Users
    databases: Databases

    constructor() {
        const client = new Client()
            .setEndpoint(PUBLIC_APPWRITE_ENDPOINT)
            .setProject(PUBLIC_APPWRITE_PROJECT)
            .setKey(APPWRITE_KEY)

        this.users = new Users(client)
        this.databases = new Databases(client)
    }

    async prepareUser(email: string) {
        const reponse = await this.users.list([Query.equal('email', email), Query.limit(1)])
        const user = reponse.users[0] ?? null

        if (!user) {
            return this.users.create(ID.unique(), email)
        }

        return user
    }

    async createChallenge(userId: string, token: string) {
        return await this.databases.createDocument('main', 'challenges', ID.unique(), {
            userId: userId,
            token
        })
    }

    async deleteAllChallenges(userId: string) {
        try {
            const { documents = null } =
                (await this.databases.listDocuments('main', 'challenges', [
                    Query.equal('userId', userId)
                ])) || {}

            if (documents) {
                for (const document of documents) {
                    await this.deleteChallenge(document.$id)
                }
            }

            return {
                success: true
            }
        } catch {
            // Todo: Handle error w/ Sentry or something
            return {
                success: false,
                error: 'Failed to delete all challenges.'
            }
        }
    }

    async getChallenge(challengeId: string) {
        return await this.databases.getDocument('main', 'challenges', challengeId)
    }

    async deleteChallenge(challengeId: string) {
        return await this.databases.deleteDocument('main', 'challenges', challengeId)
    }

    async createCredentials(
        userId: string,
        credentials: {
            credentialID: string | undefined
            credentialPublicKey: string | undefined
            counter: number | undefined
            credentialDeviceType: string | undefined
            credentialBackedUp: boolean | undefined
            transports: AuthenticatorTransportFuture[] | undefined
        }
    ) {
        return await this.databases.createDocument('main', 'credentials', ID.unique(), {
            userId,
            credentials: JSON.stringify(credentials)
        })
    }

    async getCredential(userId: string) {
        const documents = (
            await this.databases.listDocuments('main', 'credentials', [
                Query.equal('userId', userId),
                Query.limit(1)
            ])
        ).documents

        return documents[0]
    }

    async getUserBasedOnCredentialId(credentialId: string) {
        const documents = await this.databases.listDocuments('main', 'credentials', [
            Query.contains('credentials', credentialId)
        ])

        return documents.documents[0].userId
    }

    async getMatchingCredentials(credentialId: string | string[]) {
        const documents = await this.databases.listDocuments('main', 'credentials', [
            Query.contains('credentials', credentialId)
        ])

        return documents.documents
    }
}
