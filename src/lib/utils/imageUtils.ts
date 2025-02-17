import type { Models } from 'node-appwrite'
import { createBucketUrl } from './storageUtils'

const priorityMap = {
    'image/avif': 'highest',
    'image/webp': 'high',
    'image/jpeg': 'medium',
    'image/png': 'low'
}
// Define a function to get the priority of an image mimeType.
const getPriority = (mimeType: string): string => {
    return priorityMap[mimeType as keyof typeof priorityMap] || 'low'
}

export const getProfileImageUrls = (profileImageFiles: Models.File[]) =>
    profileImageFiles?.reduce(
        (acc, file) => {
            const priority = getPriority(file.mimeType)
            return {
                ...acc,
                [priority]: {
                    url: createBucketUrl('profile-images', file.$id),
                    mimeType: file.mimeType
                }
            }
        },
        {} as Record<'highest' | 'high' | 'medium' | 'low', { url: string; mimeType: string }>
    )
