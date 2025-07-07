<script lang="ts">
    import { routes } from '$lib/const.js';
    import type { PageData } from '$types/routes/$types.d.ts';

    const { loggedInProfile, loggedInUser }: PageData = $props();
</script>

<div class="navbar bg-base-100 relative">
    <!-- Left: User Profile Photo -->
    <div class="flex-none">
        <div class="dropdown dropdown-start">
            <div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar">
                <div class="w-10 rounded-full">
                    <a href={`/${loggedInProfile?.username || ''}`} data-sveltekit-preload-code>
                        <img
                            alt="Tailwind CSS Navbar component"
                            src={loggedInProfile?.profileImage?.[0] ||
                                'https://prepr.io/_next/image?url=https%3A%2F%2F6rl8rq40yvya.b-cdn.net%2F7k7azex0vj4p-svelte-logo-indigo.png&w=2048&q=75'}
                        />
                    </a>
                </div>
            </div>

            <ul
                class="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow"
            >
                <li><a href="/" data-sveltekit-preload-data>Feed</a></li>
                {#if loggedInProfile?.$id}
                    <li>
                        <a class="justify-between" href={`/${loggedInProfile?.username}`}>
                            Profile
                            <span class="badge">New</span>
                        </a>
                    </li>
                    <li>
                        <a href={`/${loggedInProfile?.username}/edit`} data-sveltekit-preload-code>
                            Settings
                        </a>
                    </li>
                    <li class="mt-1 flex">
                        <form
                            method="POST"
                            action={`/${loggedInProfile?.username}?/logout`}
                            class="flex"
                        >
                            <button type="submit" class="btn btn-sm btn-primary btn-wide">
                                Logout
                            </button>
                        </form>
                    </li>
                {/if}
            </ul>
        </div>
    </div>

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
                href={loggedInUser?.userWasLoggedIn ? routes?.auth?.signin : routes?.auth?.signup}
                data-sveltekit-preload-data
            >
                {loggedInUser?.userWasLoggedIn ? 'Sign In' : 'Sign Up'}
            </a>
        {/if}
    </div>
</div>
