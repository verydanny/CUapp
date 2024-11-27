<!-- src/routes/signup/+page.svelte -->
<script lang="ts">
    import { onMount } from 'svelte'
    import { goto } from '$app/navigation'
    import { enhance, deserialize } from '$app/forms'
    import { startRegistration, startAuthentication } from '@simplewebauthn/browser'

    import type { ActionResult } from '@sveltejs/kit'
    import type { ActionData } from './$types'

    type NonNullableActionData = NonNullable<ActionData>

    let { form, data } = $props()

    // const challengeId = data?.challengeId
    const optionsJSON = data?.options

    /**
     * 1. We create custom form action that POSTS to api/v1/auth/challenge
     * 2. We prepare user by either creating user or grabbing existing user
     * 3. If credentials exist, we return "You already have passkey. Please sign in."
     * 4. If no credentials exist, we return a challenge with `SimpleWebAuthnServer.generateRegistrationOptions`
     * 5. We save the challenge to the database with `AppwriteAuth.createChallenge`
     * 6. We return the challenge to the client
     * 7. On client, we start registration with const registration = await SimpleWebAuthnBrowser.startRegistration()
     * 8. We send the registration to PUT /api/v1/auth/challenge
     * 9. We get the challenge from the database with `AppwriteAuth.getChallenge`
     * 10. We verify the challenge with `SimpleWebAuthnServer.verifyChallenge`
     * 11. We save the credentials with `AppwriteAuth.createCredentials`
     * 12. We return "Signup successful. Please sign in."
     *
     */
    onMount(async () => {
        if (optionsJSON) {
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
                const registration = await startRegistration({
                    optionsJSON: result?.data?.body?.options
                })

                // Add a try/catch to see if registration successful
                const deserializedResult = deserialize(
                    await (
                        await fetch('?/verifyPasskey', {
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

                if (deserializedResult?.type === 'success' && registration?.id) {
                    await fetch('/api/v1/cookie/set-cookie', {
                        method: 'post',
                        body: JSON.stringify({
                            'device-id': registration?.id
                        })
                    })

                    return goto('/user/signin')
                }
            }
        }
    }
</script>

<form action="?/signup" method="post" use:enhance={handleSignupChallenge} autocomplete="on">
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
    <button type="submit">Sign up</button>
</form>
