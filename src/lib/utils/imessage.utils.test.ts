import { describe, it, expect } from 'vitest';
import {
    filterMessagesByParticipant,
    filterMessagesByContent,
    type iMessageMessage
} from './imessage.utils.js';
import type { Models } from 'appwrite';

// Define reusable mock objects (fixtures)
const baseMockMessage: iMessageMessage & Models.Document = {
    $id: 'msg123',
    $collectionId: 'messages',
    $databaseId: 'main',
    $createdAt: new Date().toISOString(),
    $updatedAt: new Date().toISOString(),
    $permissions: [],
    conversationId: 'conv1',
    messageId: 'msgUnique1',
    participantDocId: 'part1',
    content: 'Hello',
    timestamp: new Date().toISOString(),
    isEdited: false,
    screenshotIndex: 0
};

describe('iMessage Utilities', () => {
    describe('Filtering Messages', () => {
        it('should filter messages by participant document ID', () => {
            const participant1Id = 'participant_1';
            const participant2Id = 'participant_2';

            const mockMessages: iMessageMessage[] = [
                {
                    ...baseMockMessage,
                    $id: 'msg1',
                    participantDocId: participant1Id,
                    content: 'Message from Participant 1'
                },
                {
                    ...baseMockMessage,
                    $id: 'msg2',
                    participantDocId: participant2Id,
                    content: 'Message from Participant 2'
                },
                {
                    ...baseMockMessage,
                    $id: 'msg3',
                    participantDocId: participant1Id,
                    content: 'Another message from Participant 1'
                },
                {
                    ...baseMockMessage,
                    $id: 'msg4',
                    participantDocId: participant1Id,
                    content: 'Yet another from Participant 1'
                },
                {
                    ...baseMockMessage,
                    $id: 'msg5',
                    participantDocId: participant2Id,
                    content: 'Another from Participant 2'
                }
            ];

            // Assuming a filter function like filterMessagesByParticipant exists in imessage.utils.ts
            // It should take an array of messages and a participantDocId and return filtered messages.
            const filtered = filterMessagesByParticipant(mockMessages, participant1Id);

            // Expect the filtered array to contain only messages from participant1Id
            expect(filtered.length).toBe(3);
            expect(filtered.every((msg) => msg.participantDocId === participant1Id)).toBe(true);
            expect(filtered.some((msg) => msg.content === 'Message from Participant 2')).toBe(
                false
            );

            // Placeholder expect until the filter function is implemented
            // expect(true).toBe(true)
        });

        it('should filter messages by content keyword', () => {
            const mockMessages: iMessageMessage[] = [
                { ...baseMockMessage, $id: 'msg1', content: 'This message contains keyword one.' },
                { ...baseMockMessage, $id: 'msg2', content: 'This message has another keyword.' },
                { ...baseMockMessage, $id: 'msg3', content: 'Keyword one is here again.' },
                { ...baseMockMessage, $id: 'msg4', content: 'A message without the keyword.' },
                { ...baseMockMessage, $id: 'msg5', content: 'Keyword One with different casing.' }
            ];

            const keyword = 'keyword one';

            // Assuming a filter function like filterMessagesByContent exists in imessage.utils.ts
            // It should take an array of messages and a keyword string and return filtered messages (case-insensitive).
            const filtered = filterMessagesByContent(mockMessages, keyword);

            // Expect the filtered array to contain messages matching the keyword (case-insensitive)
            expect(filtered.length).toBe(3);
            expect(filtered.some((msg) => msg.$id === 'msg1')).toBe(true);
            expect(filtered.some((msg) => msg.$id === 'msg3')).toBe(true);
            expect(filtered.some((msg) => msg.$id === 'msg5')).toBe(true);
            expect(
                filtered.every((msg) => msg.content.toLowerCase().includes(keyword.toLowerCase()))
            ).toBe(true);

            // Placeholder expect until the filter function is implemented
            // expect(true).toBe(true)
        });
    });
});
