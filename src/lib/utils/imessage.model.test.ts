import { describe, it, expect } from 'vitest';
import { sortMessagesByScreenshotIndex, type iMessageMessage } from './imessage.utils';
import type { Models } from 'appwrite'; // Import Models

const baseMockMessage: iMessageMessage & Models.Document = {
    $id: 'mock-msg-id',
    $collectionId: 'imessageMessages',
    $databaseId: 'main',
    $createdAt: new Date().toISOString(),
    $updatedAt: new Date().toISOString(),
    $permissions: [],
    conversationId: 'conv123',
    messageId: 'msg',
    participantDocId: 'part',
    content: 'Message content',
    timestamp: new Date().toISOString(), // Use ISO string for datetime
    timestampDisplay: '10:30 AM',
    isEdited: false,
    screenshotIndex: 0,
    deliveryStatus: 'delivered'
};

describe('iMessage Message Model Structure and Sorting', () => {
    it('should have the correct structure and types', () => {
        const mockMessage: iMessageMessage = {
            ...baseMockMessage,
            messageId: 'msg456',
            participantDocId: 'part789',
            content: 'Hello, world!'
        };

        expect(mockMessage).toBeDefined();
        expect(typeof mockMessage.conversationId).toBe('string');
        expect(typeof mockMessage.messageId).toBe('string');
        expect(typeof mockMessage.participantDocId).toBe('string');
        expect(typeof mockMessage.content).toBe('string');
        expect(typeof mockMessage.timestamp).toBe('string'); // Expecting ISO string
        expect(mockMessage.timestampDisplay).toBeTypeOf('string');
        expect(typeof mockMessage.isEdited).toBe('boolean');
        expect(typeof mockMessage.screenshotIndex).toBe('number');
        expect(mockMessage.deliveryStatus).toBeTypeOf('string');

        // Check for required fields
        expect(mockMessage.conversationId).not.toBeNull();
        expect(mockMessage.messageId).not.toBeNull();
        expect(mockMessage.participantDocId).not.toBeNull();
        expect(mockMessage.content).not.toBeNull();
        expect(mockMessage.timestamp).not.toBeNull();
        expect(mockMessage.isEdited).not.toBeNull();
        expect(mockMessage.screenshotIndex).not.toBeNull();

        // Check optional fields if present
        if (mockMessage.timestampDisplay !== undefined) {
            expect(mockMessage.timestampDisplay).toBeTypeOf('string');
        }
        if (mockMessage.deliveryStatus !== undefined) {
            expect(mockMessage.deliveryStatus).toBeTypeOf('string');
        }

        // Check enum for deliveryStatus (basic check)
        const validDeliveryStatuses = ['sent', 'delivered', 'read'];
        if (mockMessage.deliveryStatus !== undefined) {
            expect(validDeliveryStatuses).toContain(mockMessage.deliveryStatus);
        }
    });

    it('should correctly sort messages by screenshotIndex', () => {
        const messagesToSort: iMessageMessage[] = [
            { ...baseMockMessage, messageId: 'msgA', screenshotIndex: 2 },
            { ...baseMockMessage, messageId: 'msgB', screenshotIndex: 0 },
            { ...baseMockMessage, messageId: 'msgC', screenshotIndex: 1 }
        ];

        const expectedOrder: iMessageMessage[] = [
            { ...baseMockMessage, messageId: 'msgB', screenshotIndex: 0 },
            { ...baseMockMessage, messageId: 'msgC', screenshotIndex: 1 },
            { ...baseMockMessage, messageId: 'msgA', screenshotIndex: 2 }
        ];

        // This assertion now expects the (currently non-existent/non-functional)
        // sortMessagesByScreenshotIndex function to return the expected order.
        // This should cause the test to fail, giving us our 'red'.
        expect(sortMessagesByScreenshotIndex(messagesToSort)).toEqual(expectedOrder);
    });
});
