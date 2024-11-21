import { redirect } from '@sveltejs/kit'

export async function load({ locals }) {
	// Access our user from locals.
	if (!locals.user) {
		// If no user is logged in, redirect to the sign up page.
		redirect(301, '/user/signup')
	}

	// If the user is logged in, redirect to the account page.
	redirect(301, '/user/account')
}
