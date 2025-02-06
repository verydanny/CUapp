import { Client, Account, Storage, Databases } from 'appwrite'
import { PUBLIC_APPWRITE_ENDPOINT, PUBLIC_APPWRITE_PROJECT } from '$env/static/public'

export function createUserSessionClient(session: string) {
    const client = new Client()
        .setEndpoint(PUBLIC_APPWRITE_ENDPOINT)
        .setProject(PUBLIC_APPWRITE_PROJECT)
        .setSession(session)

    const account = new Account(client)
    const storage = new Storage(client)
    const database = new Databases(client)

    return {
        get client() {
            return client
        },
        get account() {
            return account
        },
        get storage() {
            return storage
        },
        get database() {
            return database
        }
    }
}
