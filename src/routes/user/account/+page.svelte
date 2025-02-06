<script lang="ts">
    import { ID } from 'appwrite'
    import { createSessionClient } from '$lib/browser/auth/appwrite'
    import Cropper from 'cropperjs'
    import mime2ext from 'mime2ext'
    import 'cropperjs/dist/cropper.css'

    let { data } = $props()
    let { user, currentUser, profileImageUrl, session } = data

    let selectedFile: File | null = null
    let previewUrl: string | null = $state(null)
    let cropper: Cropper | null = $state(null)

    const { storage } = createSessionClient(session)

    // Handle file selection
    const handleFileSelect = (event: Event) => {
        const input = event.target as HTMLInputElement
        if (input.files?.[0]) {
            selectedFile = input.files[0]
            previewUrl = URL.createObjectURL(selectedFile)

            // Wait for next tick to ensure DOM updates
            setTimeout(() => {
                const image = document.getElementById('profile-image') as HTMLImageElement
                if (!image) return

                if (cropper) cropper.destroy()

                cropper = new Cropper(image, {
                    aspectRatio: 1,
                    viewMode: 1,
                    dragMode: 'move',
                    autoCropArea: 1,
                    minContainerWidth: 500,
                    minContainerHeight: 500
                })
            }, 0)
        }
    }

    // Handle form submission
    const handleUpload: HTMLButtonElement['onclick'] = async (e) => {
        e.preventDefault()

        if (!cropper || !selectedFile) return

        // Get cropped data
        cropper
            .getCroppedCanvas({
                width: 500,
                height: 500,
                imageSmoothingQuality: 'high'
            })
            .toBlob(async (blob) => {
                // // Upload to server
                if (blob) {
                    const _blobToFile = new File(
                        [blob],
                        `profile-${ID.unique()}.${mime2ext(blob.type)}`,
                        {
                            type: blob.type
                        }
                    )

                    const file = await storage.getFile('profile-images', currentUser?.profileImage)

                    // @ts-expect-error: if empty, Storage.getFile has a `total` property
                    if (file.total === 0) {
                        console.log('No file found')
                    }

                    // We should use WASM file converter to convert the file to AVIF and store so we can just use storage.getFileView

                    // Then we use storage.createFile to upload the file

                    // Once file is created, we goto('/account') again to show the new avatar
                }
            })
    }
</script>

<ul>
    <li>
        <strong>Profile Image:</strong>
        {#if currentUser?.profileImage}
            <img src={profileImageUrl} alt="Profile" class="profile-image" />
        {:else}
            <div class="image-placeholder">No image uploaded</div>
        {/if}

        <div class="image-upload">
            <input type="file" accept="image/*" onchange={handleFileSelect} id="fileInput" />
            {#if previewUrl}
                <div class="crop-container">
                    <img id="profile-image" src={previewUrl} alt="Preview" />
                </div>
                <button onclick={handleUpload}>Upload</button>
            {/if}
        </div>
    </li>
    <li>
        <strong>Email:</strong>
        {user?.email}
    </li>
    <li>
        <strong>Name:</strong>
        {user?.name}
    </li>
    <li>
        <strong>Username:</strong>
        {currentUser?.username}
    </li>
    <li>
        <strong>ID: </strong>
        {user?.$id}
    </li>
</ul>

<form method="post" action="/user/account?/logout">
    <button type="submit">Log out</button>
</form>

<style>
    .profile-image,
    .image-placeholder {
        width: 150px;
        height: 150px;
        border-radius: 50%;
        object-fit: cover;
    }

    .crop-container {
        width: 500px;
        height: 500px;
        overflow: hidden;
        margin: 1rem 0;
    }

    .image-upload {
        margin: 1rem 0;
    }
</style>
