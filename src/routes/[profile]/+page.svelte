<script lang="ts">
    import { applyAction, deserialize } from '$app/forms'
    import { invalidateAll } from '$app/navigation'
    import ProfileImage from '$layout/components/profileImage.svelte'
    import { type ActionResult } from '@sveltejs/kit'
    // import type { ComponentProps } from 'svelte'
    // import { ID, type Models } from 'appwrite'

    // import { createUserSessionClient } from '$lib/client/auth/appwrite.js'
    // import Cropper from '$lib/client/components/cropper/cropper.svelte'

    let { data } = $props()
    let { profile, loggedInUser, isProfileOwner, canViewProfile, followStatus } = $derived(data)

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

    function handleSubmitData<T extends Record<string, string | boolean | undefined>>(data: T) {
        return async (event: SubmitEvent & { currentTarget: EventTarget & HTMLFormElement }) => {
            event.preventDefault()
            const formData = new FormData(event.currentTarget)

            if (data) {
                Object.entries(data).forEach(([key, value]) => {
                    formData.set(key, String(value))
                })
            }

            const response = await fetch(event.currentTarget.action, {
                method: event.currentTarget.method,
                body: formData
            })

            const result: ActionResult = deserialize(await response.text())

            if (result.type === 'success') {
                await invalidateAll()
            }

            applyAction(result)
        }
    }
</script>

{#snippet formOutlineButton(
    text: string,
    btnClass: 'secondary' | 'neutral' | 'primary' | 'accent' | 'ghost',
    action: string,
    onsubmit?: (event: SubmitEvent & { currentTarget: EventTarget & HTMLFormElement }) => void
)}
    <form method="post" {action} {onsubmit}>
        <button type="submit" class="btn btn-outline btn-{btnClass}">{text}</button>
    </form>
{/snippet}

<!-- User Profile Card using DaisyUI -->
<div class="card bg-base-100">
    <ProfileImage imageUrl={profile?.profileImage} />
    <div class="card-body">
        <h2 class="card-title mb-0">@{profile?.username}</h2>
        {#if isProfileOwner}
            <p class="text-sm text-gray-500">{loggedInUser?.email}</p>
        {:else if !canViewProfile}
            <p class="text-sm text-gray-500">This profile is private.</p>
        {/if}
        <div class="card-actions mt-4 justify-end">
            {#if isProfileOwner}
                <a
                    class="btn btn-outline btn-neutral"
                    href="/{profile?.username}/edit"
                    data-sveltekit-preload-data>Settings</a
                >
                {@render formOutlineButton('Log out', 'secondary', '[profile]?/logout')}
            {:else if followStatus === 'following'}
                {@render formOutlineButton(
                    'Unfollow',
                    'secondary',
                    '[profile]?/unfollow',
                    handleSubmitData({
                        profileId: profile?.$id,
                        followerId: loggedInUser?.$id
                    })
                )}
            {:else if followStatus === 'pending'}
                {@render formOutlineButton(
                    'Cancel',
                    'secondary',
                    '[profile]?/cancel',
                    handleSubmitData({
                        profileId: profile?.$id,
                        followerId: loggedInUser?.$id
                    })
                )}
            {:else}
                {@render formOutlineButton(
                    'Follow',
                    'secondary',
                    '[profile]?/follow',
                    handleSubmitData({
                        profileId: profile?.$id,
                        followerId: loggedInUser?.$id,
                        pending: profile?.isPrivateProfile
                    })
                )}
            {/if}
        </div>
    </div>
</div>
