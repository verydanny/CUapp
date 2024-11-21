import { json } from '@sveltejs/kit'
import { ALLOWED_HOSTNAME } from '$env/static/private'

const corsHeaders = {
    'Access-Control-Allow-Origin': ALLOWED_HOSTNAME,
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Origin, Content-Type'
}

export async function OPTIONS() {
    return json(corsHeaders)
}
