# YouTube Transcript Chat Application

## Overview

A web application that extracts YouTube video transcripts and enables AI-powered conversations about the video content. Users can input YouTube URLs to extract transcripts and then chat with an AI assistant about the video content.

## Project Architecture

- **Frontend**: React with TypeScript, Vite, Tailwind CSS, shadcn/ui components
- **Backend**: Express.js server with TypeScript
- **Database**: In-memory storage (MemStorage implementation)
- **AI Integration**: OpenAI GPT-4o for transcript analysis and chat responses
- **YouTube Integration**: For extracting video transcripts and metadata

### Key Components

- **URL Input**: Allows users to enter YouTube URLs for transcript extraction
- **Transcript Panel**: Displays extracted video transcripts with timestamps
- **Chat Panel**: AI-powered chat interface for discussing video content
- **OpenAI Service**: Handles AI interactions for chat responses
- **YouTube Service**: Manages YouTube URL processing and transcript extraction

### Data Models

- **Transcripts**: Store video metadata and transcript segments
- **Chat Messages**: Store user questions and AI responses linked to transcripts
- **Users**: Basic user management structure

## Features

- YouTube URL validation and video ID extraction
- Automatic transcript extraction with timestamp preservation
- AI-powered chat about video content
- Copy and download transcript functionality
- Responsive design with mobile-friendly interface
- Real-time chat with loading states

## Recent Changes

- **2024-12-24**: Initial project setup with complete YouTube transcript extraction and AI chat functionality
- **2024-12-24**: Configured OpenAI API integration for chat responses

## User Preferences

None specified yet.

## Dependencies

- API: OpenAI API key for AI chat functionality
- Frontend: React, TypeScript, Tailwind CSS, shadcn/ui
- Backend: Express.js, OpenAI SDK
