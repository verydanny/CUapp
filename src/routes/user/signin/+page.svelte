<!-- src/routes/signin/+page.svelte -->
<script lang="ts">
    import { onMount } from 'svelte'
    import { goto } from '$app/navigation'
    import { enhance, deserialize } from '$app/forms'
    import {
        startRegistration,
        startAuthentication,
        bufferToBase64URLString
    } from '@simplewebauthn/browser'
    import {} from '@simplewebauthn/browser'

    import type { ActionResult } from '@sveltejs/kit'
    import type { ActionData } from './$types'

    type NonNullableActionData = NonNullable<ActionData>

    let { form, data } = $props()
    let currentAction = 'signup'

    onMount(async () => {
        if (data?.options) {
            try {
                const authentication = await startAuthentication({
                    optionsJSON: data.options,
                    useBrowserAutofill: false
                })

                const response = deserialize(
                    await (
                        await fetch('/user/signin?/verifySigninPasskey', {
                            method: 'post',
                            body: JSON.stringify({
                                challenge: data.options?.challenge,
                                credentialID: authentication?.id,
                                authentication
                            })
                        })
                    ).text()
                )

                if (response.type === 'success') {
                    return goto('/user/account')
                }
            } catch {
                // Do nothing
            }
        }
    })

    const handleSignupChallenge = () => {
        return async ({ result }: { result: ActionResult<NonNullableActionData> }) => {
            if (result?.type === 'success' && result?.data) {
                // Signup passkey action
                if (result?.data?.name === 'signupPasskeyAction') {
                    console.log('signupPasskeyActionResult', result?.data)
                    const registration = await startRegistration({
                        optionsJSON: {
                            ...result?.data?.body?.options,
                            extensions: {
                                ...result?.data?.body?.options?.extensions,
                                prf: {
                                    eval: {
                                        first: new TextEncoder().encode('Foo encryption key').buffer
                                    }
                                }
                            }
                        }
                    })

                    // Need to polyfill PRF support using native WebAuthn API

                    console.log('registration Results', registration)

                    // Add a try/catch to see if registration successful
                    const deserializedSignupResult = deserialize(
                        await (
                            await fetch('?/verifySignupPasskey', {
                                method: 'post',
                                body: JSON.stringify({
                                    challengeId: result?.data?.body?.challengeId,
                                    registration,
                                    headers: {
                                        'Content-Type': 'application/json'
                                    }
                                })
                            })
                        ).text()
                    )

                    if (deserializedSignupResult?.type === 'success' && registration?.id) {
                        await fetch('/api/v1/cookie/set-cookie', {
                            method: 'post',
                            body: JSON.stringify({
                                'device-id': registration?.id
                            })
                        })

                        console.log('deserializedSignupResult', deserializedSignupResult)
                    }
                }

                // Signin passkey action
                if (result?.data?.name === 'signinPasskeyAction') {
                    const authentication = await startAuthentication({
                        useBrowserAutofill: false,
                        optionsJSON: result.data.body.options
                    })

                    console.log('authentication', authentication)

                    try {
                        const response = deserialize(
                            await (
                                await fetch('?/verifySigninPasskey', {
                                    method: 'post',
                                    body: JSON.stringify({
                                        challenge: result.data.body.options?.challenge,
                                        credentialID: result.data.body.credentialID,
                                        authentication
                                    })
                                })
                            ).text()
                        )

                        if (response?.type === 'success') {
                            // We save the device-id to the cookie
                            if (result?.data?.body?.credentialID) {
                                await fetch('/api/v1/cookie/set-cookie', {
                                    method: 'post',
                                    body: JSON.stringify({
                                        'device-id': result.data.body.credentialID
                                    })
                                })
                            }

                            return goto('/user/account')
                        }
                    } catch (error) {
                        console.error(`Error deserializing response: ${error}`)
                    }
                }
            }
        }
    }
</script>

<form
    action="?/{currentAction}"
    method="post"
    use:enhance={handleSignupChallenge}
    autocomplete="on"
>
    {#if form?.error}
        <p>{form.error}</p>
    {/if}
    <label for="username">Username:</label><br />
    <input
        id="username"
        name="username"
        placeholder="Email"
        type="email"
        autocomplete="username webauthn"
    />
    <button type="submit">Login</button>
    <!-- <button type="submit">Sign In</button> -->
</form>
