# AI Context: iMessage Simulation Components

This document provides context on the Svelte components used for the iMessage simulation feature.

## Core Data Models (`$lib/utils/imessage.utils.ts`)

- **`iMessageParticipant`**: Represents a user in a conversation.
    - Key fields: `$id`, `userId`, `name`, `avatarFileId` (optional).
- **`iMessageMessage`**: Represents a single message.
    - Key fields: `$id`, `conversationId`, `participantDocId` (links to sender), `content`, `messageType` ('text' or 'image'), `imageUrl`, `timestamp`, `screenshotIndex` (for ordering), `deliveryStatus`.
- **`iMessageConversation`**: Represents the conversation metadata.
    - Key fields: `$id`, `conversationId`, `postId` (links to a parent post), `participantDocRefs` (array of participant `$id`s), `rightSideParticipantDocRef` (`$id` of the participant whose messages appear on the right, typically the "current user"), `screenshotMessageIds`.

## Svelte Components

### 1. `IMessagePost.svelte` (`src/lib/components/imessage/IMessagePost.svelte`)

- **Role**: The main container component for an entire iMessage post/preview. It orchestrates the display of the conversation header and the conversation itself. Handles loading and error states for the overall data fetching.
- **Key Props**:
    - `conversation: iMessageConversation | null`
    - `messages: iMessageMessage[]`
    - `participants: iMessageParticipant[]`
    - `rightSideParticipant: iMessageParticipant | undefined | null` (The participant whose messages are on the right)
    - `loading?: boolean`
    - `postId?: string` (If provided, shows a "View full post" link)
- **Logic**:
    - Derives `effectiveRightSideParticipant` from the `rightSideParticipant` prop.
    - Derives `headerDataReady` to determine if enough data is loaded to render the header and conversation.
    - Sorts incoming `messages` by `screenshotIndex` into `sortedMessages`.
    - Conditionally renders loading placeholders, data preparation messages, or the `ConversationHeader` and `Conversation` components.

### 2. `ConversationHeader.svelte` (`src/lib/components/imessage/ConversationHeader.svelte`)

- **Role**: Displays the header bar of the iMessage interface, showing the other participant's name (or group name) and avatar.
- **Key Props**:
    - `participants: iMessageParticipant[] | undefined | null`
    - `rightSideParticipant: iMessageParticipant | undefined | null`
- **Logic**:
    - Filters `participants` to get `otherParticipants` (excluding the `rightSideParticipant`).
    - Derives `displayName` based on whether it's a 1-on-1 chat or a group chat.
    - Derives `avatarInitials` for placeholder avatars.
    - Handles display of actual avatars if `avatarFileId` is present for the other participant.

### 3. `Conversation.svelte` (`src/lib/components/imessage/Conversation.svelte`)

- **Role**: Renders the list of messages, grouping consecutive messages from the same sender.
- **Key Props**:
    - `_conversation: iMessageConversation | null` (Note: prop name starts with underscore)
    - `messages: iMessageMessage[] | undefined | null`
    - `participants: iMessageParticipant[] | undefined | null`
    - `rightSideParticipant: iMessageParticipant | undefined | null`
- **Logic**:
    - `isRightSide(message)`: Helper function to determine if a message should be on the right.
    - `groupedMessages`: A `$derived.by` computation that takes the flat list of `messages` and groups them by sender. Each group contains the sender's `iMessageParticipant` object and an array of their consecutive `iMessageMessage` objects.
    - Iterates through `groupedMessages` and then through messages within each group, rendering a `MessageBubble` for each.
    - Passes props to `MessageBubble` to control its appearance (e.g., `isRight`, `showTimestamp`, `isFirstInGroup`, `isLastInGroup`, `participantName`).

### 4. `MessageBubble.svelte` (`src/lib/components/imessage/MessageBubble.svelte`)

- **Role**: Renders an individual message bubble, styled according to whether it's from the `rightSideParticipant` or another participant. Handles text and image messages.
- **Key Props**:
    - `message: iMessageMessage`
    - `isRight?: boolean`
    - `showTimestamp?: boolean`
    - `isFirstInGroup?: boolean`
    - `isLastInGroup?: boolean`
    - `participantName?: string` (Displayed above the first bubble in a group from a non-right-side participant)
- **Logic**:
    - Derives styling classes (`bubbleBgColor`, `bubbleTextColor`, `bubbleBorderRadius`, `imageBorderRadius`, `messageAlign`) based on `isRight`.
    - `displayTimestampText`: Derives formatted timestamp using `$derived.by()`.
    - `deliveryStatusText`: Derives delivery status ("Delivered", "Read") using `$derived.by()`.
    - `isImageMessage`: Derives if the message is an image type.
    - Conditionally renders image content (using `<img>` tag) or text content.
    - Image messages have `rounded-xl` corners and no separate caption area.
    - Shows participant name and delivery status/timestamp based on props and message properties.

## API Endpoint (`src/routes/api/imessage/create/+server.ts`)

- **Role**: A POST endpoint that simulates the creation of a full iMessage conversation (participants, messages, conversation metadata) and stores it in Appwrite.
- **Functionality**:
    - Generates mock participant data (currently 'Alejandro' and 'You').
    - Creates these participants in the Appwrite `imessageParticipants` collection using `createIMessageParticipant` from `$lib/server/appwrite-utils/imessage.appwrite.ts`.
    - Generates a series of mock messages with varying senders, content (including an image message from `picsum.photos`), and timestamps.
    - Creates these messages in the Appwrite `imessageMessages` collection using `createIMessageMessage`.
    - Creates a conversation metadata document in the Appwrite `imessageConversations` collection using `createIMessageConversation`, linking the participants and messages.
    - Returns the created conversation, participants, and messages as JSON.

## Server-Side Appwrite Utilities (`$lib/server/appwrite-utils/imessage.appwrite.ts`)

- **Role**: Contains functions for interacting with Appwrite database collections related to iMessage.
- **Key Functions**:
    - `createIMessageParticipant`, `createIMessageMessage`, `createIMessageConversation`: Functions to create documents in their respective collections.
    - `getIMessageConversationById`, `getIMessageMessagesByConversationId`, `getIMessageParticipantsByIds`: Functions to fetch data.
    - Update and delete functions for each entity.
- **Configuration**: Uses environment variables for Appwrite Database ID and Collection IDs.
- **Types**: Defines `Create...Data` and `Update...Data` types for data being passed to Appwrite. Includes `AppwriteDatabasesClient` interface for type safety of the Appwrite client.
