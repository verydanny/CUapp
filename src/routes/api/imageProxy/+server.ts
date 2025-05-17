import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createAdminClient } from '$lib/server/appwrite-utils/appwrite';
import { APPWRITE_BUCKET_IMAGES } from '$env/static/private'; // Assuming you have a bucket ID in env

export const GET: RequestHandler = async ({ url }) => {
    const fileId = url.searchParams.get('fileId');

    if (!fileId) {
        throw error(400, 'Missing fileId parameter');
    }

    if (!APPWRITE_BUCKET_IMAGES) {
        console.error('APPWRITE_BUCKET_IMAGES environment variable is not set.');
        throw error(500, 'Image bucket not configured on server.');
    }

    try {
        const adminClient = createAdminClient();
        const storage = adminClient.storage;

        // Get file preview (or actual file if public and direct access is preferred)
        // Using getFilePreview for potentially smaller, web-optimized versions
        // Adjust width/height/quality as needed
        const imageBuffer = await storage.getFilePreview(
            APPWRITE_BUCKET_IMAGES,
            fileId
            // Optional parameters for preview customization:
            // 400, // width
            // 0,   // height (0 for auto based on width)
            // undefined, // gravity (e.g., 'center')
            // 80,  // quality
            // 0,   // borderWidth
            // '',  // borderColor
            // 0,   // borderRadius
            // 1,   // opacity
            // 0,   // rotation
            // '',  // background
            // 'png'// output format (e.g., 'jpg', 'png', 'webp')
        );

        // Determine content type - this is a basic guess, refine if needed
        let contentType = 'image/png'; // Default
        if (fileId.toLowerCase().endsWith('.jpg') || fileId.toLowerCase().endsWith('.jpeg')) {
            contentType = 'image/jpeg';
        } else if (fileId.toLowerCase().endsWith('.webp')) {
            contentType = 'image/webp';
        } else if (fileId.toLowerCase().endsWith('.gif')) {
            contentType = 'image/gif';
        }
        // Add more types as needed

        return new Response(imageBuffer, {
            status: 200,
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=31536000, immutable' // Cache for 1 year
            }
        });
    } catch (e) {
        const err = e as Error & { code?: number }; // Type assertion
        console.error(`Failed to proxy image ${fileId}:`, err.message);
        if (err.code === 404 || err.message?.toLowerCase().includes('not found')) {
            throw error(404, 'Image not found');
        }
        throw error(500, 'Error retrieving image');
    }
};
