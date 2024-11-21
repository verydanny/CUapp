<!-- src/routes/signup/+page.svelte -->
<script lang="ts">
    // import { startRegistration } from '@simplewebauthn/browser';
    import { onMount } from 'svelte'
    import { enhance } from '$app/forms'

    import type { ActionData } from './$types'
    import type { ActionResult } from '@sveltejs/kit'

    type NonNullableActionData = NonNullable<ActionData>

    // let { data, form } = $props()
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
        startRegistration = await import('@simplewebauthn/browser').then(
            (module) => module.startRegistration
        )
    })

    const handleSignupChallenge = () => {
        return async ({ result }: { result: ActionResult<NonNullableActionData> }) => {
            if (result.type === 'success') {
                if (result.data?.body?.options) {
                    if (startRegistration) {
                        const registration = await startRegistration({
                            optionsJSON: result.data.body.options
                        })

                        console.log(registration)
                    }
                }
                // const body = (result?.data as ActionData)?.body;
            }
        }
    }
</script>

<form action="?/signup" method="post" use:enhance={handleSignupChallenge}>
    <input id="email" name="email" placeholder="Email" type="email" />
    <button type="submit">Sign up</button>
</form>
