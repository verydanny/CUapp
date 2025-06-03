import { Elysia, t } from 'elysia'
import { Client, Databases, Query, type Models } from 'node-appwrite'

import { serve as serveElysia } from '@gravlabs/appwrite-elysia-adapter-bun'
import type { AppwriteElysiaSingleton } from '@gravlabs/appwrite-elysia-adapter-bun/types.d.ts'
import type { textPostDocument } from './types/appwrite.ts'

// You can re-use this in other functions to set Client/Databases/etc
export const appwritePlugin = new Elysia<'', AppwriteElysiaSingleton>({ name: 'appwrite' }).resolve(
    { as: 'scoped' },
    ({ headers }) => {
        const appwriteClient = new Client()
            .setEndpoint(Bun.env.APPWRITE_FUNCTION_API_ENDPOINT)
            .setProject(Bun.env.APPWRITE_FUNCTION_PROJECT_ID)

        const client = appwriteClient.setKey(headers['x-appwrite-key'] ?? '')
        const databases = new Databases(client)

        return {
            databases,
            client
        }
    }
)

const postUpdateResponseSchema = t.Object({
    title: t.String(),
    content: t.String()
})

const postUpdateRequestSchema = t.Object({
    id: t.String()
})

const getPostsResponseSchema = t.Object({
    documents: t.Array(postUpdateResponseSchema)
})

const postsModel = new Elysia().model({
    postUpdateRequestSchema,
    postUpdateResponseSchema,
    getPostsResponseSchema
})

const postsQuerySchema = t.Optional(
    t.Object({
        postIds: t.Optional(t.Array(t.String())),
        type: t.Optional(
            t.Union([
                t.Literal('textPost'),
                t.Literal('imessageConversation'),
                t.Literal('imagePost')
            ])
        )
    })
)

export const posts = new Elysia()
    .use(appwritePlugin)
    .use(postsModel)
    .get(
        '/posts',
        async ({ databases, query }) => {
            if (query.postIds && query.type) {
                const result = (await databases.listDocuments('main', query.type, [
                    Query.equal('$id', query.postIds)
                ])) as unknown as Models.DocumentList<textPostDocument>

                return result.documents
            }

            const result = (await databases.listDocuments('main', 'posts', [
                Query.limit(10)
            ])) as unknown as typeof getPostsResponseSchema.static

            return result.documents
        },
        {
            query: postsQuerySchema
        }
    )
    .put(
        '/posts/:id',
        async ({ databases, params, body }) => {
            // Use the extracted type here and rename the variable to avoid conflict
            return databases.updateDocument(
                'main',
                'posts',
                params.id,
                body
            ) as unknown as typeof postUpdateResponseSchema.static
        },
        {
            body: 'postUpdateRequestSchema'
        }
    )
    .delete('/posts/:id', ({ databases, params }) => {
        return databases.deleteDocument('main', 'posts', params.id)
    })

export type Posts = typeof posts
export default serveElysia(posts)
