# Rich Text Posts Model - AI Context

This document provides AI-specific context for the `richTextPosts` collection in Appwrite, used for storing content of posts with `type: 'richText'`.

## Collection: `richTextPosts`

**Purpose:** Stores detailed content for rich text posts, linked from the main `posts` collection.

**Appwrite Database:** `main`

**Attributes:**

- **`postId`** (String):
    - Required: `true`
    - Size: 255
    - Description: Links to `posts.$id`. This is the foreign key.
- **`title`** (String):
    - Required: `true`
    - Size: 255
    - Description: The main title of the article or post.
- **`body`** (String):
    - Required: `true`
    - Size: 10,000,000
    - Description: The main content of the rich text post. Can store HTML, Markdown, or JSON (e.g., TipTap output).
- **`excerpt`** (String):
    - Required: `false`
    - Size: 500
    - Description: A short summary or teaser.
- **`coverImageFileId`** (String):
    - Required: `false`
    - Size: 255
    - Description: Appwrite Storage File ID for an optional cover image.
- **`coverImageUrl`** (String):
    - Required: `false`
    - Size: 2048
    - Description: Direct URL for the cover image.
- **`coverImageAltText`** (String):
    - Required: `false`
    - Size: 500
    - Description: Alt text for the cover image for accessibility.
- **`version`** (Integer):
    - Required: `false`
    - Min: 0
    - Max: 9223372036854775807
    - Description: Content version number. Application logic may set a default (e.g., 1).
- **`estimatedReadTimeMinutes`** (Integer):
    - Required: `false`
    - Min: 0
    - Max: 9223372036854775807
    - Description: Estimated time in minutes to read the content.
- **`contentSchemaVersion`** (String):
    - Required: `false`
    - Size: 50
    - Description: Version of the schema used for the `body` if it's structured content (e.g., JSON from a block editor).

**Permissions (Collection Level):**

- `create("users")`: Any authenticated user can create a rich text content document (usually linked to a `posts` document they own).
- `read("any")`: Anyone can read rich text content documents. Granular access control is primarily handled by the `accessLevel` attribute in the parent `posts` document and application logic.
- `update("users")`: Authenticated users can update. Application logic should ensure only the owner or authorized users can perform updates.
- `delete("users")`: Authenticated users can delete. Application logic should ensure only the owner or authorized users can perform deletions.

**Indexing:**

- `post_id_unique_index` (Type: `unique`):
    - Attributes: `postId` (ASC)
    - Purpose: Ensures one-to-one mapping with `posts` collection and fast lookups by `postId`.
- `title_search_index` (Type: `key`):
    - Attributes: `title` (ASC)
    - Purpose: Can be used for searching/filtering by title. Consider `fulltext` if advanced title searching is needed and supported for your setup.

**Relationships:**

- A `richTextPosts` document is created in conjunction with a `posts` document where `posts.type = 'richText'`.
- The `richTextPosts.postId` attribute stores the `$id` of the parent `posts` document.
- The `posts.contentRefId` attribute stores the `$id` of the corresponding `richTextPosts` document.

**Querying Considerations for AI:**

- When a "rich text post" is requested, first query the `posts` collection for the main metadata.
- Then, use the `posts.contentRefId` (which is the `$id` of the `richTextPosts` document) to fetch the specific content from the `richTextPosts` collection using its document ID.
- The `postId` attribute in `richTextPosts` can be used to fetch the rich text content if you already have the ID of the parent `posts` document.
- Filtering or searching might involve attributes from both `posts` (e.g., `tags`, `status`, `accessLevel`) and `richTextPosts` (e.g., `title`).
