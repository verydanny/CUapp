<!-- src/routes/signup/+page.svelte -->
<script lang="ts">
	import { enhance } from '$app/forms';

	let { form } = $props();

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
</script>

<form action="?/signup" method="post" use:enhance>
	<input id="email" name="email" placeholder="Email" type="email" />
	<button type="submit">Sign up</button>
</form>
