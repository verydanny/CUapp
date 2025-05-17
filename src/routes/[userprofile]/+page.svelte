<script lang="ts">
    import ProfileImage from '$layout/components/profileImage.svelte'
    import { formOutlineButton } from '$layout/snippets/miniForm.svelte'
    // import type { ComponentProps } from 'svelte'
    // import { ID, type Models } from 'appwrite'

    // import { createUserSessionClient } from '$lib/client/auth/appwrite.js'
    // import Cropper from '$lib/client/components/cropper/cropper.svelte'

    const { data } = $props()
    const { loggedInUser, loggedInProfile } = $derived(data)
    // const { profile, loggedInUser } = $derived(data)
    // const { isProfileOwner, canViewProfileDetails, followStatus } = $derived(profile)
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
<div class="card bg-base-100 shadow-sm">
    <!-- <div class="card-body">
        <div class="flex justify-between">
            <ProfileImage imageUrl={profile?.profileImage} />
            <div class="flex flex-col justify-center">
                <h2 class="text-xl font-bold">@{profile?.username}</h2>
                {#if isProfileOwner}
                    <span class="text-xl">{loggedInUser?.email}</span>
                {/if}
            </div>
        </div>
        {#if canViewProfileDetails}
            <div class="card-actions mt-4 justify-end">
                {#if isProfileOwner}
                    <a
                        class="btn btn-outline btn-neutral"
                        href="/{profile?.username}/edit"
                        data-sveltekit-preload-data>Settings</a
                    >
                    {@render formOutlineButton('Log out', 'secondary', '[profile]?/logout')}
                {:else if followStatus === 'following'}
                    {@render formOutlineButton('Unfollow', 'secondary', '[profile]?/unfollow', {
                        profileId: profile?.$id,
                        followerId: loggedInUser?.$id
                    })}
                {:else if followStatus === 'pending'}
                    {@render formOutlineButton('Cancel', 'secondary', '[profile]?/unfollow', {
                        profileId: profile?.$id,
                        followerId: loggedInUser?.$id
                    })}
                {:else}
                    {@render formOutlineButton('Follow', 'secondary', '[profile]?/follow', {
                        profileId: profile?.$id,
                        followerId: loggedInUser?.$id,
                        pending: profile?.isPrivateProfile
                    })}
                {/if}
            </div>
        {:else}
            <p class="text-sm text-gray-500">This profile is private.</p>
        {/if}
    </div> -->
</div>
