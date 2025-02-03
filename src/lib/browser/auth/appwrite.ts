import { Client } from 'appwrite'
import { PUBLIC_APPWRITE_ENDPOINT, PUBLIC_APPWRITE_PROJECT } from '$env/static/public'

export function createSessionClient() {
    const client = new Client()
        .setEndpoint(PUBLIC_APPWRITE_ENDPOINT)
        .setProject(PUBLIC_APPWRITE_PROJECT)

    return {
        client
    }
}
