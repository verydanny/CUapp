import { json } from '@sveltejs/kit';
import { AppwriteException } from 'node-appwrite';
import type { RequestEvent } from '@sveltejs/kit';
import { createUserSessionClient } from '$lib/server/appwrite-utils/appwrite.js';
import {
    getRichTextPostById,
    updateRichTextPost,
    deleteRichTextPost
} from '$lib/server/appwrite-utils/richtext.appwrite.js';
import type { UpdateRichTextPostData } from '$lib/server/appwrite-utils/richtext.appwrite.js';

// Placeholder GET function
export async function GET(event: RequestEvent) {
    const { id } = event.params;

    if (!id) {
        return json({ error: 'Post ID is required' }, { status: 400 });
    }

    const { databases } = createUserSessionClient({ cookies: event.cookies });

    try {
        const document = await getRichTextPostById(databases, id);
        return json(document, { status: 200 });
    } catch (error) {
        console.error(`Error fetching RichTextPost by ID ${id}:`, error);
        if (error instanceof AppwriteException && error.code === 404) {
            return json({ error: 'RichTextPost not found' }, { status: 404 });
        }
        return json(
            {
                error: 'Failed to fetch RichTextPost',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}

// Placeholder PATCH function
export async function PATCH(event: RequestEvent) {
    const { id } = event.params;

    if (!id) {
        return json({ error: 'Post ID is required for update' }, { status: 400 });
    }

    let data: UpdateRichTextPostData;
    try {
        data = (await event.request.json()) as UpdateRichTextPostData;
        if (Object.keys(data).length === 0) {
            return json(
                { error: 'Request body is empty or contains no fields to update' },
                { status: 400 }
            );
        }
    } catch (error) {
        if (error instanceof SyntaxError) {
            return json(
                { error: 'Invalid JSON in request body', details: error.message },
                { status: 400 }
            );
        }
        // For other errors during request parsing (e.g., network issues before full parsing)
        console.error('Error parsing PATCH request body:', error);
        return json(
            {
                error: 'Failed to parse request body',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 400 }
        );
    }

    const { databases } = createUserSessionClient({ cookies: event.cookies });

    try {
        const updatedDocument = await updateRichTextPost(databases, id, data);
        return json(updatedDocument, { status: 200 });
    } catch (error) {
        console.error(`Error updating RichTextPost ${id}:`, error);
        if (error instanceof AppwriteException && error.code === 404) {
            return json({ error: 'RichTextPost not found to update' }, { status: 404 });
        }
        // Handle other Appwrite or unexpected errors
        return json(
            {
                error: 'Failed to update RichTextPost',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}

export async function DELETE(event: RequestEvent) {
    const { id } = event.params;

    if (!id) {
        return json({ error: 'Post ID is required for deletion' }, { status: 400 });
    }

    const { databases } = createUserSessionClient({ cookies: event.cookies });

    try {
        await deleteRichTextPost(databases, id);
        // Return 204 No Content for successful deletion, with an empty body
        return new Response(null, { status: 204 });
    } catch (error) {
        console.error(`Error deleting RichTextPost ${id}:`, error);
        if (error instanceof AppwriteException && error.code === 404) {
            return json({ error: 'RichTextPost not found to delete' }, { status: 404 });
        }
        // Handle other Appwrite or unexpected errors
        return json(
            {
                error: 'Failed to delete RichTextPost',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
