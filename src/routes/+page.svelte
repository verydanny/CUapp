<script lang="ts">
    import type { PageData } from './$types.js';
    import type { RichTextPostSpecificData } from './+page.server.js';

    let { data }: { data: PageData } = $props();

    console.log(data);

    let posts = $derived(data.posts);
    let error = $derived(data.error);
    let pageTitle = $derived(data.pageTitle || 'Feed');

    // Helper to check if content is RichTextPostSpecificData
    function isRichTextContent(
        content: RichTextPostSpecificData | { error: string } | null
    ): content is RichTextPostSpecificData {
        return (
            content !== null &&
            typeof (content as RichTextPostSpecificData).title === 'string' &&
            typeof (content as RichTextPostSpecificData).body === 'string' &&
            !(content as { error: string }).error
        );
    }
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
        <div class="space-y-6">
            {#each posts as post (post.id)}
                <article class="card bg-base-100 shadow-xl">
                    <div class="card-body">
                        <h2 class="card-title">
                            {#if post.content && isRichTextContent(post.content)}
                                {post.content.title}
                            {:else if post.type === 'richTextPost'}
                                Rich Text Post (Content Error or Missing)
                            {:else}
                                Post of type: {post.type}
                            {/if}
                        </h2>

                        {#if post.content && isRichTextContent(post.content)}
                            {#if post.content.excerpt}
                                <p class="text-base-content/80">{post.content.excerpt}</p>
                            {/if}
                            <!-- CAUTION: post.content.body is rendered with {@html ...} -->
                            <!-- Ensure this content is sanitized if it can contain arbitrary user-supplied HTML. -->
                            <!-- For now, assuming it's either safe or will be handled (e.g. Markdown to HTML conversion). -->
                            <div class="prose mt-2 line-clamp-3 max-w-none">
                                {post.content.body}
                            </div>
                        {:else if post.content && post.content.error}
                            <p class="text-error italic">
                                Error loading content: {post.content.error}
                            </p>
                        {/if}

                        <div class="card-actions mt-4 justify-end">
                            <span class="text-base-content/60 text-xs">
                                Posted on: {new Date(post.createdAt).toLocaleDateString()} by User: {post.userId}
                            </span>
                            <!-- Link to full post page - assumes /posts/[id] will exist -->
                            <a
                                href={`/posts/${post.id}`}
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
            <a href="/create/richtextpost" class="btn btn-primary mt-4">Create Rich Text Post</a>
        </div>
    {/if}
</div>
