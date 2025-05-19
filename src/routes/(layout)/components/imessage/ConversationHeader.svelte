<script lang="ts">
    import type { iMessageParticipant } from '$lib/utils/imessage.utils.js';

    const { participants, rightSideParticipant } = $props<{
        participants: iMessageParticipant[] | undefined | null;
        rightSideParticipant: iMessageParticipant | undefined | null;
        timestamp?: string; // Kept for prop signature consistency, though not used in this UI
    }>();

    let otherParticipants = $derived.by(() => {
        return participants && rightSideParticipant
            ? participants.filter((p) => p.$id !== rightSideParticipant.$id)
            : [];
    });

    // Complex derivations using $derived.by()
    let displayName = $derived.by(() => {
        const others = otherParticipants; // Use the already derived value
        if (!others || others.length === 0) {
            return rightSideParticipant?.name || 'Chat';
        }
        if (others.length === 1) {
            return others[0].name;
        }
        return others.map((p) => p.name).join(', ');
    });

    let avatarInitials = $derived.by(() => {
        const others = otherParticipants; // Use the already derived value
        if (others && others.length === 1 && others[0]?.name) {
            return others[0].name.substring(0, 1).toUpperCase();
        }
        // For groups or if no single other participant with a name
        return others && others.length > 1
            ? 'G'
            : rightSideParticipant?.name?.substring(0, 1).toUpperCase() || 'U';
    });
</script>

{#if participants && participants.length > 0 && rightSideParticipant}
    <div
        class="flex min-h-[56px] items-center justify-between border-b border-gray-200 bg-neutral-50 px-4 py-2.5"
    >
        <div class="w-8">
            <button aria-label="Go back" class="btn btn-ghost btn-sm p-0">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="2.5"
                    stroke="currentColor"
                    class="h-6 w-6 text-blue-500"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M15.75 19.5L8.25 12l7.5-7.5"
                    ></path>
                </svg>
            </button>
        </div>
        <div class="flex flex-col items-center text-center">
            {#if otherParticipants && otherParticipants.length === 1 && otherParticipants[0]?.avatarFileId},<!-- Check otherParticipants[0] exists -->
                <div class="avatar">
                    <div class="mb-0.5 h-7 w-7 rounded-full">
                        <img src={otherParticipants[0].avatarFileId} alt={displayName} />
                    </div>
                </div>
            {:else}
                <div class="avatar placeholder mb-0.5">
                    <div
                        class="flex h-7 w-7 items-center justify-center rounded-full bg-gray-300 text-gray-600"
                    >
                        <span class="text-xs font-medium">{avatarInitials}</span>
                    </div>
                </div>
            {/if}
            <span class="text-[17px] leading-tight font-semibold text-black">{displayName}</span>
            {#if otherParticipants && otherParticipants.length > 1}
                <span class="text-xs leading-tight text-gray-500">
                    {otherParticipants.length} people
                </span>
            {/if}
        </div>
        <div class="flex w-8 justify-end">
            <button aria-label="View contact info" class="btn btn-ghost btn-sm p-0">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="2.0"
                    stroke="currentColor"
                    class="h-6 w-6 text-blue-500"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
                    ></path>
                </svg>
            </button>
        </div>
    </div>
{:else}
    <div
        class="flex min-h-[56px] items-center justify-center border-b border-gray-200 bg-neutral-50 px-4 py-2.5"
    >
        <p class="text-sm text-gray-500">
            Header Fallback: Participants count: {participants?.length !== undefined
                ? participants.length
                : 'N/A'}, RSP valid: {!!rightSideParticipant}
        </p>
    </div>
{/if}
