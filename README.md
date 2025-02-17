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

**Sync the Appwrite collections with the following command:**

```bash
bun run appwrite:import
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

