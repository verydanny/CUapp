import type { Models } from 'appwrite';
import type {
    ImessageConversation,
    ImessageMessages,
    ImessageParticipants
} from '../types/appwrite';

// --- Interface Definitions for iMessage Data Structures ---

/**
 * Represents a single message within an iMessage conversation.
 * Extends Appwrite's Models.Document to include Appwrite-specific fields.
 */
export interface iMessageMessage extends Models.Document {
    conversationId: string; // ID linking to the parent iMessageConversation's `conversationId` field
    messageId: string; // Unique identifier for this message (e.g., generated by client or server)
    participantDocId: string; // Appwrite Document ID of the iMessageParticipant who sent the message
    content: string; // Text content of the message. For image types, this might be empty or a generic placeholder.
    messageType?: 'text' | 'image'; // Type of the message, defaults to 'text' if undefined
    imageUrl?: string; // URL if the messageType is 'image' and image is hosted externally
    imageFileId?: string; // Appwrite File ID if messageType is 'image' and image is in Appwrite Storage
    imageAltText?: string; // Alternative text for image messages, for accessibility
    timestamp: string; // ISO 8601 string representing when the message was sent/created
    timestampDisplay?: string; // Optional pre-formatted string for displaying the timestamp (e.g., "10:30 AM")
    isEdited: boolean; // Flag indicating if the message has been edited by the sender
    screenshotIndex: number; // Zero-based index for ordering messages as they appear in a screenshot/mockup
    deliveryStatus?: 'sent' | 'delivered' | 'read'; // Delivery status, typically for messages from the right-side participant
}

/**
 * Represents a participant in an iMessage conversation.
 * Extends Appwrite's Models.Document.
 */
export interface iMessageParticipant extends Models.Document {
    userId: string; // A unique identifier for the user this participant represents (e.g., Appwrite User ID)
    name: string; // Display name of the participant
    avatarFileId?: string; // Optional Appwrite File ID for the participant's avatar image
    isRightSide?: boolean; // Optional flag, primarily for client-side determination if needed. Server typically uses rightSideParticipantDocRef.
}

/**
 * Represents the metadata and structure of an iMessage conversation.
 * This interface itself does NOT extend Models.Document, as it's often constructed from an Appwrite document.
 * The corresponding Appwrite document would have fields like $id, $collectionId etc.
 */
export interface iMessageConversation {
    conversationId: string; // Unique identifier for this logical conversation (distinct from Appwrite $id)
    postId: string; // ID linking this conversation to a parent entity (e.g., a blog post)
    participantDocRefs: string[]; // Array of Appwrite Document IDs for all iMessageParticipants in this conversation
    rightSideParticipantDocRef: string; // Appwrite Document ID of the iMessageParticipant whose messages appear on the right
    screenshotMessageIds: string[]; // Array of `messageId`s (from iMessageMessage) defining the original display order
    totalScreenshots: number; // Typically the count of messages, or distinct visual parts of a screenshot
}

// --- Utility Functions ---

/**
 * Sorts an array of iMessageMessages by their `screenshotIndex` in ascending order.
 * @param messages Array of iMessageMessage objects.
 * @returns A new array with messages sorted by screenshotIndex.
 */
export function sortMessagesByScreenshotIndex(
    messages: ImessageMessages[]
): ImessageMessages[] {
    return [...messages].sort((a, b) => a.screenshotIndex - b.screenshotIndex);
}

/**
 * Sorts an array of iMessageParticipants by their `name` in alphabetical order.
 * @param participants Array of iMessageParticipant objects.
 * @returns A new array with participants sorted by name.
 */
export function sortParticipantsByName(
    participants: ImessageParticipants[]
): ImessageParticipants[] {
    return [...participants].sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Filters a list of all messages to get only those belonging to a specific conversation,
 * then sorts them according to the `screenshotMessageIds` array in the conversation object.
 * @param conversation The iMessageConversation object.
 * @param allMessages An array of all available iMessageMessage objects.
 * @returns An array of iMessageMessage objects belonging to the conversation, sorted as specified.
 */
export function getMessagesForConversation(
    conversation: ImessageConversation,
    allMessages: ImessageMessages[]
): ImessageMessages[] {
    // Filter messages that belong to the given conversationId
    const conversationMessages = allMessages.filter(
        (msg) => msg.conversationId === conversation.conversationId
    );

    // Sort these messages based on the order specified in conversation.screenshotMessageIds
    const sortedMessages = conversation.screenshotMessageIds
        .map((messageId) => conversationMessages.find((msg) => msg.messageId === messageId))
        .filter((msg): msg is ImessageMessages => msg !== undefined); // Type guard to filter out undefined if a messageId is not found

    return sortedMessages;
}

/**
 * Filters a list of all participants to get only those belonging to a specific conversation.
 * @param conversation The iMessageConversation object.
 * @param allParticipants An array of all available iMessageParticipant objects.
 * @returns An array of iMessageParticipant objects belonging to the conversation.
 */
export function getParticipantsForConversation(
    conversation: ImessageConversation,
    allParticipants: (ImessageParticipants & { $id?: string })[]
): ImessageParticipants[] {
    const filteredParticipants = allParticipants.filter((participant) =>
        // Check if the participant's Appwrite $id is in the conversation's participantDocRefs array
        conversation.participantDocRefs.some((refId) => refId === participant?.$id)
    );

    return filteredParticipants;
}

/**
 * Filters messages sent by a specific participant.
 * @param messages Array of iMessageMessage objects.
 * @param participantDocId The Appwrite Document ID of the participant.
 * @returns A new array containing only messages sent by the specified participant.
 */
export function filterMessagesByParticipant(
    messages: ImessageMessages[],
    participantDocId: string
): ImessageMessages[] {
    return messages.filter((msg) => msg.participantDocId === participantDocId);
}

/**
 * Filters messages containing a specific keyword in their content (case-insensitive).
 * @param messages Array of iMessageMessage objects.
 * @param keyword The keyword to search for.
 * @returns A new array containing only messages that include the keyword in their content.
 */
export function filterMessagesByContent(
    messages: ImessageMessages[],
    keyword: string
): ImessageMessages[] {
    const lowercasedKeyword = keyword.toLowerCase();
    return messages.filter((msg) => msg.content.toLowerCase().includes(lowercasedKeyword));
}
