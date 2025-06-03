<script lang="ts">
    import type {
        ImessageConversationDocument,
        ImessageMessagesType,
        ImessageParticipantsType
    } from '$root/lib/types/appwrite.js';
    import ConversationHeader from './ConversationHeader.svelte';
    import Conversation from './Conversation.svelte';

    const {
        conversation,
        messages,
        participants,
        rightSideParticipant, // This prop is directly passed from the parent page
        loading = false,
        postId = undefined
    }: {
        conversation: ImessageConversationDocument | null; // Allow null from parent
        messages: ImessageMessagesType[];
        participants: ImessageParticipantsType[];
        rightSideParticipant: ImessageParticipantsType | undefined | null; // Allow undefined or null
        loading?: boolean;
        postId?: string;
    } = $props();

    // effectiveRightSideParticipant will just be the prop passed in, or null if that prop is null/undefined.
    // The parent (+page.svelte) is now responsible for correctly deriving it.
    let effectiveRightSideParticipant = $state(rightSideParticipant);

    let headerDataReady = $derived(
        !!(conversation && effectiveRightSideParticipant && participants && participants.length > 0)
    );
    let sortedMessages = $derived.by(() => {
        return messages ? [...messages].sort((a, b) => a.screenshotIndex - b.screenshotIndex) : [];
    });
    // Placeholder function for icon clicks - can be implemented later if needed
    function onIconClick(iconName: string) {
        console.log(`${iconName} icon clicked`);
    }
</script>

{#if loading}
    <div class="card mx-auto overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
        <div class="flex h-96 w-full animate-pulse items-center justify-center bg-gray-200">
            <span class="text-gray-500">Loading Conversation...</span>
        </div>
    </div>
{:else if !headerDataReady}
    <div class="card mx-auto overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
        <div class="card-body p-6 text-center">
            <h3 class="text-warning text-lg font-semibold">Preparing Data...</h3>
            <p class="text-gray-600">
                Conversation data is (still) incomplete or not fully processed.
            </p>
        </div>
    </div>
{:else}
    <div class="card mx-auto overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
        <ConversationHeader {participants} rightSideParticipant={effectiveRightSideParticipant} />
        <div class="p-0">
            <Conversation
                {conversation}
                messages={sortedMessages}
                {participants}
                rightSideParticipant={effectiveRightSideParticipant}
            />
        </div>
        <footer
            class="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-2.5 py-1.5"
        >
            <div class="flex items-center space-x-3">
                <button
                    onclick={() => onIconClick('Camera')}
                    class="btn btn-circle btn-ghost btn-sm"
                    aria-label="Open camera"
                >
                    <!-- Camera Icon (Heroicon outline) - Darker Gray -->
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        class="h-6 w-6 text-gray-600"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z"
                        ></path>
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z"
                        ></path>
                    </svg>
                </button>
            </div>

            <div
                class="flex-grow cursor-text rounded-full border border-gray-300 bg-white px-4 py-2.5 text-left text-gray-400"
            >
                iMessage
            </div>
        </footer>
        {#if postId}
            <div class="border-t border-gray-200 bg-gray-50 px-4 py-2 text-right text-xs">
                <a href={`/post/${postId}`} class="link text-blue-600 hover:text-blue-800">
                    View full post
                </a>
            </div>
        {/if}
    </div>
{/if}
