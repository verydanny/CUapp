<script lang="ts">
    import type { iMessageMessage, iMessageParticipant } from '$lib/utils/imessage.utils';

    const {
        message, // The core message object
        isRight = false, // True if the message should appear on the right (current user)
        showTimestamp = false, // True if the timestamp should be displayed for this bubble
        _userParticipant = undefined, // Prop for potential future use, not currently used for logic
        isFirstInGroup = false, // True if this is the first message in a consecutive group from the same sender
        isLastInGroup = false, // True if this is the last message in a consecutive group
        participantName = '' // Name of the participant (used if !isRight and isFirstInGroup)
    } = $props<{
        message: iMessageMessage;
        isRight?: boolean;
        showTimestamp?: boolean;
        _userParticipant?: iMessageParticipant | undefined;
        isFirstInGroup?: boolean;
        isLastInGroup?: boolean;
        participantName?: string;
    }>();

    // --- Style Derivations ---
    // These determine the visual appearance of the bubble based on whether it's a right-side message.

    let bubbleBgColor = $derived(isRight ? 'bg-blue-500' : 'bg-gray-100');
    let bubbleTextColor = $derived(isRight ? 'text-white' : 'text-black');
    // Defines the characteristic "tailed" bubble shape.
    let bubbleBorderRadius = $derived.by(() => {
        if (!isLastInGroup) {
            // Messages that are not the last in a group are more uniformly rounded.
            return 'rounded-2xl';
        }
        // Last message in a group gets the tail.
        return isRight ? 'rounded-2xl rounded-br-md' : 'rounded-2xl rounded-bl-md';
    });
    // Images have a simpler, fully rounded corner style.
    // let imageBorderRadius = $derived('rounded-xl'); // Removed as images now use bubbleBorderRadius
    // Alignment of the bubble container (flex item) within its parent row.
    let messageAlign = $derived(isRight ? 'self-end' : 'self-start');
    // Margin below the bubble, slightly different if it's the last in a group.
    let messageMarginBottom = $derived(isLastInGroup ? 'mb-1' : 'mb-0.5');

    // --- Content Derivations ---

    // Computes the text for the timestamp display.
    let displayTimestampText = $derived.by(() => {
        // Always show for the last message in a group, regardless of side, if showTimestamp is true.
        if (!showTimestamp) return undefined;

        if (message.timestampDisplay) return message.timestampDisplay; // Use pre-formatted if available
        if (message.timestamp) {
            try {
                return new Date(message.timestamp).toLocaleTimeString([], {
                    hour: 'numeric',
                    minute: '2-digit'
                });
            } catch (e) {
                // Important: Keep console.error for actual runtime errors
                console.error('Error formatting timestamp:', message.timestamp, e);
                return 'Invalid date';
            }
        }
        return undefined;
    });

    // Computes the delivery status text (e.g., "Delivered", "Read").
    let deliveryStatusText = $derived.by(() => {
        if (!isRight || !isLastInGroup) return null; // Only show for the current user's last message in a group
        // Do not show delivery status if there's a timestamp to be shown for the right side message
        if (showTimestamp && displayTimestampText) return null;

        switch (message.deliveryStatus) {
            case 'delivered':
                return 'Delivered';
            case 'read':
                return 'Read';
            default:
                return null;
        }
    });

    // Determines if the message is an image type with a valid source.
    let isImageMessage = $derived(
        message.messageType === 'image' && (message.imageUrl || message.imageFileId)
    );
</script>

<div class={`flex max-w-[75%] flex-col ${messageAlign} ${messageMarginBottom}`}>
    {#if !isRight && isFirstInGroup && participantName}
        <!-- Display participant's name above the first message in a group from others -->
        <div class="mb-0.5 ml-2.5 text-xs text-gray-500">{participantName}</div>
    {/if}

    {#if isImageMessage}
        <!-- Image Message Structure -->
        <div
            class={`overflow-hidden shadow-sm ${bubbleBorderRadius}
            ${isLastInGroup && isRight ? 'rounded-br-md' : ''} 
            ${isLastInGroup && !isRight ? 'rounded-bl-md' : ''}
        `}
        >
            <img
                src={message.imageUrl || `/api/imageProxy?fileId=${message.imageFileId}`}
                alt={message.imageAltText || 'iMessage image'}
                class="block h-auto max-w-full cursor-pointer object-cover"
                onclick={() =>
                    window.open(
                        message.imageUrl || `/api/imageProxy?fileId=${message.imageFileId}`,
                        '_blank'
                    )}
            />
            <!-- iOS style: Images do not have separate caption text within the same bubble -->
        </div>
    {:else}
        <!-- Text Message Structure -->
        <div
            class={`px-3 py-2 shadow-sm ${bubbleBgColor} ${bubbleTextColor} ${bubbleBorderRadius}`}
        >
            <div class="text-base break-words whitespace-pre-wrap">
                {message.content}
                {#if message.isEdited}
                    <span class="ml-1 text-xs opacity-70">(edited)</span>
                {/if}
            </div>
        </div>
    {/if}

    <!-- Delivery Status & Timestamps - displayed below the bubble -->
    {#if deliveryStatusText && !displayTimestampText}
        <!-- Hide status if timestamp is shown for right side -->
        <div class="mt-0.5 mr-2 text-right text-xs text-gray-500">{deliveryStatusText}</div>
    {/if}

    {#if showTimestamp && displayTimestampText}
        <div
            class={`mt-0.5 text-xs text-gray-500 ${isRight ? 'mr-2 text-right' : 'ml-2.5 text-left'}`}
        >
            {displayTimestampText}
        </div>
    {/if}
</div>

<style>
    /* Scoped styles if any specific overrides are needed */
</style>
