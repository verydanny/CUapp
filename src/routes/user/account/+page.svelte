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

    // Handle form submission.
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

    // Local state to control whether the Cropper is active.
    let cropping = $state(false)
    let cropperSrc = $state<string | null>(null)

    // When the user clicks their profile image, set the cropper source.
    function handleImageClick() {
        if (profileImageUrls && profileImageUrls.length > 0) {
            cropperSrc = profileImageUrls[0].url
            cropping = true
        }
    }
</script>

<ul>
    <li>
        <strong>Profile Image:</strong>
        {#if !cropping}
            {#if profileImageUrls?.[0]?.url}
                <picture>
                    {#each profileImageUrls as image}
                        <source srcset={image.url} type={`image/${image.mimeType}`} />
                    {/each}
                    <!-- The profile image now has an on:click handler -->
                    <img src={profileImageUrls[0].url} alt="Profile" class="profile-image" />
                    <button type="button" onclick={handleImageClick}>Edit</button>
                </picture>
            {:else}
                <button class="image-placeholder" onclick={() => (cropping = true)}>
                    No image uploaded
                </button>
            {/if}
        {/if}
        {#if cropping}
            <!-- Pass the existing profile image URL as the "src" prop -->
            <Cropper onCrop={handleUpload} size={150} src={cropperSrc} useCredentials={true} />
        {/if}
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
        {user?.username}
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
        cursor: pointer;
    }
</style>
