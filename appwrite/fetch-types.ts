import { FetchNewTypes } from 'fetch-appwrite-types/dist/main'

await FetchNewTypes({
    outDir: 'src/lib/types',
    outFileName: 'appwrite',
    hardTypes: true,
})
