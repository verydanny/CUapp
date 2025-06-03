import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { Permission, Role } from 'node-appwrite';
import { createtextPost } from '$lib/server/appwrite-utils/richtext.appwrite.js';
import { createUserSessionClient } from '$lib/server/appwrite-utils/appwrite.js';

// Placeholder POST function
export async function POST(event: RequestEvent) {
    if (!event.locals.user.$id) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { databases } = createUserSessionClient({ cookies: event.cookies });

    try {
        const data = await event.request.json();

        // Basic validation
        if (!data.postId || typeof data.postId !== 'string') {
            return json({ error: 'postId is required and must be a string' }, { status: 400 });
        }
        if (!data.title || typeof data.title !== 'string') {
            return json({ error: 'title is required and must be a string' }, { status: 400 });
        }
        if (!data.body || typeof data.body !== 'string') {
            return json({ error: 'body is required and must be a string' }, { status: 400 });
        }

        // Add other optional field validations if necessary, or use a schema validation library like Zod
        const newtextPostDocument = await createtextPost(databases, data, [
            Permission.read(Role.any()),
            Permission.write(Role.user(event.locals.user.$id))
        ]);
        return json(newtextPostDocument, { status: 201 });
    } catch (error: unknown) {
        if (error instanceof SyntaxError) {
            return json({ error: 'Invalid JSON in request body' }, { status: 400 });
        }

        console.error('[API - POST /api/textPosts] Error:', error);

        // Check if error is an object and has a message property before accessing it
        const message =
            typeof error === 'object' && error !== null && 'message' in error
                ? String((error as { message: unknown }).message)
                : 'Unknown error';

        return json(
            { error: 'Failed to create rich text post', details: message },
            { status: 500 }
        );
    }
}
