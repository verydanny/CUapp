<script lang="ts">
    import ProfileImage from '$layout/components/profileImage.svelte'

    let { data } = $props()
    let { user, profile } = $derived(data)
</script>

<!-- User Profile Card using DaisyUI -->
<div class="card bg-base-100">
    <ProfileImage imageUrl={profile?.profileImage} />
    <div class="card-body">
        <h2 class="card-title mb-0">@{profile?.username}</h2>
        <p class="text-sm text-gray-500">{user?.email}</p>
        <div class="card-actions mt-4 justify-end">
            <form method="post" action="edit?/save">
                <button type="submit" class="btn btn-outline btn-neutral">Save</button>
            </form>
            <a
                class="btn btn-outline btn-secondary"
                role="button"
                href="/{profile?.username}"
                data-sveltekit-preload-data>Cancel</a
            >
        </div>
    </div>
</div>
