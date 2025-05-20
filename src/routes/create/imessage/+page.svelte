<script lang="ts">
    import IMessagePost from '$layout/components/imessage/IMessagePost.svelte';
    import type {
        iMessageConversation,
        iMessageMessage,
        iMessageParticipant
    } from '$lib/utils/imessage.utils.js';

    // Component State
    let loadedConversation = $state<iMessageConversation | null>(null); // Holds the fetched conversation metadata
    let loadedMessages = $state<iMessageMessage[]>([]); // Holds the fetched messages
    let loadedParticipants = $state<iMessageParticipant[]>([]); // Holds the fetched participants
    let isLoading = $state(false); // Tracks loading state for the API call
    let errorLoading = $state<string | null>(null); // Stores any error message during API call

    /**
     * Fetches a mock iMessage conversation from the API endpoint
     * and updates the component\'s state.
     */
    async function loadMockConversation() {
        isLoading = true;
        errorLoading = null;
        // Reset previous data
        loadedConversation = null;
        loadedMessages = [];
        loadedParticipants = [];
        try {
            const response = await fetch('/api/imessage/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            if (!response.ok) {
                const errorText = await response.text();
                console.error('API Error Response Text:', errorText); // Keep for network debugging
                try {
                    const errorData = JSON.parse(errorText);
                    throw new Error(errorData.message || `HTTP error ${response.status}`);
                } catch (_e) {
                    throw new Error(
                        `HTTP error ${response.status}: ${errorText.substring(0, 100)}`
                    );
                }
            }
            const data = await response.json();
            // console.log('CLIENT: Data from API:', data); // Removed debug log
            if (data.success && data.conversation && data.messages && data.participants) {
                loadedConversation = data.conversation;
                loadedMessages = data.messages;
                loadedParticipants = data.participants;
                // console.log('CLIENT: Loaded state updated', ...); // Removed debug log
            } else {
                console.error('CLIENT: API response missing success or data fields:', data); // Keep for API contract issues
                throw new Error(data.message || 'API response format incorrect');
            }
        } catch (err) {
            console.error('CLIENT: Error loading mock conversation:', err); // Keep for general fetch errors
            errorLoading = err instanceof Error ? err.message : 'Unknown error while loading';
        } finally {
            isLoading = false;
        }
    }

    // Derived state for direct use in the template or other derived values
    let displayConversation = $derived(loadedConversation);
    let displayMessages = $derived(loadedMessages);
    let displayParticipants = $derived(loadedParticipants);

    // Determines the participant object that represents the "right side" (current user) of the conversation.
    // This is passed to IMessagePost.
    let rightSideParticipantForPost = $derived.by(() => {
        // Explicitly access dependencies for tracking
        const currentConversation = displayConversation;
        const currentParticipants = displayParticipants;

        if (currentConversation && currentParticipants && currentParticipants.length > 0) {
            const found = currentParticipants.find(
                (p) => p.$id === currentConversation.rightSideParticipantDocRef
            );
            return found;
        }
        return undefined;
    });
</script>

<svelte:head>
    <title>iMessage Post Demo</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
    <div class="mb-6 flex items-center justify-between">
        <h1 class="text-2xl font-bold">iMessage Post Demo</h1>
        <button class="btn btn-secondary" onclick={loadMockConversation} disabled={isLoading}>
            {#if isLoading}
                <span class="loading loading-spinner loading-xs mr-2"></span>
                Loading API Mock...{:else}Load Mock Convo via API{/if}
        </button>
    </div>

    {#if errorLoading}
        <div class="alert alert-error my-4 shadow-lg">
            <div>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-6 w-6 shrink-0 stroke-current"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                </svg>
                <span>Error: {errorLoading}</span>
            </div>
        </div>
    {/if}

    <div class="mx-auto grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-2">
        <div>
            <h2 class="mb-3 text-lg font-semibold">
                Simulated Preview (User: {rightSideParticipantForPost?.name || 'N/A'})
            </h2>
            {#if isLoading}
                <div
                    class="flex min-h-[200px] items-center justify-center rounded-lg border p-10 text-center text-gray-500"
                >
                    <span class="loading loading-dots loading-md"></span>
                </div>
            {:else if displayConversation && rightSideParticipantForPost && displayMessages && displayMessages.length > 0}
                <IMessagePost
                    conversation={displayConversation}
                    messages={displayMessages}
                    participants={displayParticipants}
                    rightSideParticipant={rightSideParticipantForPost}
                />
            {:else if !errorLoading && !isLoading}
                <div
                    class="flex min-h-[200px] items-center justify-center rounded-lg border p-10 text-center text-gray-500"
                >
                    Click "Load Mock Convo via API" to display the conversation.
                </div>
            {/if}
        </div>
        <div>
            <h2 class="mb-3 text-lg font-semibold">Reference Image</h2>
            <img
                src="/imessage-reference.jpg"
                alt="iMessage Style Reference"
                class="rounded-lg border"
            />
        </div>
    </div>

    <div class="mx-auto mt-12 max-w-xl">
        <h2 class="mb-4 text-xl font-bold">Component Features</h2>
        <ul class="list-disc space-y-2 pl-6">
            <li>Displays iMessage-style conversation with blue/gray bubbles</li>
            <li>Handles message grouping for consecutive messages from the same sender</li>
            <li>Shows participant names and avatars (avatars are placeholders)</li>
            <li>Supports message timestamps and delivery statuses</li>
            <li>Responsive design with Tailwind and DaisyUI</li>
            <li>Accessible UI elements with proper contrast and semantic HTML</li>
            <li>Loading state handling</li>
            <li>Error state handling</li>
            <li>Image message support</li>
        </ul>
    </div>
</div>
