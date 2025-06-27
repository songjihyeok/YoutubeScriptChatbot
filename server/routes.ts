import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { youtubeService } from "./services/youtube";
import { openaiService } from "./services/openai";
import { insertTranscriptSchema, insertChatMessageSchema } from "@shared/schema";
import { z } from "zod";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// .env 파일 로드 (가장 먼저 실행되어야 함)
dotenv.config({ path: join(__dirname, '../.env') });
console.log("Environment Variables Loaded:", {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  YOUTUBE_API_KEY: process.env.YOUTUBE_API_KEY ?? "✗ Missing",
});


const extractTranscriptSchema = z.object({
  youtubeUrl: z.string().url("Please enter a valid YouTube URL")
});

const chatMessageRequestSchema = z.object({
  transcriptId: z.number(),
  message: z.string().min(1, "Message cannot be empty")
});

export async function registerRoutes(app: Express): Promise<Server> {

  // Extract YouTube transcript
  app.post("/api/extract-transcript", async (req, res) => {
    try {
      const { youtubeUrl } = extractTranscriptSchema.parse(req.body);
      
      // Check if transcript already exists
      const videoId = youtubeService.extractVideoId(youtubeUrl);
      if (videoId) {
        const existingTranscript = await storage.getTranscriptByVideoId(videoId);
        if (existingTranscript) {
          return res.json(existingTranscript);
        }
      }

      // Extract new transcript using YouTube service
      const { segments } = await youtubeService.extractTranscript(youtubeUrl);

      // Save to storage
      const transcriptData = {
        youtubeUrl,
        videoId: videoId,
        title: "title",
        channelName: "channelName",
        duration: "duration",
        thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        segments: segments
      };
      console.log("segments", segments)


      res.json(transcriptData);

    } catch (error: any) {
      console.error("Transcript extraction error:", error);
      res.status(400).json({ 
        message: error.message || "Failed to extract transcript" 
      });
    }
  });

  // Save transcript from Python server
  app.post("/api/transcripts", async (req, res) => {
    try {
      const transcriptData = req.body;
      
      // Save to storage
      const savedTranscript = await storage.createTranscript(transcriptData);
      
      res.json(savedTranscript);
    } catch (error: any) {
      console.error("Error saving transcript:", error);
      res.status(500).json({ message: "Failed to save transcript" });
    }
  });

  // Get transcript by ID
  app.get("/api/transcripts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const transcript = await storage.getTranscript(id);
      
      if (!transcript) {
        return res.status(404).json({ message: "Transcript not found" });
      }

      res.json(transcript);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch transcript" });
    }
  });

  // Send chat message
  app.post("/api/chat", async (req, res) => {
    try {
      const { transcriptId, message } = chatMessageRequestSchema.parse(req.body);
      
      // Get transcript
      const transcript = await storage.getTranscript(transcriptId);
      if (!transcript) {
        return res.status(404).json({ message: "Transcript not found" });
      }

      // Prepare transcript text for AI
      const transcriptText = transcript.segments
        .map(segment => `[${segment.start}] ${segment.text}`)
        .join('\n');

      // Get AI response
      const aiResponse = await openaiService.chatWithTranscript(
        message, 
        transcriptText, 
        transcript.title
      );

      // Save chat message
      const chatMessage = await storage.createChatMessage({
        transcriptId,
        message,
        response: aiResponse
      });

      res.json(chatMessage);

    } catch (error: any) {
      console.error("Chat error:", error);
      res.status(400).json({ 
        message: error.message || "Failed to process chat message" 
      });
    }
  });

  // Get chat history for transcript
  app.get("/api/transcripts/:id/chat", async (req, res) => {
    try {
      const transcriptId = parseInt(req.params.id);
      const chatMessages = await storage.getChatMessagesByTranscriptId(transcriptId);
      res.json(chatMessages);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch chat history" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
