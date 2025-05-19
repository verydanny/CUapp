# Rich Text Posts Data Model

This document describes the data model for the `richTextPosts` collection in the Appwrite database. This collection stores the specific content for posts whose `type` is 'richText' in the main `posts` collection.

## Collection: `richTextPosts`

**Purpose:** To store the detailed content of rich text-based posts, including a title, the main body (which can be HTML, JSON, or Markdown), and optional metadata like excerpts and cover images. This collection is linked from the central `posts` collection.

**Appwrite Database:** `main`

**Key Attributes:**

- **`postId`** (String, Required): The ID of the corresponding document in the `posts` collection. This establishes the link to the general post metadata.
- **`title`** (String, Required): The main title of the rich text post.
- **`body`** (String, Required): The core content of the post. This field is designed to hold large text data, suitable for HTML, JSON (e.g., from editors like TipTap), or Markdown.
- **`excerpt`** (String, Optional): A short summary or teaser for the post, often used for previews.
- **`coverImageFileId`** (String, Optional): The Appwrite Storage File ID for an optional cover image associated with the post.
- **`coverImageUrl`** (String, Optional): The direct URL for the cover image. This might be populated by application logic after an image is uploaded or if an external image is used.
- **`coverImageAltText`** (String, Optional): Descriptive alt text for the cover image, important for accessibility.
- **`version`** (Integer, Optional): A version number for the content, allowing for tracking changes or iterations if needed by the application.
- **`estimatedReadTimeMinutes`** (Integer, Optional): An estimated time in minutes that it might take to read the post content.
- **`contentSchemaVersion`** (String, Optional): If the `body` content uses a specific JSON schema (e.g., from a block-based editor), this field can store the version of that schema.

**Permissions:**

Standard permissions are set to allow users to create posts, and for general read access (`read("any")`), while updates and deletions are restricted to authenticated users. As with the main `posts` collection, specific access control based on post status or user roles would typically be handled by application logic in conjunction with the `accessLevel` attribute in the linked `posts` document.

- `create("users")`
- `read("any")`
- `update("users")`
- `delete("users")`

**Indexing:**

- A unique index on `postId` ensures a one-to-one relationship with a document in the `posts` collection.
- An index on `title` can facilitate searching or querying by post title.

**Relationship to `posts` Collection:**

A document in `richTextPosts` is always linked to a document in the `posts` collection via the `postId` attribute. The `posts` document will have its `type` attribute set to 'richText' and its `contentRefId` attribute will store the `$id` of the corresponding `richTextPosts` document.

**How Data is Accessed:**

When a user views a rich text post:

1.  The application first fetches the main document from the `posts` collection.
2.  If the `type` is 'richText', the application uses the `contentRefId` (which is the `$id` of the rich text content document) to fetch the corresponding document from the `richTextPosts` collection.
3.  The title, body, and other attributes from `richTextPosts` are then combined with metadata from the `posts` document for display.
