import { describe, it, expect } from 'vitest';
import { sortParticipantsByName, type iMessageParticipant } from './imessage.utils.js';
import type { Models } from 'appwrite';

const baseMockParticipant: iMessageParticipant & Models.Document = {
    $id: 'mock-part-id',
    $collectionId: 'imessageParticipants',
    $databaseId: 'main',
    $createdAt: new Date().toISOString(),
    $updatedAt: new Date().toISOString(),
    $permissions: [],
    userId: 'user123',
    name: 'Test Participant',
    avatarFileId: 'file456'
};

describe('iMessage Participant Model Structure', () => {
    it('should have the correct structure and types', () => {
        const mockParticipant: iMessageParticipant & Models.Document = { ...baseMockParticipant };

        expect(mockParticipant).toBeDefined();
        expect(typeof mockParticipant.userId).toBe('string');
        expect(typeof mockParticipant.name).toBe('string');
        expect(mockParticipant.avatarFileId).toBeTypeOf('string'); // Can be string or undefined

        // Check for required fields
        expect(mockParticipant.userId).not.toBeNull();
        expect(mockParticipant.name).not.toBeNull();

        // Check optional fields if present
        if (mockParticipant.avatarFileId !== undefined) {
            expect(mockParticipant.avatarFileId).toBeTypeOf('string');
        }

        // Check Appwrite Document specific fields
        expect(typeof mockParticipant.$id).toBe('string');
        expect(typeof mockParticipant.$collectionId).toBe('string');
        expect(typeof mockParticipant.$databaseId).toBe('string');
        expect(typeof mockParticipant.$createdAt).toBe('string');
        expect(typeof mockParticipant.$updatedAt).toBe('string');
        expect(Array.isArray(mockParticipant.$permissions)).toBe(true);
    });
});

describe('iMessage Participant Sorting', () => {
    it('should correctly sort participants by name', () => {
        const participantsToSort: (iMessageParticipant & Models.Document)[] = [
            { ...baseMockParticipant, name: 'Charlie' },
            { ...baseMockParticipant, name: 'Alice' },
            { ...baseMockParticipant, name: 'Bob' }
        ];

        const expectedOrder: (iMessageParticipant & Models.Document)[] = [
            { ...baseMockParticipant, name: 'Alice' },
            { ...baseMockParticipant, name: 'Bob' },
            { ...baseMockParticipant, name: 'Charlie' }
        ];

        const sortedParticipants = sortParticipantsByName(participantsToSort);

        expect(sortedParticipants).toEqual(expectedOrder);
    });
});
