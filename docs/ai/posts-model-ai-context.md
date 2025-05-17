# Posts Model AI Context

This document provides context and details about the `posts` collection in Appwrite, designed to store general information about various types of user posts.

## Collection: `posts`

**Purpose:** To serve as a central collection for all post types, storing common attributes and linking to type-specific content.

**Appwrite Database:** `main`

**Attributes:**

- `userId` (String): Creator of the post. Required. Indexed for querying user's posts.
- `createdAt` (Datetime): Post creation timestamp. Required. Indexed for ordering by recency.
- `updatedAt` (Datetime): Last update timestamp. Required.
- `type` (String Enum: 'image', 'text', 'blog', 'video', 'imessage'): Defines the type of content. Required. Indexed for filtering by type.
- `tags` (Array of Strings): Tags associated with the post. Optional.
- `likesCount` (Integer): Number of likes. Required, defaults to 0 handled by application logic on creation.
- `commentsCount` (Integer): Number of comments. Required, defaults to 0 handled by application logic on creation.
- `status` (String Enum: 'published', 'draft', 'archived'): Post status. Required, defaults to 'draft' handled by application logic on creation.
- `accessLevel` (String Enum: 'public', 'private', 'followers', 'mutuals', 'unlisted', 'team'): Visibility setting. Required, defaults to 'public' handled by application logic on creation.
- `contentRefId` (String): Reference to the document in the type-specific content collection (e.g., `imessageConversations`, `blogPosts`). Optional (initially might not have content until published/saved).

**Permissions:**

- `create("users")`: Any logged-in user can create a post.
- `read("any")`: Anyone (logged-in or not) can read posts. _Note: Granular access control is handled by the `accessLevel` attribute and application logic when querying._
- `update("users")`: Any logged-in user can update a post. _Note: Application logic should enforce that only the post owner or authorized users can update._
- `delete("users")`: Any logged-in user can delete a post. _Note: Application logic should enforce that only the post owner or authorized users can delete._

**Indexing:**

- `user_created_index` (Key Index): On `userId` (DESC) and `createdAt` (DESC). Optimized for fetching a user's most recent posts.
- `type_index` (Key Index): On `type` (ASC). Optimized for filtering posts by type.
- `access_level_index` (Key Index): On `accessLevel` (ASC). Optimized for filtering posts by visibility.

## Relationship to Content Collections

The `posts` collection uses the `contentRefId` attribute to link to separate collections for detailed content based on the `type`:

- `image` posts: Will link to an `imagePosts` collection.
- `text` posts: Will link to a `textPosts` collection.
- `blog` posts: Will link to a `blogPosts` collection.
- `video` posts: Will link to a `videoPosts` collection.
- `imessage` posts: Will link to an `imessageConversations` collection.

This separation keeps the `posts` collection lean and allows for flexible, complex schemas in content-specific collections.

## Querying Considerations

When displaying lists of posts (e.g., in a feed), typically query the `posts` collection first, filtering by `accessLevel`, `type`, `userId`, and sorting by `createdAt`. Full content is fetched from the linked collection via `contentRefId` only when viewing a single post.

## Potential Future Enhancements/Considerations

- Implementing reporting or moderation flags.
- Adding a `parentPostId` for replies or threads.
- More advanced indexing for complex query patterns.
- Using Appwrite Functions for triggers on post creation/update (e.g., updating denormalized counts).
