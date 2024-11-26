<!-- src/routes/signup/+page.svelte -->
<script lang="ts">
    // import { startRegistration } from '@simplewebauthn/browser';
    import { onMount } from 'svelte'
    import { enhance, applyAction, deserialize } from '$app/forms'

    import type { ActionData } from './$types'
    import type { ActionResult } from '@sveltejs/kit'
    import { goto } from '$app/navigation'

    type NonNullableActionData = NonNullable<ActionData>

    let { form } = $props()
    let startRegistration = $state<
        typeof import('@simplewebauthn/browser').startRegistration | null
    >(null)

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
        try {
            ;({ startRegistration } = await import('@simplewebauthn/browser'))
        } catch (error) {
            console.error(`Error importing startRegistration: ${error}`)
        }
    })

    const handleSignupChallenge = () => {
        return async ({ result }: { result: ActionResult<NonNullableActionData> }) => {
            console.log('result', result)
            if (result?.type === 'redirect') {
                return goto(result?.location)
            }

            if (result?.type === 'success') {
                if (result.data?.body && 'challengeId' in result.data.body && startRegistration) {
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

                    return applyAction(deserializedResult)
                }
            }

            return applyAction(result)
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
