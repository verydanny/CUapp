import { json } from '@sveltejs/kit'
import { AppwriteAuth } from '$lib/server/appwrite-auth'
import { ALLOWED_HOSTNAME } from '$env/static/private'

import type { RequestEvent } from './$types'

const appwriteAuth = new AppwriteAuth()

const corsHeaders = {
	'Access-Control-Allow-Origin': ALLOWED_HOSTNAME,
	'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
	'Access-Control-Allow-Headers': 'Origin, Content-Type'
}

export async function GET(req: RequestEvent) {
	return json({
		hello: 'world'
	})
}

export async function POST({ request }: RequestEvent) {
	try {
		const body = await request.json()

		if (!body.email) {
			return json({
				error: "property: 'email' is required"
			})
		}

		const user = await appwriteAuth.prepareUser(body.email)

		return json({
			success: true
		})
	} catch {
		return json({
			error: 'Error parsing body'
		})
	}
}
