<!-- src/routes/user/signin/+page.svelte -->
<script lang="ts">
    import { startAuthentication } from '@simplewebauthn/browser'
    import { enhance, applyAction, deserialize } from '$app/forms'

    import type { ActionData } from './$types'
    import type { ActionResult } from '@sveltejs/kit'
    import { goto } from '$app/navigation'
    import { onMount } from 'svelte'

    type NonNullableActionData = NonNullable<ActionData>

    let { form, data } = $props()

    // const challengeId = data?.challengeId
    const optionsJSON = data?.options

    onMount(async () => {
        if (optionsJSON && optionsJSON?.allowCredentials?.length > 0) {
            try {
                const authentication = await startAuthentication({
                    optionsJSON,
                    useBrowserAutofill: false
                })

                const response = deserialize(
                    await (
                        await fetch('/user/signin?/verifyPasskey', {
                            method: 'post',
                            body: JSON.stringify({
                                // challengeId,
                                challenge: optionsJSON?.challenge,
                                credentialID: authentication?.id,
                                authentication
                            })
                        })
                    ).text()
                )

                if (response.type === 'redirect') {
                    return goto(response.location)
                }
            } catch {
                // Do nothing
            }
        }
    })

    const handleSignupChallenge = () => {
        return async ({ result }: { result: ActionResult<NonNullableActionData> }) => {
            if (result?.type === 'success' && result?.data?.success) {
                if (result.data.body.credentialID) {
                    await fetch('/api/v1/cookie/set-cookie', {
                        method: 'post',
                        body: JSON.stringify({
                            'device-id': result.data.body.credentialID
                        })
                    })
                }

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
                                    challenge: result.data.body.options?.challenge,
                                    credentialID: result.data.body.credentialID,
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
