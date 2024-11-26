import { Client, Users, ID, Databases, Query, type Models } from 'node-appwrite'
import { fail, type ActionFailure } from '@sveltejs/kit'
import {
    generateRegistrationOptions
    // verifyRegistrationResponse,
    // type GenerateRegistrationOptionsOpts
} from '@simplewebauthn/server'
// import { isoUint8Array } from '@simplewebauthn/server/helpers'

import { PUBLIC_APPWRITE_ENDPOINT, PUBLIC_APPWRITE_PROJECT } from '$env/static/public'
import { APPWRITE_KEY, RP_ID, RP_NAME } from '$env/static/private'

import type { AuthenticatorTransportFuture } from '@simplewebauthn/types'
import {
    ERROR,
    REDIRECT,
    SUCCESS,
    type ActionResultError,
    type ActionResultRedirect,
    type ActionResultSuccess
} from '$lib/const'

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
}

export async function prepareUserAndCreateCredential(
    auth: AppwriteAuth,
    email: string
): Promise<
    | ActionResultError
    | ActionResultSuccess<{ user: Models.User<Models.Preferences> }>
    | ActionResultRedirect
> {
    try {
        const user = await auth.prepareUser(email)
        const credentials = await auth.getCredential(user.$id)

        if (credentials) {
            return {
                success: true,
                type: REDIRECT,
                body: {
                    status: 303,
                    url: '/user/signin'
                }
            }
        }

        return {
            success: true,
            type: SUCCESS,
            body: {
                user
            }
        }
    } catch {
        // Todo: Handle error w/ Sentry or something
        return {
            success: false,
            type: ERROR,
            body: {
                error: 'Failed to prepare user and create credential.'
            }
        }
    }
}

export async function createRegistrationOptionsAndChallenge(
    auth: AppwriteAuth,
    user: Models.User<Models.Preferences>,
    username: string
): Promise<
    | ActionFailure<{
          error: string
      }>
    | {
          success: boolean
          body: {
              challengeId: string
              options: PublicKeyCredentialCreationOptionsJSON
          }
      }
> {
    try {
        const options = await generateRegistrationOptions({
            rpName: RP_NAME,
            rpID: RP_ID,
            // userID: userIdArrayBuffer,
            userName: username,
            attestationType: 'none',
            authenticatorSelection: {
                residentKey: 'preferred',
                userVerification: 'preferred',
                authenticatorAttachment: 'platform'
            }
        })
        const challenge = await auth.createChallenge(user.$id, options.challenge)

        return {
            success: true,
            body: {
                challengeId: challenge.$id,
                options
            }
        }
    } catch (e) {
        console.error('e', e)
        // Todo: Handle error w/ Sentry or something
        return fail(400, {
            error: 'Failed to create registration options and/or challenge.'
        })
    }
}
