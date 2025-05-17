# iMessage Models AI Context

This document provides AI-specific context for the Appwrite collections related to iMessage posts (`imessageParticipants`, `imessageConversations`, `imessageMessages`). It details their structure, relationships, and intended usage patterns to assist AI in generating relevant code and understanding data interactions.

## Collections

### `imessageParticipants` (ID: `imessageParticipants`)

- **Description:** Stores participants involved in an iMessage conversation screenshot. These are user-defined names/avatars for the conversation context, not necessarily linked to actual user profiles.
- **Permissions:** `create("users")`, `read("users")`, `update("users")`, `delete("users")`
- **Attributes:**
    - `userId`: `string`, required, size 255. The ID of the user who created this participant record.
    - `name`: `string`, required, size 255. The display name for the participant.
    - `avatarFileId`: `string`, optional, size 255. File ID for the participant's avatar image.
- **Indexes:**
    - `user_index`: `key` on `userId` (ASC). Allows querying participants by the creating user.
- **Relationships:** Referenced by `imessageMessages` (`participantDocId`) and `imessageConversations` (`participantDocRefs`, `rightSideParticipantDocRef`).
- **Query Considerations:** Primarily queried by `userId` to retrieve participants created by a specific user.

### `imessageConversations` (ID: `imessageConversations`)

- **Description:** Represents a single iMessage conversation screenshot post. Links the post to its participants and messages.
- **Permissions:** `create("users")`, `read("users")`, `update("users")", `delete("users")`
- **Attributes:**
    - `postId`: `string`, required, size 255. The ID of the associated `posts` collection document (`contentRefId`).
    - `participantDocRefs`: `string` array, required, size 255 per element. References to the `imessageParticipants` documents involved in this conversation.
    - `rightSideParticipantDocRef`: `string`, required, size 255. Reference to the `imessageParticipants` document representing the person on the right side of the conversation (the post creator).
    - `screenshotMessageIds`: `string` array, required, size 100000 per element. An ordered list of message IDs (`imessageMessages.messageId`) indicating the sequence of messages shown in the screenshot.
    - `totalScreenshots`: `integer`, required. The total number of screenshot segments for this conversation (relevant if a long conversation is split across multiple posts).
- **Indexes:**
    - `post_id_unique_index`: `unique` on `postId` (ASC). Ensures a one-to-one relationship with a `posts` document and allows efficient lookup by post ID.
- **Relationships:** Links to `posts` (`postId`), references `imessageParticipants` (`participantDocRefs`, `rightSideParticipantDocRef`), and is referenced by `imessageMessages` (`conversationId`).
- **Query Considerations:** Primarily queried by `postId` to retrieve the conversation details for a specific post. The `screenshotMessageIds` array defines the order and subset of messages relevant to this specific screenshot.

### `imessageMessages` (ID: `imessageMessages`)

- **Description:** Stores individual messages within an iMessage conversation screenshot.
- **Permissions:** `create("users")`, `read("users")`, `update("users")", `delete("users")`
- **Attributes:**
    - `conversationId`: `string`, required, size 255. The ID of the parent `imessageConversations` document.
    - `messageId`: `string`, required, size 255. A unique identifier for the message within its conversation.
    - `participantDocId`: `string`, required, size 255. Reference to the `imessageParticipants` document representing the sender of this message.
    - `content`: `string`, required, size 10000. The text content of the message.
    - `timestamp`: `datetime`, required. The actual timestamp of the message.
    - `timestampDisplay`: `string`, optional, size 50. A formatted string representation of the timestamp for display.
    - `isEdited`: `boolean`, required. Indicates if the message was edited.
    - `screenshotIndex`: `integer`, required. The index of this message within the sequence shown in the specific conversation screenshot (corresponds to its position in `imessageConversations.screenshotMessageIds`).
    - `deliveryStatus`: `string`, optional, size 20, enum (`sent`, `delivered`, `read`). The delivery status of the message.
- **Indexes:**
    - `conversation_screenshot_index`: `key` on `conversationId` (ASC), `screenshotIndex` (ASC). Allows querying messages for a specific conversation ordered by their appearance in the screenshot.
    - `conversation_timestamp_index`: `key` on `conversationId` (ASC), `timestamp` (ASC). Allows querying messages for a specific conversation ordered by their original timestamp.
    - `conversation_message_unique_index`: `unique` on `conversationId` (ASC), `messageId` (ASC). Ensures uniqueness of a message within a conversation and allows efficient lookup by conversation and message ID.
- **Relationships:** Links to `imessageConversations` (`conversationId`) and `imessageParticipants` (`participantDocId`).
- **Query Considerations:** Frequently queried by `conversationId`, often with `screenshotIndex` or `timestamp` for ordering. The `conversation_screenshot_index` is crucial for displaying messages in the correct order for a given screenshot post.

## Relationships Summary

- `imessageConversations` links to a `posts` document.
- `imessageConversations` references `imessageParticipants` (multiple via `participantDocRefs` and one primary via `rightSideParticipantDocRef`).
- `imessageMessages` links to an `imessageConversations` document.
- `imessageMessages` references an `imessageParticipants` document (the sender).

## Key Query Patterns

- Retrieving conversation details for a specific iMessage post (`imessageConversations` by `postId`).
- Retrieving participants associated with a conversation (`imessageParticipants` by looking up IDs from `imessageConversations.participantDocRefs`).
- Retrieving messages for a specific conversation, ordered by appearance in the screenshot (`imessageMessages` by `conversationId` and `screenshotIndex`).
- Retrieving messages for a specific conversation, ordered by timestamp (`imessageMessages` by `conversationId` and `timestamp`).
- Looking up a specific message within a conversation (`imessageMessages` by `conversationId` and `messageId`).
- Retrieving participants created by a specific user (`imessageParticipants` by `userId`).

This context should help AI understand the data model and how to interact with these collections effectively.
