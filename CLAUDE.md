# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

UIGen is an AI-powered React component generator with live preview. Users describe components in a chat interface, and the AI (Claude) generates functional React code that renders in real-time.

The application runs without an API key by using a mock provider that returns static component examples. With an Anthropic API key, it uses Claude Haiku 4.5 for dynamic generation.

## Development Commands

```bash
# Initial setup - install deps, generate Prisma client, run migrations
npm run setup

# Start dev server on port 3010 (configured)
npm run dev

# Start dev server in background (logs to logs.txt)
npm run dev:daemon

# Run tests
npm test

# Build for production
npm run build

# Start production server on port 3010
npm start

# Reset database (WARNING: deletes all data)
npm run db:reset

# Lint code
npm run lint
```

## Tech Stack

- Next.js 15 (App Router) + React 19 + TypeScript
- Tailwind CSS v4 (app UI) — preview iframe uses Tailwind CDN separately
- Vercel AI SDK (`ai` package) for streaming + tool calls
- Prisma + SQLite for persistence
- Monaco Editor for code editing
- `@babel/standalone` for JSX→ES module transform in the browser
- `esm.sh` CDN for resolving third-party npm packages in the preview iframe

## Architecture

### Virtual File System

The core innovation is a VirtualFileSystem class (`src/lib/file-system.ts`) that manages files entirely in-memory. No files are written to disk during component generation.

- Files stored as a Map of FileNode objects
- Supports create, read, update, delete, rename operations
- Serializes to JSON for database persistence
- Deserializes from JSON to restore project state
- Path normalization handles edge cases

The file system is reconstructed on each chat API request from serialized data sent from the client.

### AI Tool Integration

The chat API route (`src/app/api/chat/route.ts`) provides two tools to the AI:

1. **str_replace_editor** - Text editor commands (view, create, str_replace, insert)
2. **file_manager** - File operations (rename, delete)

These tools operate on the VirtualFileSystem instance. The AI uses these to generate and modify component files.

### Component Generation Workflow

1. User sends message via ChatInterface
2. POST to `/api/chat` with messages + serialized file system
3. Server reconstructs VirtualFileSystem from serialized data
4. Streams AI response using Vercel AI SDK
5. AI calls tools to create/modify files in virtual file system
6. On completion, saves messages + serialized file system to database (if authenticated)
7. Client receives updated file system and re-renders preview

### Preview Rendering

PreviewFrame (`src/components/preview/PreviewFrame.tsx`) renders generated components:

- Looks for entry point: /App.jsx, /App.tsx, /index.jsx, or /index.tsx
- Uses `src/lib/transform/jsx-transformer.ts` to Babel-transform JSX/TSX to ES modules
- Builds an import map mapping file paths and `@/` aliases to blob URLs
- Third-party package imports (e.g. `import { motion } from 'framer-motion'`) are resolved to `https://esm.sh/<package>` automatically
- Missing local imports get placeholder stub modules so the preview doesn't crash
- Generates HTML with import map, injects into sandboxed iframe; preview updates reactively when file system changes

### Authentication

JWT-based authentication using jose library (`src/lib/auth.ts`):

- Sign up/sign in forms hash passwords with bcrypt
- Session stored in HTTP-only cookie
- Anonymous users can use the app (projects not saved)
- Authenticated users have projects persisted to SQLite

### Database Schema

Prisma with SQLite (`prisma/schema.prisma`):

- **User** - id, email, password (hashed), timestamps
- **Project** - id, name, userId (optional), messages (JSON string), data (JSON string of file system), timestamps

Projects are owned by users via foreign key. Anonymous projects exist only in client state.

### Mock Provider

When ANTHROPIC_API_KEY is not set, MockLanguageModel (`src/lib/provider.ts`) provides fallback:

- Returns pre-written component examples (Counter, ContactForm, Card)
- Simulates streaming with character-by-character delay
- Goes through multiple tool-calling steps to demonstrate the workflow
- Limited to 4 maxSteps to prevent repetition

## Key Constraints

### AI Generation Prompt

The system prompt (`src/lib/prompts/generation.tsx`) instructs the AI to:

- Always create /App.jsx as the root component with default export
- Use Tailwind CSS classes only (no hardcoded styles)
- Import local files using '@/' alias (e.g., `import Foo from '@/components/Foo'`)
- Operate on root path '/' (virtual file system root)
- Keep responses brief unless asked to summarize

### Preview Entry Points

PreviewFrame searches for entry points in this order:
1. /App.jsx
2. /App.tsx
3. /index.jsx
4. /index.tsx
5. /src/App.jsx
6. /src/App.tsx
7. First .jsx/.tsx file found

If no entry point exists, shows helpful error message.

## Testing

Tests use Vitest + React Testing Library. Test files located in `__tests__` directories alongside source files:

- `src/components/chat/__tests__/` - Chat component tests
- `src/lib/contexts/__tests__/` - Context tests
- `src/lib/__tests__/` - File system tests
- `src/lib/transform/__tests__/` - JSX transformer tests
- `src/components/editor/__tests__/` - Editor tests

Run individual test file:
```bash
npx vitest run src/lib/__tests__/file-system.test.ts
```

## Environment Variables

`.env` file (optional):

```
ANTHROPIC_API_KEY=your-api-key-here
```

If omitted, app runs with mock provider returning static examples.
