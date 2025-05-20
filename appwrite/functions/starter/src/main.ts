import { Client, Users } from 'node-appwrite'

// Define proper types for Appwrite function parameters
type AppwriteFunctionContext = {
    req: {
        path: string
        headers: Record<string, string>
    }
    res: {
        text: (text: string) => unknown
        json: (json: unknown) => unknown
    }
    log: (message: string) => void
    _error: (message: string) => void
}

const appwrite = new Client()
    .setEndpoint(Bun.env.APPWRITE_FUNCTION_API_ENDPOINT || '')
    .setProject(Bun.env.APPWRITE_FUNCTION_PROJECT_ID || '')

// This Appwrite function will be executed every time your function is triggered
export default async ({ req, res, log, _error }: AppwriteFunctionContext) => {
    appwrite.setKey(req.headers['x-appwrite-key'] || '')
    // Check ping endpoint
    if (req.path === '/ping') {
        return res.text('Pong')
    }

    // Return basic info about the function environment
    return res.json({})
}
