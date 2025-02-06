<script lang="ts">
    import type { ComponentProps } from 'svelte'
    import { ID, type Models } from 'appwrite'
    import mime2ext from 'mime2ext'

    import { createUserSessionClient } from '$lib/client/auth/appwrite.js'
    import Cropper from '$lib/client/components/cropper/cropper.svelte'

    let { data } = $props()
    let { user, profileImageUrls, session } = data

    const { storage, database } = createUserSessionClient(session)

    const deleteFiles = async () => {
        const { files } = await storage.listFiles('profile-images', [], user?.$id)

        if (files) {
            await Promise.allSettled(
                files
                    .filter((result): result is Models.File => Boolean(result.$id))
                    .map((result) => storage.deleteFile('profile-images', result.$id))
            )
        }
    }

    const updateProfileImageDocument = async (userId: string, fileId: string | null) => {
        try {
            await database.updateDocument('main', 'profiles', userId, {
                profileImage: fileId
            })
        } catch (error) {
            console.error(error)
        }
    }

    // Handle form submission for cropping and uploading a new image.
    const handleUpload: ComponentProps<typeof Cropper>['onCrop'] = async (blobs) => {
        await Promise.all([deleteFiles(), updateProfileImageDocument(user?.$id, null)])
        await Promise.all(
            Object.keys(blobs).map((key) => {
                const blob = blobs[key as keyof typeof blobs]
                if (blob) {
                    const fileExtension = mime2ext(blob.type)
                    const uniqueFilename = `profile-${ID.unique()}.${fileExtension}`
                    const fileToUpload = new File([blob], uniqueFilename, {
                        type: blob.type
                    })

                    return storage.createFile(
                        'profile-images',
                        `${user?.profileId}-${key}`,
                        fileToUpload
                    )
                }
            })
        )
        await updateProfileImageDocument(user?.$id, user?.$id)
        window.location.reload()
    }

    // Local state to control whether the Cropper modal is active.
    let cropping = $state(false)
    let cropperSrc = $state<string | null>(null)

    // When the user clicks their profile image, set the cropper source.
    function handleImageClick() {
        if (profileImageUrls && profileImageUrls.length > 0) {
            cropperSrc = profileImageUrls[0].url
        }
        cropping = true
    }
</script>

<!-- User Profile Card using DaisyUI -->
<div class="flex flex-col items-center justify-center p-6">
    <div class="card bg-base-100 w-96 shadow-xl">
        <figure class="relative">
            {#if profileImageUrls?.[0]?.url}
                <img
                    src={profileImageUrls[0].url}
                    alt="Profile"
                    class="mx-auto mt-4 h-32 w-32 cursor-pointer rounded-full object-cover"
                />
                <button
                    type="button"
                    class="btn btn-sm btn-secondary absolute right-0 bottom-0"
                    onclick={handleImageClick}
                >
                    Edit
                </button>
            {:else}
                <button
                    class="mx-auto mt-4 flex h-32 w-32 cursor-pointer items-center justify-center rounded-full bg-gray-300"
                    onclick={() => {
                        cropping = true
                        cropperSrc = null
                    }}
                >
                    <span class="text-3xl text-white">?</span>
                </button>
            {/if}
        </figure>
        <div class="card-body items-center text-center">
            <h2 class="card-title">{user?.name}</h2>
            <p class="text-sm text-gray-500">{user?.email}</p>
            <div class="mt-2">
                <span class="badge badge-outline">{user?.username}</span>
            </div>
            <div class="card-actions mt-4">
                <form method="post" action="/user/account?/logout">
                    <button type="submit" class="btn btn-primary">Log out</button>
                </form>
            </div>
        </div>
    </div>
</div>

<!-- Cropper Modal (DaisyUI) -->
{#if cropping}
    <div class="modal modal-open">
        <div class="modal-box max-w-md">
            <h3 class="mb-4 text-lg font-bold">Edit Profile Image</h3>
            <Cropper onCrop={handleUpload} size={150} src={cropperSrc} useCredentials={true} />
            <div class="modal-action">
                <button class="btn" onclick={() => (cropping = false)}>Cancel</button>
            </div>
        </div>
    </div>
{/if}
