<script lang="ts">
    import ProfileImage from '$layout/components/profileImage.svelte';
    import { formOutlineButton } from '$layout/snippets/miniForm.svelte';

    const { data } = $props();
    const { loggedInUser, profile } = $derived(data);

    const canViewProfileDetails = $derived(!profile?.permissions.includes('private'));
    const viewingOwnProfile = $derived(profile?.viewingOwnProfile);
</script>

<!-- User Profile Card using DaisyUI -->
<div class="card bg-base-100 shadow-sm">
    <div class="card-body">
        <div class="flex justify-between">
            <ProfileImage imageUrl={profile?.profileImage} />
            <div class="flex flex-col justify-center">
                <h2 class="text-xl font-bold">@{profile?.username}</h2>
            </div>
        </div>
        {#if canViewProfileDetails}
            <div class="card-actions mt-4 justify-end">
                {#if viewingOwnProfile}
                    <a
                        class="btn btn-outline btn-neutral"
                        href="/{profile?.username}/edit"
                        data-sveltekit-preload-data
                    >
                        Settings
                    </a>
                    {@render formOutlineButton(
                        '[userprofile]?/logout',
                        'Log out',
                        'btn-outline btn-secondary'
                    )}
                {:else}
                    {@render formOutlineButton(
                        '[userprofile]?/follow',
                        'Follow',
                        'btn-outline btn-secondary',
                        null,
                        {
                            profileId: profile?.$id,
                            followerId: loggedInUser?.$id,
                            pending: profile?.isPrivateProfile
                        }
                    )}
                {/if}
            </div>
        {:else}
            <p class="text-sm text-gray-500">This profile is private.</p>
        {/if}
    </div>
</div>
