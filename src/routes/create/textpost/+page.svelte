<script lang="ts">
    // import type { CreatetextPostData } from '$lib/server/appwrite-utils/richtext.appwrite.js';
    import type { PostDocument } from '$lib/server/appwrite-utils/posts.appwrite.js';
    import { ID } from 'node-appwrite';

    let selectedPostType = $state<string>('textPost');
    // Removed postId state
    let title = $state<string>('');
    let body = $state<string>('');
    let submissionStatus = $state<{ message: string | null; type: string | null } | null>(null);
    let isLoading = $state(false);

    async function handleSubmit(event: SubmitEvent) {
        event.preventDefault();
        const postId = ID.unique();
        const contentRefId = ID.unique();

        // TODO: add this to the /api/posts POST endpoint
        const createPost = async () =>
            fetch('/api/posts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ postId, type: 'textPost', contentRefId })
            });
        const createtextPost = async () =>
            fetch('/api/textpost', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ $id: contentRefId, postId, title, body })
            });

        if (!title.trim()) {
            submissionStatus = {
                message: 'Error: Title is required.',
                type: 'error'
            };
            return;
        }
        if (!body.trim()) {
            submissionStatus = {
                message: 'Error: Body is required.',
                type: 'error'
            };
            return;
        }

        isLoading = true;
        submissionStatus = {
            message: 'Creating post...',
            type: 'info'
        };

        try {
            const [post, _textPost] = await Promise.all([createPost(), createtextPost()]);
            const postResult = (await post.json()) as PostDocument;

            submissionStatus = {
                message: `Success! Post created. ID: ${postResult.$id}`,
                type: 'success'
            };
            title = '';
            body = '';
        } catch (error) {
            console.error('Error during post creation flow:', error);
            submissionStatus = {
                message: `Error: An unexpected error occurred. ${(error as Error).message || 'Check console.'}`,
                type: 'error'
            };
        } finally {
            isLoading = false;
        }
    }

    $effect(() => {
        console.log('submissionStatus', submissionStatus);
    });
</script>

<div class="container mx-auto max-w-2xl p-4">
    <h1 class="text-primary mb-6 text-3xl font-bold">Create New Post</h1>

    {#if selectedPostType === 'textPost'}
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
                <textarea
                    id="body"
                    placeholder="Post Body"
                    class="textarea textarea-bordered w-full"
                    bind:value={body}
                    required
                    disabled={isLoading}
                ></textarea>
            </div>

            <div class="form-control mt-6">
                <button type="submit" class="btn btn-primary" disabled={isLoading}>
                    {#if isLoading}
                        <span class="loading loading-spinner"></span>
                    {/if}
                    Create Rich Text Post
                </button>
            </div>

            {#if submissionStatus?.type}
                <div class="alert mt-4 alert-{submissionStatus.type}">
                    <span>{submissionStatus.message}</span>
                </div>
            {/if}
        </form>
    {/if}
</div>
