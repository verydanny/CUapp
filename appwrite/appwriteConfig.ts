import { type AppwriteConfig } from 'appwrite-utils'

const { PUBLIC_APPWRITE_ENDPOINT, PUBLIC_APPWRITE_PROJECT, APPWRITE_KEY } = Bun.env

const appwriteConfig: AppwriteConfig = {
    appwriteEndpoint: PUBLIC_APPWRITE_ENDPOINT as string,
    appwriteProject: PUBLIC_APPWRITE_PROJECT as string,
    appwriteKey: APPWRITE_KEY as string,
    enableBackups: true,
    backupInterval: 3600,
    backupRetention: 30,
    enableBackupCleanup: true,
    enableMockData: false,
    documentBucketId: 'documents',
    usersCollectionName: 'members',
    databases: [
        {
            $id: 'main',
            name: 'main',
            bucket: {
                $id: 'documents',
                name: 'documents',
                enabled: true,
                maximumFileSize: 30000000,
                allowedFileExtensions: [],
                compression: 'none',
                encryption: true,
                antivirus: true
            }
        }
    ],
    buckets: [
        {
            $id: 'profile-images',
            name: 'profile-images',
            enabled: true,
            maximumFileSize: 30000000,
            allowedFileExtensions: [],
            compression: 'none',
            encryption: false,
            antivirus: false
        },
        {
            $id: 'documents',
            name: 'documents',
            enabled: true,
            maximumFileSize: 30000000,
            allowedFileExtensions: []
        }
    ],
    functions: []
}

export default appwriteConfig
