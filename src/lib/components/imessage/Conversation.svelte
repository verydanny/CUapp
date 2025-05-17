<script lang="ts">
    import type {
        iMessageConversation,
        iMessageMessage,
        iMessageParticipant
    } from '$lib/utils/imessage.utils';
    import MessageBubble from './MessageBubble.svelte';

    const { _conversation, messages, participants, rightSideParticipant } = $props<{
        _conversation: iMessageConversation | null;
        messages: iMessageMessage[] | undefined | null;
        participants: iMessageParticipant[] | undefined | null;
        rightSideParticipant: iMessageParticipant | undefined | null;
    }>();

    const isRightSide = (message: iMessageMessage) => {
        if (!rightSideParticipant) return false;
        return message.participantDocId === rightSideParticipant.$id;
    };

    // Use $derived.by for the multi-step grouping logic
    let groupedMessages = $derived.by(() => {
        if (!messages || messages.length === 0 || !participants || participants.length === 0) {
            return [];
        }

        const currentMessages = [...messages];
        const currentParticipants = [...participants];

        const groups: {
            sender: iMessageParticipant;
            messages: iMessageMessage[];
            senderName: string;
        }[] = [];
        let currentGroup: {
            sender: iMessageParticipant;
            messages: iMessageMessage[];
            senderName: string;
        } | null = null;

        currentMessages.forEach((message, _msgIdx) => {
            const sender = currentParticipants.find((p) => p.$id === message.participantDocId);
            if (!sender) {
                return;
            }

            const isNewGroup = !currentGroup || currentGroup.sender.$id !== sender.$id;

            if (isNewGroup) {
                currentGroup = { sender, messages: [message], senderName: sender.name };
                groups.push(currentGroup);
            } else {
                currentGroup.messages.push(message);
            }
        });
        return groups;
    });
</script>

<div class="flex flex-col space-y-1 bg-white p-3">
    {#if groupedMessages && groupedMessages.length > 0}
        {#each groupedMessages as group, groupIndex (group.sender.$id + '-' + groupIndex)}
            {#each group.messages as message, messageIndex (message.$id)}
                <MessageBubble
                    {message}
                    isRight={isRightSide(message)}
                    showTimestamp={messageIndex === group.messages.length - 1}
                    isFirstInGroup={messageIndex === 0}
                    isLastInGroup={messageIndex === group.messages.length - 1}
                    participantName={!isRightSide(message) && messageIndex === 0
                        ? group.senderName
                        : ''}
                />
            {/each}
        {/each}
    {:else if messages && messages.length > 0 && (!participants || participants.length === 0)}
        <div class="py-4 text-center text-sm text-gray-400">
            Could not group messages: Participants data is missing or empty.
        </div>
    {:else if messages && messages.length > 0}
        <div class="py-4 text-center text-sm text-gray-400">
            Could not group messages. Check participantDocId on messages against participant $ids.
        </div>
    {:else}
        <div class="py-4 text-center text-gray-500">No messages in this conversation</div>
    {/if}
</div>
