import type { Models } from 'node-appwrite';

// Utility type to convert enum values to union types
type EnumToUnion<T> = T extends string ? T : never;

// Utility type to convert all enum properties in an object to union types
export type ConvertEnumsToUnions<T> = {
    [K in keyof T]: T[K] extends infer U
        ? U extends Record<string, infer V>
            ? EnumToUnion<V>
            : T[K]
        : T[K];
};

export type Email = `${string}@${string}.${string}`;

export type URL = `${string}://${string}.${string}`;

export enum ProfilesTypePermissions {
    'private' = 'private'
}

export interface ProfilesType {
    username: string;
    bio?: string;
    profileImage?: string[];
    permissions?: ProfilesTypePermissions;
}

export interface ProfilesDocument extends ProfilesType, Models.Document {}

export interface ImessageParticipantsType {
    userId: string;
    name: string;
    avatarFileId?: string;
}

export interface ImessageParticipantsDocument extends ImessageParticipantsType, Models.Document {}

export enum ImessageMessagesTypeDeliveryStatus {
    'sent' = 'sent',
    'delivered' = 'delivered',
    'read' = 'read'
}

export enum ImessageMessagesTypeMessageType {
    'text' = 'text',
    'image' = 'image'
}

export interface ImessageMessagesType {
    conversationId: string;
    messageId: string;
    participantDocId: string;
    content: string;
    timestamp: Date;
    timestampDisplay?: string;
    isEdited: boolean;
    screenshotIndex: number;
    deliveryStatus?: ImessageMessagesTypeDeliveryStatus;
    messageType?: ImessageMessagesTypeMessageType;
    imageUrl?: string;
    imageFileId?: string;
    imageAltText?: string;
}

export interface ImessageMessagesDocument extends ImessageMessagesType, Models.Document {}

export interface ImessageConversationType {
    postId: string;
    participantDocRefs: string[];
    rightSideParticipantDocRef: string;
    screenshotMessageIds: string[];
    totalScreenshots: number;
    conversationId: string;
}

export interface ImessageConversationDocument extends ImessageConversationType, Models.Document {}

export enum PostsTypeType {
    'imessageConversation' = 'imessageConversation',
    'imagePost' = 'imagePost',
    'textPost' = 'textPost'
}

export enum PostsTypeStatus {
    'published' = 'published',
    'draft' = 'draft',
    'archived' = 'archived'
}

export enum PostsTypeAccessLevel {
    'public' = 'public',
    'private' = 'private',
    'followers' = 'followers',
    'mutuals' = 'mutuals',
    'unlisted' = 'unlisted',
    'team' = 'team'
}

export interface PostsType {
    userId: string;
    type: PostsTypeType;
    tags?: string[];
    status: PostsTypeStatus;
    accessLevel: PostsTypeAccessLevel;
    contentRefId?: string;
    likesCount?: number;
    commentsCount?: number;
}

export interface PostsDocument extends PostsType, Models.Document {}

export interface TextPostType {
    postId: string;
    title: string;
    body: string;
    coverImageFileId?: string;
    coverImageAltText?: string;
    version?: number;
    estimatedReadTimeMinutes?: number;
    contentSchemaVersion?: string;
}

export interface TextPostDocument extends TextPostType, Models.Document {}
