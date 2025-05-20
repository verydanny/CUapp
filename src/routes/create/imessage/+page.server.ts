import type { ServerLoad } from '@sveltejs/kit';

export const load: ServerLoad = async () => {
    // In a real implementation, we would fetch data from Appwrite here
    // For now, the demo page uses client-side mock data

    return {
        pageTitle: 'iMessage Post Demo',
        pageDescription: 'A demonstration of the iMessage post type feature'
    };
};
