import { Client, Account, Storage } from 'appwrite'
import { PUBLIC_APPWRITE_ENDPOINT, PUBLIC_APPWRITE_PROJECT } from '$env/static/public'

export function createSessionClient(session: string) {
    const client = new Client()
        .setEndpoint(PUBLIC_APPWRITE_ENDPOINT)
        .setProject(PUBLIC_APPWRITE_PROJECT)

    const account = new Account(client)
    const storage = new Storage(client)

    return {
        get client() {
            return client
        },
        get account() {
            return account
        },
        get storage() {
            return storage
        }
    }
}
