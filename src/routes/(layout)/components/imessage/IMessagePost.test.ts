import type { Models } from 'appwrite';
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/svelte';
import IMessagePost from './IMessagePost.svelte';
import type {
    iMessageConversation,
    iMessageMessage,
    iMessageParticipant
} from '$lib/utils/imessage.utils.js';

// Mock data
const mockParticipants: iMessageParticipant[] = [
    {
        $id: 'part-1',
        $collectionId: 'imessageParticipants',
        $databaseId: 'main',
        $createdAt: new Date().toISOString(),
        $updatedAt: new Date().toISOString(),
        $permissions: [],
        userId: 'user-1',
        name: 'Alice'
    },
    {
        $id: 'part-2',
        $collectionId: 'imessageParticipants',
        $databaseId: 'main',
        $createdAt: new Date().toISOString(),
        $updatedAt: new Date().toISOString(),
        $permissions: [],
        userId: 'user-2',
        name: 'Bob'
    }
];

const mockMessages: iMessageMessage[] = [
    {
        $id: 'msg-1',
        $collectionId: 'imessageMessages',
        $databaseId: 'main',
        $createdAt: new Date().toISOString(),
        $updatedAt: new Date().toISOString(),
        $permissions: [],
        conversationId: 'conv-1',
        messageId: 'msg-1',
        participantDocId: 'part-1',
        content: 'Test message 1',
        timestamp: new Date().toISOString(),
        isEdited: false,
        screenshotIndex: 0
    },
    {
        $id: 'msg-2',
        $collectionId: 'imessageMessages',
        $databaseId: 'main',
        $createdAt: new Date().toISOString(),
        $updatedAt: new Date().toISOString(),
        $permissions: [],
        conversationId: 'conv-1',
        messageId: 'msg-2',
        participantDocId: 'part-2',
        content: 'Test message 2',
        timestamp: new Date().toISOString(),
        isEdited: false,
        screenshotIndex: 1
    }
];

const mockConversation: iMessageConversation & Models.Document = {
    $id: 'conv-1',
    $collectionId: 'imessageConversations',
    $databaseId: 'main',
    $createdAt: new Date().toISOString(),
    $updatedAt: new Date().toISOString(),
    $permissions: [],
    conversationId: 'conv-1',
    postId: 'post-1',
    participantDocRefs: ['part-1', 'part-2'],
    rightSideParticipantDocRef: 'part-2',
    screenshotMessageIds: ['msg-1', 'msg-2'],
    totalScreenshots: 2
};

describe('IMessagePost Component', () => {
    it('renders the component with messages', () => {
        const { container } = render(IMessagePost, {
            conversation: mockConversation,
            messages: mockMessages,
            participants: mockParticipants,
            rightSideParticipant: mockParticipants[1]
        });

        // Check if messages are rendered
        expect(container.textContent).toContain('Test message 1');
        expect(container.textContent).toContain('Test message 2');

        // Check if participant name is displayed
        expect(container.textContent).toContain('Alice');
    });

    it('renders a loading state when loading is true', () => {
        const { container } = render(IMessagePost, {
            conversation: null,
            messages: mockMessages,
            participants: mockParticipants,
            rightSideParticipant: mockParticipants[0],
            loading: true
        });

        // Messages should not be visible
        expect(container.textContent).toContain('Loading Conversation...');
    });

    it('shows an error when rightSideParticipant is not found', () => {
        // Create a conversation with a non-existent right side participant
        const badConversation = {
            ...mockConversation,
            rightSideParticipantDocRef: 'non-existent'
        };

        const { container } = render(IMessagePost, {
            conversation: badConversation,
            messages: mockMessages,
            participants: mockParticipants,
            rightSideParticipant: null
        });

        // Should show an error message
        expect(container.textContent).toContain(
            'Preparing Data... Conversation data is (still) incomplete or not fully processed.'
        );
    });

    it('renders a link to the post when postId is provided', () => {
        const { container } = render(IMessagePost, {
            conversation: mockConversation,
            messages: mockMessages,
            participants: mockParticipants,
            postId: 'test-post-id',
            rightSideParticipant: mockParticipants[1]
        });

        // Check for the post link
        const link = container.querySelector('a[href="/post/test-post-id"]');
        expect(link).not.toBeNull();
        expect(link?.textContent).toContain('View full post');
    });

    it('sorts messages by screenshotIndex', () => {
        // Create messages in reverse order
        const reverseMessages = [
            {
                ...mockMessages[1],
                screenshotIndex: 1
            },
            {
                ...mockMessages[0],
                screenshotIndex: 0
            }
        ];

        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        const { container } = render(IMessagePost, {
            conversation: mockConversation,
            messages: reverseMessages,
            participants: mockParticipants,
            rightSideParticipant: mockParticipants[1]
        });

        // The first message in the DOM should be the one with screenshotIndex 0
        const messageElements = container.querySelectorAll('.imessage-conversation');
        expect(messageElements.length).toBeGreaterThan(0);
        expect(messageElements[0].textContent).toContain('Test message 1');

        consoleErrorSpy.mockRestore();
    });
});
