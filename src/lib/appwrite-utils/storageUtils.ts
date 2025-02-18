import { PUBLIC_APPWRITE_PROJECT, PUBLIC_APPWRITE_ENDPOINT } from '$env/static/public'

export const createBucketUrl = (bucketId: string, fileId: string) => {
    return (
        PUBLIC_APPWRITE_ENDPOINT +
        '/storage/buckets/' +
        bucketId +
        '/files/' +
        fileId +
        '/view?project=' +
        PUBLIC_APPWRITE_PROJECT
    )
}
