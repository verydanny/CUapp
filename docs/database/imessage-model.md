# iMessage Data Models

This document provides a human-readable overview of the Appwrite collections used for storing iMessage conversation posts: `imessageParticipants`, `imessageConversations`, and `imessageMessages`.

These models are designed to capture the structure and content of iMessage screenshots shared as posts, linking back to the main `posts` collection.

## Collections Overview

### `imessageParticipants`

- **Purpose:** To store details about the individuals participating in an iMessage conversation _as depicted in a screenshot_. These are user-defined participant entries for a specific post and do not necessarily correspond to other users in the application.
- **Key Fields:** `userId` (creator of the participant entry), `name` (display name), `avatarFileId` (optional avatar).
- **Usage:** Referenced by conversation and message documents to identify senders and participants.

### `imessageConversations`

- **Purpose:** To represent a single iMessage conversation post, linking it to the main `posts` collection and outlining which participants and messages are included in _this specific screenshot_.
- **Key Fields:** `postId` (link to `posts` collection), `participantDocRefs` (list of participants in the screenshot), `rightSideParticipantDocRef` (the post creator's participant entry), `screenshotMessageIds` (ordered list of message IDs shown), `totalScreenshots` (if conversation is split).
- **Usage:** The central document for an iMessage post, providing context and links to related data. The `screenshotMessageIds` field is critical for displaying messages in the correct order for a given post.

### `imessageMessages`

- **Purpose:** To store the content and metadata of individual messages _within a specific iMessage screenshot conversation_.
- **Key Fields:** `conversationId` (link to `imessageConversations`), `messageId` (unique ID within conversation), `participantDocId` (sender), `content` (message text), `timestamp`, `screenshotIndex` (order in screenshot), `isEdited`, `deliveryStatus` (optional).
- **Usage:** Contains the actual message content. The `screenshotIndex` field is used in conjunction with `imessageConversations.screenshotMessageIds` to order messages for display.

## Relationships

- An `imessageConversations` document is linked to one `posts` document (`postId`).
- An `imessageConversations` document references multiple `imessageParticipants` (via `participantDocRefs` and `rightSideParticipantDocRef`).
- Each `imessageMessages` document belongs to one `imessageConversations` document (`conversationId`).
- Each `imessageMessages` document references one `imessageParticipants` document (`participantDocId`).

## How Data is Accessed

When viewing an iMessage post, the application typically:

1. Fetches the `imessageConversations` document using the `postId` (which is the `contentRefId` from the `posts` document).
2. Uses the `participantDocRefs` and `rightSideParticipantDocRef` from the conversation document to fetch the relevant `imessageParticipants` details (names, avatars).
3. Uses the `conversationId` and the ordered `screenshotMessageIds` from the conversation document to fetch the specific `imessageMessages` that appear in the screenshot, often ordering them by `screenshotIndex`.

This structure allows for efficient retrieval of all necessary data related to a single iMessage screenshot post.
