process.env.APPWRITE_API_KEY = process.env.SECRET_APPWRITE_API_KEY

import { FetchNewTypes } from 'fetch-appwrite-types/dist/main'

await FetchNewTypes({
    outDir: 'src/lib/types',
    outFileName: 'appwrite',
    hardTypes: true
})
