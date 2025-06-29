# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.
항상 코드 변경 후 git commit을 수행하세요.
commit message는 변경 내용을 간결하게 설명해야 합니다.

## Project Overview

YouTube Script Chatbot - A web application that extracts YouTube video transcripts and enables AI-powered conversations about the content using GPT-4o.

## Essential Commands

```bash
# Development
npm run dev          # Start development server with hot reload (port 5001)
npm run build        # Build frontend (Vite) and backend (esbuild) for production
npm start           # Run production server

# Code Quality
npm run check       # TypeScript type checking

# Database (if using Drizzle)
npm run db:push     # Push database schema changes
```

## Architecture

### Stack

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui components
- **Backend**: Express.js + TypeScript
- **AI**: OpenAI GPT-4o for chat functionality
- **Storage**: In-memory storage (MemStorage class)

### Project Structure

```
/client              # React frontend
  /src/components    # UI components (shadcn/ui based)
  /src/pages        # Route pages
  /src/hooks        # Custom React hooks
/server             # Express backend
  /services         # YouTube & OpenAI service integrations
  /storage.ts       # In-memory data storage
/shared             # Shared types and schemas (Zod validation)
/youtubeCrawling    # Python-based transcript extraction scripts
```

### Path Aliases

- `@/*` → `./client/src/*`
- `@shared/*` → `./shared/*`

## Required Environment Variables

Create a `.env` file with:

```
OPENAI_API_KEY=your_openai_api_key
PORT=5001
NODE_ENV=development
```

## System Requirements

## Key API Endpoints

- `POST /api/extract-transcript` - Extract YouTube video transcript
- `POST /api/transcripts` - Save transcript data
- `GET /api/transcripts/:id` - Get transcript by ID
- `POST /api/chat` - Send chat message about transcript

## Important Implementation Details

1. **YouTube Transcript Extraction**: Uses youtube-transcript library to fetch subtitles/captions from YouTube videos
2. **AI Chat Context**: Provides full transcript to GPT-4o for context-aware responses
3. **Data Persistence**: Currently uses in-memory storage - data is lost on restart

## Common Development Tasks

When implementing new features:

1. Define types in `/shared/schema.ts` using Zod for validation
2. Create API endpoints in `/server/routes.ts`
3. Implement service logic in `/server/services/`
4. Build UI components using shadcn/ui components in `/client/src/components/`
5. Use React Query for data fetching in frontend components

## Current Limitations

- No production database configured (using in-memory storage)
- No formal testing framework set up
- Limited error handling and logging
- No rate limiting implemented
