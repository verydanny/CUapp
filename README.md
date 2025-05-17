# CU App

This is a SvelteKit social network app. It's built with:

- Bun
- Deno
- Appwrite 1.6.1
- SvelteKit
- TailwindCSS
- DaisyUI

The backend/database is Appwrite, and the SvelteKit runtime will be Deno. It uses Bun for the build/development process, simply for the package manager.

## Development

Make sure Appwrite 1.6.1 is running locally.

**Create a `.env.local` file in the root of the project with the following variables:**

```bash
PUBLIC_APPWRITE_ENDPOINT=http://localhost:3000/v1 # or your endpoint
PUBLIC_APPWRITE_PROJECT=your-project-id
APPWRITE_KEY=your-secret-key
```

**Install Appwrite CLI:**

```bash
bun add -g appwrite-cli
```

**Modify the `.appwrite/appwrite.json` file to match your project.**

```json
{
    "projectId": "your-project-id",
    ...rest of the file
}
```

**Sync the Appwrite project with the following command:**

```bash
cd .appwrite
appwrite push all
```

**Install dependencies and run the development server:**

```bash
bun install
bun run dev
```

## Deployment

```bash
bun run build
bun run preview # for local testing
```

## iMessage Posts Feature

The iMessage post type feature allows users to create and display iMessage-style conversations in posts. This simulates text message conversations with the familiar blue/gray bubble UI.

### Features

- Create conversations with multiple participants
- Display messages in a realistic iMessage-style interface
- Support for message timestamps and delivery status indicators
- Responsive design for mobile and desktop
- Fully integrated with Appwrite backend

### Using the iMessage Feature

1. Visit `/imessage/create` to create a new iMessage post
2. Add participants and specify which one represents "you" (right side of conversation)
3. Add messages from each participant in the order they should appear
4. You can preview your conversation before saving it to the database
5. Once created, the conversation can be viewed as a standalone post or embedded in other content

### API Endpoints

- `POST /api/imessage` - Create a new iMessage conversation
    - Request body:
        ```json
        {
            "participants": [
                { "$id": "unique-id-1", "name": "Alice", "isRightSide": true },
                { "$id": "unique-id-2", "name": "Bob" }
            ],
            "messages": [
                { "participantId": "unique-id-1", "content": "Hello", "index": 0 },
                { "participantId": "unique-id-2", "content": "Hi there", "index": 1 }
            ],
            "postId": "optional-post-id"
        }
        ```

### Components

- `IMessagePost` - Main component that displays a complete iMessage conversation
- `Conversation` - Displays the message bubbles for a conversation
- `MessageBubble` - Individual message bubble component
- `ConversationHeader` - Shows the participants and conversation info
- `MessageComposer` - Form for creating a new iMessage conversation

### Example Usage

```svelte
<script>
    import IMessagePost from '$lib/components/imessage/IMessagePost.svelte';

    // Fetch your conversation data from the server
    export let conversation;
    export let messages;
    export let participants;
</script>

<IMessagePost {conversation} {messages} {participants} timestampISO={new Date().toISOString()} />
```
