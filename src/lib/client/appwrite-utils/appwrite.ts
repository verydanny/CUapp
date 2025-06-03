import { Client, Account, Storage, Databases } from 'appwrite';
import { APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID } from '$env/static/public';

export function createUserSessionClient(session: string) {
    const client = new Client()
        .setEndpoint(APPWRITE_ENDPOINT)
        .setProject(APPWRITE_PROJECT_ID)
        .setSession(session);

    const account = new Account(client);
    const storage = new Storage(client);
    const database = new Databases(client);

    return {
        get client() {
            return client;
        },
        get account() {
            return account;
        },
        get storage() {
            return storage;
        },
        get database() {
            return database;
        }
    };
}
