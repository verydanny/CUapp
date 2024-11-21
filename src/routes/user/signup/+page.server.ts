// src/routes/signup/+page.server.js
// import { fail } from '@sveltejs/kit';
import { generateRegistrationOptions } from '@simplewebauthn/server'
// import * as SimpleWebAuthnServerHelpers from '@simplewebauthn/server/helpers';

import { MY_SALT, ALLOWED_HOSTNAME } from '$env/static/private'

// import { SESSION_COOKIE, createAdminClient, createSessionClient } from '$lib/server/appwrite.js';
import { AppwriteAuth } from '$lib/server/appwrite-auth'
// import { generatePassword, encrypt } from '$lib/server/crypto.js';
// import { redirect } from '@sveltejs/kit';
// import { ID } from 'node-appwrite';

import type { RequestEvent } from './$types'

// import all from './$types';

// export async function load({ locals }) {
// 	// Logged out users can't access this page.
// 	if (locals.user) redirect(302, '/user/account');

// 	// Pass the stored user local to the page.
// 	return {
// 		user: locals.user
// 	};
// }

export const actions = {
	signup: async (req: RequestEvent) => {
		const authUser = new AppwriteAuth()

		const { request, cookies } = req
		// Extract the form data.
		const form = await request.formData()
		const email = form.get('email')
		if (!email) {
			return {
				status: 400,
				body: { error: 'Missing required fields' }
			}
		}
		if (typeof email !== 'string') {
			return {
				status: 400,
				body: { error: 'Invalid form data' }
			}
		}
		const user = await authUser.prepareUser(email)
		const credentials = await authUser.getCredential(user.$id)
		if (credentials) {
			return {
				status: 400,
				body: { error: 'User already has credentials' }
			}
		}
		const encoder = new TextEncoder()
		const userIdArrayBuffer = encoder.encode(user.$id)
		const options = await generateRegistrationOptions({
			rpName: 'CUApp',
			rpID: ALLOWED_HOSTNAME,
			userID: userIdArrayBuffer,
			userName: email,
			userDisplayName: email,
			attestationType: 'none',
			authenticatorSelection: {
				residentKey: 'preferred',
				userVerification: 'preferred',
				authenticatorAttachment: 'platform'
			}
		})
		const challenge = await authUser.createChallenge(user.$id, options.challenge)
		return {
			success: true,
			body: {
				challengeId: challenge.$id,
				options
			}
		}
	}
}

// Old flow
// export const actions = {
// 	signup: async (req: RequestEvent) => {
// 		// Create the Appwrite client.
// 		const { account } = createAdminClient();
// 		const password = generatePassword(16, 48);
// 		const encryptedPassword = encodeURIComponent(encrypt(password, MY_SALT));

// 		// Create the session using the client
// 		await account.create(ID.unique(), email, password);
// 		const session = await account.createEmailPasswordSession(email, password);

// 		const verificationUrl = `http://localhost:5173/user/verify?query=${encryptedPassword}`;

// 		// Set the session cookie with the secret
// 		cookies.set(SESSION_COOKIE, session.secret, {
// 			sameSite: 'strict',
// 			expires: new Date(session.expire),
// 			secure: true,
// 			path: '/'
// 		});

// 		const sessionClient = createSessionClient(req);

// 		try {
// 			await sessionClient.account.createVerification(verificationUrl);
// 		} catch (error) {
// 			console.error('Error creating verification:', error);
// 		}

// 		// Redirect to the account page.
// 		// redirect(302, '/user/account');
// 	}
// }
