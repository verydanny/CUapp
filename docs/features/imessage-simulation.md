# iMessage Simulation Feature

This document outlines the iMessage simulation feature, including its data models, component architecture, and backend logic for creating mock conversations.

## 1. Overview

The iMessage simulation feature allows for the display of mock iMessage conversations within the application. It aims to visually replicate the look and feel of iOS iMessage chats. The primary use case demonstrated is loading a predefined mock conversation via an API call, which then renders using a set of Svelte components.

## 2. Data Models (`$lib/utils/imessage.utils.ts`)

The feature relies on three core data models, typically extending `Models.Document` from Appwrite:

### `iMessageParticipant`

Represents an individual in the conversation.

- `$id`: (Appwrite) Document ID.
- `userId`: string - A unique identifier for the user this participant represents (can be an Appwrite User ID or any unique string).
- `name`: string - Display name of the participant (e.g., "Alice").
- `avatarFileId`: string (optional) - Appwrite File ID for the participant's avatar image.
- `isRightSide`: boolean (optional) - Potentially used to flag the primary user, though current logic relies on `rightSideParticipantDocRef` in the conversation.

### `iMessageMessage`

Represents a single message within a conversation.

- `$id`: (Appwrite) Document ID.
- `conversationId`: string - Identifier linking this message to an `iMessageConversation` (matches `iMessageConversation.conversationId`).
- `messageId`: string - A unique identifier for this message within its conversation context.
- `participantDocId`: string - The `$id` of the `iMessageParticipant` who sent this message.
- `content`: string - The textual content of the message. For image messages, this might be an empty string or a predefined placeholder if not used for a caption.
- `messageType`: 'text' | 'image' (optional, defaults to 'text') - Specifies if the message is text or an image.
- `imageUrl`: string (optional) - URL for the image if `messageType` is 'image'.
- `imageFileId`: string (optional) - Appwrite File ID if the image is stored in Appwrite Storage.
- `imageAltText`: string (optional) - Alt text for the image.
- `timestamp`: string (ISO 8601) - The time the message was sent.
- `timestampDisplay`: string (optional) - A pre-formatted string for displaying the timestamp (e.g., "10:30 AM").
- `isEdited`: boolean - Flag indicating if the message has been edited.
- `screenshotIndex`: number - An index used to order messages as they appear in a source screenshot or predefined sequence. This is crucial for maintaining the correct visual order.
- `deliveryStatus`: 'sent' | 'delivered' | 'read' (optional) - The delivery status of the message, typically shown for messages sent by the `rightSideParticipant`.

### `iMessageConversation`

Represents the metadata for a conversation.

- `$id`: (Appwrite) Document ID for the conversation record itself.
- `conversationId`: string - A unique identifier for the logical conversation (used to group messages).
- `postId`: string - Identifier linking this conversation to a broader content entity (e.g., a blog post ID if the iMessage is a comment or part of it).
- `participantDocRefs`: string[] - An array of `iMessageParticipant.$id` strings, listing all participants in the conversation.
- `rightSideParticipantDocRef`: string - The `$id` of the `iMessageParticipant` whose messages should be displayed on the right side of the chat interface (typically the current user viewing the chat).
- `screenshotMessageIds`: string[] - An array of `iMessageMessage.messageId` strings, defining the order in which messages appear (though current implementation sorts by `screenshotIndex` from the `iMessageMessage` documents themselves).
- `totalScreenshots`: number - Count of messages, potentially related to how many separate visual parts a conversation was broken into.

## 3. Frontend Svelte Components

The UI is built from a hierarchy of Svelte components:

### `IMessagePost.svelte`

- **Purpose**: Top-level wrapper for the entire iMessage display. Handles loading states and passes down data to child components.
- **Key Logic**: Sorts messages by `screenshotIndex` before passing them to the `Conversation` component. Determines if enough data is present (`headerDataReady`) to render the main content.

### `ConversationHeader.svelte`

- **Purpose**: Renders the header bar, displaying the name and avatar of the other chat participant(s).
- **Key Logic**: Calculates `displayName` (e.g., "John Doe" or "John Doe, Jane Smith") and `avatarInitials` based on the participants who are not the `rightSideParticipant`.

### `Conversation.svelte`

- **Purpose**: Manages the display of the actual message flow.
- **Key Logic**: The core logic here is `groupedMessages`. This `$derived.by` store processes the flat list of messages and groups consecutive messages from the same sender. This allows for the characteristic iMessage look where multiple bubbles from one person appear in a block. It then iterates over these groups and their messages, rendering each with `MessageBubble.svelte`.

### `MessageBubble.svelte`

- **Purpose**: Renders a single message bubble, adapting its style (color, alignment, tail direction) based on whether it's from the `rightSideParticipant`.
- **Key Logic**: Determines bubble alignment (`self-end` or `self-start`), background color, text color, and border radius. Conditionally renders text or an image. Image messages are displayed with `rounded-xl` corners and do not have a separate text caption area within the same bubble. Handles display of timestamps and delivery statuses where appropriate.

## 4. Backend API (`src/routes/api/imessage/create/+server.ts`)

- **Purpose**: A SvelteKit server route that simulates the creation of a new iMessage conversation and persists it to an Appwrite backend.
- **Functionality**:
    1.  **Admin Client**: Initializes an Appwrite admin client.
    2.  **Mock Data Generation**:
        - Creates two `iMessageParticipant` objects (e.g., 'Alejandro' and 'You').
        - Defines an array of message inputs, specifying sender, content, type (text/image), and relative timing.
    3.  **Appwrite Persistence** (using functions from `$lib/server/appwrite-utils/imessage.appwrite.ts`):
        - `createIMessageParticipant`: Saves participant documents.
        - `createIMessageMessage`: Saves message documents. The `conversationId` for these messages is a temporarily generated unique ID, which will also be stored in the conversation document.
        - `createIMessageConversation`: Saves the conversation metadata, linking the participant and message documents via their Appwrite document IDs or internal `messageId`s.
    4.  **Response**: Returns a JSON object containing the successfully created `conversation`, `participants`, and `messages` documents from Appwrite.
- **Data Structure Note**: Messages are linked to a conversation via a `conversationId` field that should match the `conversationId` in the `iMessageConversation` document. Participants are linked by storing their Appwrite document IDs (`$id`) in the `iMessageConversation.participantDocRefs` array.

## 5. Appwrite Server Utilities (`$lib/server/appwrite-utils/imessage.appwrite.ts`)

- **Purpose**: Provides a suite of CRUD (Create, Read, Update, Delete) operations for the iMessage-related Appwrite collections (`imessageConversations`, `imessageMessages`, `imessageParticipants`).
- **Key Features**:
    - Defines TypeScript interfaces for data creation (`Create...Data`) and updates (`Update...Data`) for each entity type.
    - Includes an `AppwriteDatabasesClient` interface to ensure type safety when passing the Appwrite database client to these utility functions.
    - Uses Appwrite's `ID.unique()` for generating document IDs upon creation.
    - Implements functions like `getIMessageMessagesByConversationId` that use Appwrite queries (e.g., `Query.equal`, `Query.limit`, `Query.offset`).
    - Handles errors by logging them and re-throwing to be caught by the calling API route or server function.
    - Collection and Database IDs are sourced from environment variables (`process.env`).

## 6. Styling and UI Details

- **Tailwind CSS & DaisyUI**: Used extensively for styling components.
- **Message Grouping**: Consecutive messages from the same sender are grouped visually.
- **Bubble Styling**: Different background colors and alignments for sender vs. receiver.
- **Image Handling**: Images are displayed with rounded corners; no separate text captions within the image bubble itself.
- **Timestamps & Delivery Status**: Shown contextually (e.g., for the last message in a group).

## 7. Areas for Future Development (Not Implemented)

- Real-time updates.
- User input for sending messages.
- Reply-to-message functionality (threaded replies).
- More dynamic avatar handling.
- Fetching existing conversations instead of only creating new mock ones.
