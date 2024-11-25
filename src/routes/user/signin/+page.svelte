<!-- src/routes/user/signin/+page.svelte -->
<script lang="ts">
    // import { startRegistration } from '@simplewebauthn/browser';
    import { onMount } from 'svelte'
    import { enhance, applyAction, deserialize } from '$app/forms'

    import type { ActionData } from './$types'
    import type { ActionResult } from '@sveltejs/kit'
    import { goto } from '$app/navigation'

    type NonNullableActionData = NonNullable<ActionData>

    let { form } = $props()
    let startAuthentication = $state<
        typeof import('@simplewebauthn/browser').startAuthentication | null
    >(null)

    onMount(async () => {
        try {
            ;({ startAuthentication } = await import('@simplewebauthn/browser'))
        } catch (error) {
            console.error(`Error importing startAuthentication: ${error}`)
        }
    })

    const handleSignupChallenge = () => {
        return async ({ result }: { result: ActionResult<NonNullableActionData> }) => {
            if (result?.type === 'redirect') {
                return goto(result?.location)
            }

            if (result?.type === 'success') {
                if (startAuthentication && result?.data?.body && result?.data?.success) {
                    const authentication = await startAuthentication({
                        useBrowserAutofill: false,
                        optionsJSON: result.data.body.options
                    })

                    try {
                        const response = deserialize(
                            await (
                                await fetch('?/verifyPasskey', {
                                    method: 'post',
                                    body: JSON.stringify({
                                        challengeId: result.data.body.challengeId,
                                        authentication
                                    })
                                })
                            ).text()
                        )

                        return applyAction(response)
                    } catch (error) {
                        console.error(`Error deserializing response: ${error}`)
                    }
                }
            }

            applyAction(result)
        }
    }
</script>

<form action="?/signin" method="post" use:enhance={handleSignupChallenge} autocomplete="on">
    {#if form?.error}
        <p>{form.error}</p>
    {/if}
    <input
        id="username"
        name="username"
        placeholder="Email"
        type="email"
        autocomplete="username webauthn"
    />
    <button type="submit">Sign In</button>
</form>
