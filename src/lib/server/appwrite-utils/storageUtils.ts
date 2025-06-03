import { APPWRITE_PROJECT_ID, APPWRITE_ENDPOINT } from '$env/static/public';

export const createBucketUrl = (bucketId: string, fileId: string) => {
    return (
        APPWRITE_ENDPOINT +
        '/storage/buckets/' +
        bucketId +
        '/files/' +
        fileId +
        '/view?project=' +
        APPWRITE_PROJECT_ID
    );
};
