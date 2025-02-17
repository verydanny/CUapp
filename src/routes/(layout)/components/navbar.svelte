<script lang="ts">
    let { profile } = $props<{
        profile: {
            username: string
            profileImage: {
                url: string
                mimeType: string
            } | null
        } | null
    }>()
</script>

<div class="navbar bg-base-100 relative">
    <!-- Left: User Profile Photo -->
    {#if profile}
        <div class="md:flex md:flex-3">
            <div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar">
                <div class="w-10 rounded-full">
                    <a href={`/${profile.username}`}>
                        <img alt="Tailwind CSS Navbar component" src={profile?.profileImage?.url} />
                    </a>
                </div>
            </div>
        </div>
    {/if}

    <!-- Center: Logo (absolutely centered) -->
    <div class="pointer-events-none absolute inset-0 flex items-center justify-center">
        <a class="btn btn-ghost pointer-events-auto text-xl" href="/">CUApp</a>
    </div>

    <!-- Right: Search Bar (takes remaining space) -->
    <div class="hidden justify-end md:flex md:flex-1">
        <input
            type="text"
            placeholder="Search"
            class="input input-bordered w-full max-w-xs md:max-w-sm"
        />
    </div>
</div>
