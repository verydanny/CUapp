import { json } from '@sveltejs/kit'
import type { RequestEvent } from './$types'

export const POST = async (req: RequestEvent) => {
    try {
        const body = (await req.request.json()) as Record<string, string>
        const cookies = Object.entries(body).reduce((acc, [key, value]) => {
            const currentCookieArray = req.cookies.get(key)?.split(',')

            if (currentCookieArray) {
                return {
                    ...acc,
                    [key]: Array.from(new Set([...currentCookieArray, value]))
                }
            }

            return {
                ...acc,
                [key]: value
            }
        }, {}) as Record<string, string>

        Object.entries(cookies).forEach(([key, value]) => {
            req.cookies.set(key, value, {
                path: '/',
                secure: true,
                sameSite: 'strict',
                httpOnly: true
            })
        })

        return json(cookies)
    } catch (error) {
        // Send error to sentry
        console.error('error', error)
    }

    return new Response('OK')
}
