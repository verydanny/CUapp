import { fail } from '@sveltejs/kit'
import { isNotUniqueAttribute } from '$lib/server/databaseHelpers'
import { redirect } from '@sveltejs/kit'
import { createAdminClient } from '$lib/server/auth/appwrite.js'

export const actions = {
    setUsername: async ({ request, locals }) => {
        // Extract the form data.
        const form = await request.formData()
        const username = form.get('username') as string

        if (!username || !locals?.user?.$id) {
            return fail(400, {
                success: false,
                message: 'Missing username or user id'
            })
        }

        const { databases } = createAdminClient()

        if (await isNotUniqueAttribute('main', 'profiles', 'username', username)) {
            return fail(400, {
                success: false,
                message: `Username "${username}" already taken`
            })
        }

        // Attempt to update only if username doesn't exist
        await databases.updateDocument('main', 'profiles', locals.user.$id, {
            username: username
        })

        return redirect(302, '/')
    }
}
