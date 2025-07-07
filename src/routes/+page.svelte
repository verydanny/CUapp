<script lang="ts">
    import type { PageData } from './$types.js';

    let { data }: { data: PageData } = $props();

    let posts = $derived(data.posts);
    let error = $derived(data.error);
    let userIdsToUsernamesMap = $derived(data.userIdsToUsernamesMap);
    let pageTitle = $derived(data.pageTitle || 'Feed');
</script>

<svelte:head>
    <title>{pageTitle}</title>
    <meta name="description" content="Latest posts from the community." />
</svelte:head>

<div class="container mx-auto p-4">
    <h1 class="text-primary mb-6 text-3xl font-bold">{pageTitle}</h1>

    {#if error}
        <div class="alert alert-error">
            <span>Error loading feed: {error}</span>
        </div>
    {/if}

    {#if posts && posts.length > 0}
        <div class="flex flex-col items-center justify-center">
            <div class="py-10 text-center">
                <a href="/create/textpost" class="btn btn-primary mt-4">Create</a>
            </div>
        </div>
        <div class="space-y-6">
            {#each posts as post (post.$id)}
                <article class="card bg-base-100 shadow-sm">
                    <div class="card-body">
                        <h2 class="card-title">
                            {post.title}
                        </h2>

                        {#if post.body}
                            <div class="prose mt-2 line-clamp-3 max-w-none">
                                {post.body}
                            </div>
                        {/if}

                        <div class="card-actions justify-end">
                            <span class="text-base-content/60 text-xs">
                                Posted on: {new Date(post.$createdAt).toLocaleDateString()} by User:
                                {userIdsToUsernamesMap?.[post?.userId ?? ''] ?? 'Anonymous User'}
                            </span>
                            <!-- Link to full post page - assumes /posts/[id] will exist -->
                            <a
                                href={`/posts/${post.$id}`}
                                class="btn btn-sm btn-outline btn-primary"
                            >
                                Read More
                            </a>
                        </div>
                    </div>
                </article>
            {/each}
        </div>
    {:else if !error}
        <div class="py-10 text-center">
            <p class="text-base-content/70 text-xl">No posts yet. Be the first to create one!</p>
            <a href="/create/textpost" class="btn btn-primary mt-4">Create</a>
        </div>
    {/if}
</div>
