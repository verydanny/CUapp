<script lang="ts">
    import ProfileImage from '$layout/components/profileImage.svelte'
    // import type { ComponentProps } from 'svelte'
    // import { ID, type Models } from 'appwrite'

    // import { createUserSessionClient } from '$lib/client/auth/appwrite.js'
    // import Cropper from '$lib/client/components/cropper/cropper.svelte'

    let { data } = $props()
    let { user, profile, canViewProfile, isUserCurrentlyLoggedIn } = data

    // const { storage, database } = createUserSessionClient(session)

    // const deleteFiles = async () => {
    //     const { files } = await storage.listFiles('profile-images', [], user?.$id)

    //     if (files) {
    //         await Promise.allSettled(
    //             files
    //                 .filter((result): result is Models.File => Boolean(result.$id))
    //                 .map((result) => storage.deleteFile('profile-images', result.$id))
    //         )
    //     }
    // }

    // const updateProfileImageDocument = async (userId: string, fileId: string | null) => {
    //     try {
    //         await database.updateDocument('main', 'profiles', userId, {
    //             profileImage: fileId
    //         })
    //     } catch (error) {
    //         console.error(error)
    //     }
    // }

    // Handle form submission for cropping and uploading a new image.
    // const handleUpload: ComponentProps<typeof Cropper>['onCrop'] = async (blobs) => {
    //     await Promise.all([deleteFiles(), updateProfileImageDocument(user?.$id, null)])
    //     await Promise.all(
    //         Object.keys(blobs).map((key) => {
    //             const blob = blobs[key as keyof typeof blobs]
    //             if (blob) {
    //                 const fileExtension = mime2ext(blob.type)
    //                 const uniqueFilename = `profile-${ID.unique()}.${fileExtension}`
    //                 const fileToUpload = new File([blob], uniqueFilename, {
    //                     type: blob.type
    //                 })

    //                 return storage.createFile(
    //                     'profile-images',
    //                     `${user?.profileId}-${key}`,
    //                     fileToUpload
    //                 )
    //             }
    //         })
    //     )
    //     await updateProfileImageDocument(user?.$id, user?.$id)
    //     window.location.reload()
    // }
</script>

<!-- User Profile Card using DaisyUI -->
<div class="card bg-base-100">
    {#if canViewProfile}
        <ProfileImage imageUrl={profile?.profileImage} />
        <div class="card-body">
            <h2 class="card-title mb-0">@{profile?.username}</h2>
            <p class="text-sm text-gray-500">{user?.email}</p>
            {#if isUserCurrentlyLoggedIn}
                <div class="card-actions mt-4 justify-end">
                    <a
                        class="btn btn-outline btn-neutral"
                        href="/{profile?.username}/edit"
                        data-sveltekit-preload-data>Settings</a
                    >
                    <form method="post" action="[profile]?/logout">
                        <button type="submit" class="btn btn-outline btn-secondary">Log out</button>
                    </form>
                </div>
            {/if}
        </div>
    {:else}
        <div class="card-body">
            <p class="text-sm text-gray-500">Only us ghosts here.</p>
        </div>
    {/if}
</div>
