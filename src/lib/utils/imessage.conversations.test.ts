import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    type iMessageMessage,
    type iMessageParticipant,
    type iMessageConversation,
    getMessagesForConversation,
    getParticipantsForConversation
} from './imessage.utils.js';
import type { Models } from 'appwrite';

const baseMockConversation: iMessageConversation = {
    conversationId: 'conv123',
    postId: 'postXYZ',
    participantDocRefs: ['part1', 'part2'],
    rightSideParticipantDocRef: 'part1',
    screenshotMessageIds: ['msgA', 'msgB', 'msgC'],
    totalScreenshots: 1
};

const _mockMessages: iMessageMessage[] = [
    // Prefixed with _ to indicate it's intentionally unused
    {
        conversationId: 'conv123',
        messageId: 'msgA',
        participantDocId: 'part1',
        content: 'First message',
        timestamp: new Date().toISOString(),
        isEdited: false,
        screenshotIndex: 0,
        $id: '',
        $collectionId: '',
        $databaseId: '',
        $createdAt: '',
        $updatedAt: '',
        $permissions: []
    },
    {
        conversationId: 'conv123',
        messageId: 'msgB',
        participantDocId: 'part2',
        content: 'Second message',
        timestamp: new Date().toISOString(),
        isEdited: false,
        screenshotIndex: 1,
        $id: '',
        $collectionId: '',
        $databaseId: '',
        $createdAt: '',
        $updatedAt: '',
        $permissions: []
    },
    {
        conversationId: 'conv123',
        messageId: 'msgC',
        participantDocId: 'part1',
        content: 'Third message',
        timestamp: new Date().toISOString(),
        isEdited: false,
        screenshotIndex: 2,
        $id: '',
        $collectionId: '',
        $databaseId: '',
        $createdAt: '',
        $updatedAt: '',
        $permissions: []
    },
    {
        conversationId: 'otherConv',
        messageId: 'msgD',
        participantDocId: 'partX',
        content: 'Message in another conversation',
        timestamp: new Date().toISOString(),
        isEdited: false,
        screenshotIndex: 0,
        $id: '',
        $collectionId: '',
        $databaseId: '',
        $createdAt: '',
        $updatedAt: '',
        $permissions: []
    }
];

const _mockParticipants: iMessageParticipant[] = [
    // Prefixed with _ to indicate it's intentionally unused
    {
        userId: 'userA',
        name: 'Alice',
        avatarFileId: 'fileA',
        $id: 'part1',
        $collectionId: '',
        $databaseId: '',
        $createdAt: '',
        $updatedAt: '',
        $permissions: []
    },
    {
        userId: 'userB',
        name: 'Bob',
        avatarFileId: 'fileB',
        $id: 'part2',
        $collectionId: '',
        $databaseId: '',
        $createdAt: '',
        $updatedAt: '',
        $permissions: []
    },
    {
        userId: 'userC',
        name: 'Charlie',
        avatarFileId: 'fileC',
        $id: 'part3',
        $collectionId: '',
        $databaseId: '',
        $createdAt: '',
        $updatedAt: '',
        $permissions: []
    }
];

describe('iMessage Conversation Model Structure', () => {
    it('should have the correct structure and types', () => {
        const mockConversation: iMessageConversation = { ...baseMockConversation };

        expect(mockConversation).toBeDefined();
        expect(typeof mockConversation.conversationId).toBe('string');
        expect(Array.isArray(mockConversation.participantDocRefs)).toBe(true);
        expect(mockConversation.participantDocRefs.every((ref) => typeof ref === 'string')).toBe(
            true
        );
        expect(typeof mockConversation.rightSideParticipantDocRef).toBe('string');
        expect(Array.isArray(mockConversation.screenshotMessageIds)).toBe(true);
        expect(mockConversation.screenshotMessageIds.every((id) => typeof id === 'string')).toBe(
            true
        );
        expect(typeof mockConversation.totalScreenshots).toBe('number');

        // Check for required fields
        expect(mockConversation.conversationId).not.toBeNull();
        expect(mockConversation.participantDocRefs).not.toBeNull();
        expect(mockConversation.rightSideParticipantDocRef).not.toBeNull();
        expect(mockConversation.screenshotMessageIds).not.toBeNull();
        expect(mockConversation.totalScreenshots).not.toBeNull();

        // Check array lengths (basic check)
        expect(mockConversation.participantDocRefs.length).toBeGreaterThan(0);
        expect(mockConversation.screenshotMessageIds.length).toBeGreaterThan(0);

        // Check if rightSideParticipantDocRef is included in participantDocRefs
        expect(mockConversation.participantDocRefs).toContain(
            mockConversation.rightSideParticipantDocRef
        );
    });
});

describe('iMessage Conversation Relationships', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should fetch and sort messages for a conversation based on screenshotMessageIds', () => {
        const mockMessages: (iMessageMessage & Models.Document)[] = [
            {
                $id: 'msg1',
                $collectionId: 'imessageMessages',
                $databaseId: 'main',
                $createdAt: new Date().toISOString(),
                $updatedAt: new Date().toISOString(),
                $permissions: [],
                conversationId: 'conv123',
                messageId: 'msgA',
                participantDocId: 'part1',
                content: 'first message',
                timestamp: new Date().toISOString(),
                isEdited: false,
                screenshotIndex: 0
            },
            {
                $id: 'msg2',
                $collectionId: 'imessageMessages',
                $databaseId: 'main',
                $createdAt: new Date().toISOString(),
                $updatedAt: new Date().toISOString(),
                $permissions: [],
                conversationId: 'conv123',
                messageId: 'msgB',
                participantDocId: 'part2',
                content: 'second message',
                timestamp: new Date().toISOString(),
                isEdited: false,
                screenshotIndex: 1
            },
            {
                $id: 'msg3',
                $collectionId: 'imessageMessages',
                $databaseId: 'main',
                $createdAt: new Date().toISOString(),
                $updatedAt: new Date().toISOString(),
                $permissions: [],
                conversationId: 'conv123',
                messageId: 'msgC',
                participantDocId: 'part1',
                content: 'third message',
                timestamp: new Date().toISOString(),
                isEdited: false,
                screenshotIndex: 2
            },
            {
                $id: 'msg4',
                $collectionId: 'imessageMessages',
                $databaseId: 'main',
                $createdAt: new Date().toISOString(),
                $updatedAt: new Date().toISOString(),
                $permissions: [],
                conversationId: 'otherConv',
                messageId: 'msgD',
                participantDocId: 'part3',
                content: 'message in another conversation',
                timestamp: new Date().toISOString(),
                isEdited: false,
                screenshotIndex: 0
            }
        ];

        const mockParticipants: (iMessageParticipant & Models.Document)[] = [
            {
                $id: 'part1',
                $collectionId: 'imessageParticipants',
                $databaseId: 'main',
                $createdAt: new Date().toISOString(),
                $updatedAt: new Date().toISOString(),
                $permissions: [],
                userId: 'userA',
                name: 'Participant A',
                avatarFileId: 'avatarA'
            },
            {
                $id: 'part2',
                $collectionId: 'imessageParticipants',
                $databaseId: 'main',
                $createdAt: new Date().toISOString(),
                $updatedAt: new Date().toISOString(),
                $permissions: [],
                userId: 'userB',
                name: 'Participant B',
                avatarFileId: 'avatarB'
            },
            {
                $id: 'part3',
                $collectionId: 'imessageParticipants',
                $databaseId: 'main',
                $createdAt: new Date().toISOString(),
                $updatedAt: new Date().toISOString(),
                $permissions: [],
                userId: 'userC',
                name: 'Participant C',
                avatarFileId: 'avatarC'
            }
        ];

        const conversationDoc: iMessageConversation & Models.Document = {
            $id: 'conv123',
            $collectionId: 'imessageConversations',
            $databaseId: 'main',
            $createdAt: new Date().toISOString(),
            $updatedAt: new Date().toISOString(),
            $permissions: [],
            conversationId: 'conv123',
            postId: 'postXYZ',
            participantDocRefs: ['part1', 'part2'],
            rightSideParticipantDocRef: 'part1',
            screenshotMessageIds: ['msgA', 'msgC', 'msgB'], // Shuffled IDs to test sorting
            totalScreenshots: 1
        };

        // Use actual utility functions instead of mocks
        const fetchedMessages = getMessagesForConversation(conversationDoc, mockMessages);

        // Results should be in the order defined by screenshotMessageIds
        expect(fetchedMessages.map((msg) => msg.messageId)).toEqual(['msgA', 'msgC', 'msgB']);

        // Test fetching participants for the conversation
        const fetchedParticipants = getParticipantsForConversation(
            conversationDoc,
            mockParticipants
        );

        expect(fetchedParticipants.map((part) => part.$id)).toEqual(['part1', 'part2']);
    });

    it('should fetch participants for a conversation based on participantDocRefs', () => {
        const mockParticipants: (iMessageParticipant & Models.Document)[] = [
            {
                $id: 'part1',
                $collectionId: 'imessageParticipants',
                $databaseId: 'main',
                $createdAt: new Date().toISOString(),
                $updatedAt: new Date().toISOString(),
                $permissions: [],
                userId: 'userA',
                name: 'Participant A',
                avatarFileId: 'avatarA'
            },
            {
                $id: 'part2',
                $collectionId: 'imessageParticipants',
                $databaseId: 'main',
                $createdAt: new Date().toISOString(),
                $updatedAt: new Date().toISOString(),
                $permissions: [],
                userId: 'userB',
                name: 'Participant B',
                avatarFileId: 'avatarB'
            }
        ];

        const conversationDoc: iMessageConversation & Models.Document = {
            $id: 'conv123',
            $collectionId: 'imessageConversations',
            $databaseId: 'main',
            $createdAt: new Date().toISOString(),
            $updatedAt: new Date().toISOString(),
            $permissions: [],
            conversationId: 'conv123',
            postId: 'postXYZ',
            participantDocRefs: ['part1', 'part2'],
            rightSideParticipantDocRef: 'part1',
            screenshotMessageIds: ['msgA'],
            totalScreenshots: 1
        };

        // Use actual utility function
        const fetchedParticipants = getParticipantsForConversation(
            conversationDoc,
            mockParticipants
        );

        expect(fetchedParticipants.map((part) => part.$id)).toEqual(['part1', 'part2']);
    });
});
