import { ID } from 'appwrite';
import type { Models } from 'appwrite';
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';
import type {
    iMessageConversation,
    iMessageMessage,
    iMessageParticipant
} from '$lib/utils/imessage.utils.js';
import {
    createIMessageConversation,
    createIMessageMessage,
    createIMessageParticipant
} from '$lib/server/appwrite-utils/imessage.appwrite.js';
import { createUserSessionClient } from '$lib/server/appwrite-utils/appwrite.js';
import {
    DeliveryStatus,
    MessageType,
    type ImessageMessages,
    type ImessageConversation,
    type ImessageParticipants
} from '$root/lib/types/appwrite';

// This endpoint simulates creating and returning a mock iMessage conversation.
// In a real scenario, this would interact with a database.
export const POST: RequestHandler = async ({ request: _request, locals, cookies }) => {
    if (!locals.user) {
        return json({ success: false, message: 'User not authenticated' }, { status: 401 });
    }

    try {
        const { databases } = createUserSessionClient({ cookies });

        // For now, we generate a fixed mock conversation set to save
        // Later, this data could come from the request body

        const mockUserAlias1 = 'Alejandro'; // From the reference image
        const mockUserAlias2 = 'You'; // Representing the user viewing the chat

        // 1. Create Participants
        const participantData1 = {
            userId: locals.user.$id as string,
            name: mockUserAlias1
            // avatarFileId: '...' // Optional
        } as ImessageParticipants;
        const participant1 = await createIMessageParticipant(databases, participantData1);

        const participantData2 = {
            userId: locals.user.$id as string,
            name: mockUserAlias2
            // avatarFileId: '...'
        } as ImessageParticipants;
        const participant2 = await createIMessageParticipant(databases, participantData2);

        const createdParticipants = [participant1, participant2];
        const rightSideParticipantDocRef = participant2.$id; // 'You' is the right side

        // 2. Create Messages
        const conversationIdForMessages = ID.unique(); // Temp ID for messages, will be part of the conversation doc
        const messageInputs = [
            {
                pId: participant1.$id,
                content: 'Yeah grill me',
                idx: 0,
                minsAgo: 5,
                status: 'sent' as const
            },
            {
                pId: participant2.$id,
                content: 'Haha',
                idx: 1,
                minsAgo: 4.5,
                status: 'read' as const
            },
            {
                pId: participant2.$id,
                content: 'Ok what are you working on now?',
                idx: 2,
                minsAgo: 4,
                status: 'read' as const
            },
            {
                pId: participant1.$id,
                content: 'Adding a Twitter button to a syndication story',
                idx: 3,
                minsAgo: 3,
                status: 'sent' as const
            },
            {
                pId: participant2.$id,
                content: 'Did the newsletter go out yet?',
                idx: 4,
                minsAgo: 2,
                status: 'delivered' as const
            },
            {
                pId: participant1.$id,
                content: 'V exciting',
                idx: 5,
                minsAgo: 1.5,
                status: 'delivered' as const
            },
            {
                pId: participant1.$id,
                content: 'Check this out!',
                idx: 6,
                minsAgo: 1,
                type: 'image' as const,
                imgUrl: 'https://picsum.photos/seed/imessageTest/300/200',
                alt: 'Test image',
                status: 'delivered' as const
            },
            {
                pId: participant2.$id,
                content: 'It did!',
                idx: 7,
                minsAgo: 0.5,
                status: 'sent' as const
            },
            {
                pId: participant1.$id,
                content: 'There we go',
                idx: 8,
                minsAgo: 0.2,
                status: 'sent' as const
            }
        ];

        const createdMessagesPromises = messageInputs.map(async (msgInput) => {
            const messageData = {
                conversationId: conversationIdForMessages, // This will be the $id of the conversation document
                messageId: ID.unique(),
                participantDocId: msgInput.pId,
                content: msgInput.type === 'image' ? msgInput.content || '' : msgInput.content,
                messageType: MessageType.TEXT,
                imageUrl: msgInput.imgUrl || '',
                imageAltText: 'fake alt text',
                // imageFileId could be set if uploading to Appwrite storage first
                timestamp: new Date(Date.now() - msgInput.minsAgo * 60000),
                isEdited: false,
                screenshotIndex: msgInput.idx,
                deliveryStatus: DeliveryStatus.SENT
            } as unknown as ImessageMessages;
            return createIMessageMessage(databases, messageData);
        });
        const createdMessages = await Promise.all(createdMessagesPromises);

        // 3. Create Conversation
        const conversationDataToSave = {
            // $id will be generated by createIMessageConversation or Appwrite
            conversationId: conversationIdForMessages, // Use the same ID used in messages
            postId: `post_${ID.unique()}`,
            participantDocRefs: createdParticipants.map((p) => p.$id),
            rightSideParticipantDocRef: rightSideParticipantDocRef,
            screenshotMessageIds: createdMessages.map((m) => m['messageId'] as string), // Use the actual messageId from created message
            totalScreenshots: createdMessages.length
        } as unknown as ImessageConversation;

        const finalConversation = await createIMessageConversation(
            databases,
            conversationDataToSave
        );

        return json({
            success: true,
            conversation: finalConversation as iMessageConversation & Models.Document,
            participants: createdParticipants as (iMessageParticipant & Models.Document)[],
            messages: createdMessages as (iMessageMessage & Models.Document)[]
        });
    } catch (e) {
        const err = e as Error & {
            code?: number;
            response?: { message?: string; type?: string; code?: number };
        };
        console.error(
            'API /api/imessage/create - Error saving to Appwrite:',
            err.message,
            err.response ? JSON.stringify(err.response) : ''
        );

        let clientMessage = 'Failed to create iMessage conversation in database.';
        if (err.response && err.response.message) {
            clientMessage = `Server error: ${err.response.message}`;
        } else if (err.message) {
            clientMessage = err.message;
        }

        const statusCode =
            typeof err.code === 'number' && err.code >= 400 && err.code < 600
                ? err.code
                : err.response?.code && typeof err.response.code === 'number'
                  ? err.response.code
                  : 500;

        throw error(statusCode, clientMessage); // Use throw error for actions/server routes
    }
};
