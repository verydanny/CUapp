<script lang="ts">
    import { routes } from '$lib/const.js'
    import type { ProfileFromLocals } from '$root/lib/server/profile'

    const { data }: { data: ProfileFromLocals } = $props()
    const { loggedInProfile, loggedInUser } = $derived(data)
</script>

{#if loggedInProfile?.$id}
    <div class="navbar bg-base-100 relative">
        <!-- Left: User Profile Photo -->
        {#if loggedInProfile?.$id}
            <div class="flex flex-1">
                <div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar">
                    <div class="w-10 rounded-full">
                        <a href={`/${loggedInProfile?.username}`} data-sveltekit-preload-data>
                            <img
                                alt="Tailwind CSS Navbar component"
                                src={loggedInProfile?.profileImage}
                            />
                        </a>
                    </div>
                </div>
            </div>
        {/if}

        <!-- Right: Search Bar (takes remaining space) -->
        <div class="flex flex-1 justify-end">
            {#if loggedInProfile?.$id}
                <input
                    type="text"
                    placeholder="Search"
                    class="input input-bordered w-full max-w-xs md:max-w-sm"
                />
            {:else}
                <a
                    class="btn btn-ghost pointer-events-auto text-sm"
                    href={loggedInUser?.wasLoggedIn ? routes?.auth?.signin : routes?.auth?.signup}
                    data-sveltekit-preload-data
                    >{loggedInUser?.wasLoggedIn ? 'Sign In' : 'Sign Up'}</a
                >
            {/if}
        </div>
    </div>
{/if}
