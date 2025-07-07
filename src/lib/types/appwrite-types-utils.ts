import type { Models } from 'node-appwrite';

export type WithoutDocument<T extends Models.Document> = Omit<
    T,
    '$id' | '$collectionId' | '$databaseId' | '$createdAt' | '$updatedAt' | '$permissions'
>;
