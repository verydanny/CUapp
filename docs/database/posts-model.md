# Posts Data Model

This document describes the data model for the `posts` collection in the Appwrite database, which serves as the central entry point for all types of user-generated content.

## Collection: `posts`

**Purpose:** To store fundamental information and metadata common to all post types, such as author, timestamps, type, and access control, while linking to the specific content stored in separate collections.

**Appwrite Database:** `main`

**Key Attributes:**

- **`userId`**: Identifies the user who created the post.
- **`createdAt`**: The date and time the post was initially created.
- **`updatedAt`**: The date and time the post was last modified.
- **`type`**: Specifies the nature of the post content (e.g., image, text, blog, video, imessage). Used to determine which content-specific collection to reference.
- **`tags`**: An optional list of keywords or topics associated with the post.
- **`likesCount`**: A counter for the number of likes or reactions.
- **`commentsCount`**: A counter for the number of comments.
- **`status`**: Indicates the current state of the post (e.g., published, draft, archived).
- **`accessLevel`**: Controls the visibility and privacy of the post (e.g., public, private, followers, mutuals, unlisted, team).
- **`contentRefId`**: The ID of the document in the relevant content-specific collection that holds the detailed post content.

**Permissions:**

Access permissions are configured in `appwrite.json` to allow users to create, read, update, and delete posts. Note that while `read("any")` is set on the collection for broad access, the `accessLevel` attribute and application-level logic are used to enforce finer-grained visibility rules for individual posts.

**Indexing:**

Indexes are defined in `appwrite.json` to optimize common queries:

- An index on `userId` and `createdAt` to efficiently fetch a user's posts ordered by time.
- An index on `type` for filtering posts by their content category.
- An index on `accessLevel` for filtering posts based on their visibility settings.

**Relationship to Content:**

Instead of embedding all content directly, the `posts` collection links to separate collections (e.g., `imessageConversations`, `blogPosts`) using the `contentRefId`. This modular approach keeps the main `posts` collection streamlined and allows for varied and complex structures for different post types. When viewing a post, the application fetches the post document from the `posts` collection and then uses `contentRefId` and `type` to retrieve the corresponding detailed content from the appropriate linked collection.

This structure balances the need for a unified view of all posts with the flexibility required to handle diverse content types and their specific data needs.
