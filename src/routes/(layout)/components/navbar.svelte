<script lang="ts">
    import { routes } from '$lib/const'

    let { profileUI, wasLoggedIn } = $props<{
        profileUI: {
            username: string | null
            profileImage: string | null
        } | null
        wasLoggedIn: boolean
    }>()
</script>

<div class="navbar bg-base-100 relative">
    <!-- Left: User Profile Photo -->
    {#if profileUI}
        <div class="flex md:flex md:flex-3">
            <div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar">
                <div class="w-10 rounded-full">
                    <a href={`/${profileUI?.username}`} data-sveltekit-preload-code="viewport">
                        <img alt="Tailwind CSS Navbar component" src={profileUI?.profileImage} />
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
    {#if profileUI}
        <div class="hidden justify-end md:flex md:flex-1">
            <input
                type="text"
                placeholder="Search"
                class="input input-bordered w-full max-w-xs md:max-w-sm"
            />
        </div>
    {:else}
        <div class="flex flex-1 justify-end">
            <a
                class="btn btn-ghost pointer-events-auto text-sm"
                data-sveltekit-preload-data
                data-sveltekit-preload-code="viewport"
                href={wasLoggedIn ? routes?.auth?.signin : routes?.auth?.signup}
                >{wasLoggedIn ? 'Sign In' : 'Sign Up'}</a
            >
        </div>
    {/if}
</div>
