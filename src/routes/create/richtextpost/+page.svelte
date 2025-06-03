<script lang="ts">
    // import type { CreateRichTextPostData } from '$lib/server/appwrite-utils/richtext.appwrite.js';
    import type { PostDocument } from '$lib/server/appwrite-utils/posts.appwrite.js';
    import { ID } from 'node-appwrite';

    let selectedPostType = $state('richTextPost');
    // Removed postId state
    let title = $state('');
    let body = $state('');
    let submissionStatus = $state('');
    let isLoading = $state(false);

    const postTypes = [
        { value: 'richTextPost', label: 'RichText Post' },
        { value: 'status', label: 'Status Update (Future)' },
        { value: 'imagePost', label: 'Image Post (Future)' }
    ];

    async function handleSubmit(event: SubmitEvent) {
        event.preventDefault();
        const postId = ID.unique();
        const contentRefId = ID.unique();

        // TODO: add this to the /api/posts POST endpoint
        const createPost = async () =>
            fetch('/api/posts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ postId, type: 'richTextPost', contentRefId })
            });
        const createRichTextPost = async () =>
            fetch('/api/richtextposts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ $id: contentRefId, postId, title, body })
            });

        if (!title.trim()) {
            submissionStatus = 'Error: Title is required.';
            return;
        }
        if (!body.trim()) {
            submissionStatus = 'Error: Body is required.';
            return;
        }

        isLoading = true;
        submissionStatus = 'Creating post...';

        try {
            const [post, _richTextPost] = await Promise.all([createPost(), createRichTextPost()]);
            const postResult = (await post.json()) as PostDocument;

            submissionStatus = `Success! Post created. ID: ${postResult.$id}`;
            title = '';
            body = '';
        } catch (error) {
            console.error('Error during post creation flow:', error);
            submissionStatus = `Error: An unexpected error occurred. ${(error as Error).message || 'Check console.'}`;
        } finally {
            isLoading = false;
        }
    }
</script>

<div class="container mx-auto max-w-2xl p-4">
    <h1 class="text-primary mb-6 text-3xl font-bold">Create New Post</h1>

    <div class="form-control mb-4">
        <label class="label" for="postType">
            <span class="label-text">Post Type</span>
        </label>
        <select
            id="postType"
            class="select select-bordered w-full"
            bind:value={selectedPostType}
            disabled={isLoading}
        >
            {#each postTypes as type (type.value)}
                <option value={type.value} disabled={type.value !== 'richTextPost'}>
                    {type.label}
                </option>
            {/each}
        </select>
        {#if selectedPostType !== 'richTextPost'}
            <p class="text-warning mt-1 text-xs">Only Rich Text Post is currently supported.</p>
        {/if}
    </div>

    {#if selectedPostType === 'richTextPost'}
        <form onsubmit={handleSubmit} class="space-y-4">
            <!-- Removed TEMPORARY Post ID Field -->
            <div class="form-control">
                <label class="label" for="title">
                    <span class="label-text">Title</span>
                </label>
                <input
                    type="text"
                    id="title"
                    placeholder="Post Title"
                    class="input input-bordered w-full"
                    bind:value={title}
                    required
                    disabled={isLoading}
                />
            </div>

            <div class="form-control">
                <label class="label" for="body">
                    <span class="label-text">Body</span>
                </label>
            </div>

            <div class="form-control mt-6">
                <button type="submit" class="btn btn-primary" disabled={isLoading}>
                    {#if isLoading}
                        <span class="loading loading-spinner"></span>
                    {/if}
                    Create Rich Text Post
                </button>
            </div>

            {#if submissionStatus}
                <div
                    class="alert mt-4 {submissionStatus.toLowerCase().startsWith('success')
                        ? 'alert-success'
                        : 'alert-error'}"
                >
                    <span>{submissionStatus}</span>
                </div>
            {/if}
        </form>
    {:else if selectedPostType === 'status'}
        <div class="alert alert-info">
            <p>Status Update UI coming soon.</p>
        </div>
    {:else if selectedPostType === 'imagePost'}
        <div class="alert alert-info">
            <p>Image Post UI coming soon.</p>
        </div>
    {/if}
</div>
