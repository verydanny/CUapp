import { createBucketUrl } from './storageUtils.js';

const priorityMap = {
    'image/avif': 'highest',
    'image/webp': 'high',
    'image/jpeg': 'medium',
    'image/png': 'low'
};
// Define a function to get the priority of an image mimeType.
const getPriority = (mimeType: string): string => {
    return priorityMap[mimeType as keyof typeof priorityMap] || 'low';
};

export const getProfileImageUrls = (
    profileImageFiles: (string | { $id: string; mimeType: string })[]
) =>
    profileImageFiles?.reduce(
        (acc, file) => {
            if (typeof file === 'string') {
                file = JSON.parse(file) as { $id: string; mimeType: string };
            }

            const priority = getPriority(file.mimeType);
            return {
                ...acc,
                [priority]: {
                    url: file?.$id ? createBucketUrl('profile-images', file.$id) : undefined,
                    mimeType: file.mimeType
                }
            };
        },
        {} as Record<
            'highest' | 'high' | 'medium' | 'low',
            { url: string | undefined; mimeType: string }
        >
    );

export const getSingleProfileImageUrl = (
    profileImageFiles: (string | { $id: string; mimeType: string })[]
) => {
    const getAllProfileImageUrls = getProfileImageUrls(profileImageFiles);

    return (
        getAllProfileImageUrls?.highest?.url ||
        getAllProfileImageUrls?.high?.url ||
        getAllProfileImageUrls?.medium?.url ||
        getAllProfileImageUrls?.low?.url
    );
};
