---
'cuapp': minor
---

feat: Add rich text post model and documentation

**Overview:**
Introduced a new Appwrite database model (`richTextPosts`) to support rich text content like articles or detailed posts. This model links to the main `posts` collection.

**Key Changes:**

- Added `richTextPosts` collection to `.appwrite/appwrite.json` with attributes:
    - `postId` (links to `posts.$id`)
    - `title`
    - `body` (for HTML, JSON, or Markdown)
    - `excerpt`
    - `coverImageFileId`, `coverImageUrl`, `coverImageAltText`
    - `version`, `estimatedReadTimeMinutes`, `contentSchemaVersion`
- Implemented unique index on `postId` and key index on `title`.

**Developer Impact:**

- Developers can now create and manage rich text posts.
- The `posts` collection's `type` should be set to 'richText' and `contentRefId` should link to the `$id` of the `richTextPosts` document.

**Documentation:**

- Created `docs/database/rich-text-posts-model.md` for human-readable details.
- Created `docs/ai/rich-text-posts-model-ai-context.md` for AI understanding.
