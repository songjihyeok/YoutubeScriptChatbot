import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { youtubeService } from "./services/youtube";
import { openaiService } from "./services/openai";
import { insertTranscriptSchema } from "@shared/schema";
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
});


const extractTranscriptSchema = z.object({
  youtubeUrl: z.string().url("Please enter a valid YouTube URL")
});

export async function registerRoutes(app: Express): Promise<Server> {

  // Extract YouTube transcript using SearchAPI
  app.post("/api/extract-transcript", async (req, res) => {
    try {
      const { youtubeUrl } = extractTranscriptSchema.parse(req.body);
      
      // Extract video ID from URL
      const videoIdMatch = youtubeUrl.match(
        /(?:v=|\/embed\/|\/v\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/
      );
      const videoId = videoIdMatch ? videoIdMatch[1] : "";

      if (!videoId) {
        throw new Error("Invalid YouTube URL");
      }

      // Check if transcript already exists
      const existingTranscript = await storage.getTranscriptByVideoId(videoId);
      if (existingTranscript) {
        return res.json(existingTranscript);
      }

      // Get transcript from SearchAPI
      const apiKey = process.env.SEARCH_API_KEY;
      if (!apiKey) {
        throw new Error("SEARCH_API_KEY not configured");
      }

      const searchApiRes = await fetch(
        `https://www.searchapi.io/api/v1/search?api_key=${apiKey}&engine=youtube_transcripts&video_id=${videoId}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!searchApiRes.ok) {
        throw new Error(`SearchAPI error: ${searchApiRes.statusText}`);
      }

      const searchApiData = await searchApiRes.json();
      console.log("SearchAPI response:", searchApiData);

      // Check if transcripts are available
      if (!searchApiData.transcripts || searchApiData.transcripts.length === 0) {
        throw new Error("No transcripts available for this video");
      }

      // Transform SearchAPI response to match our format
      const transcriptData = {
        youtubeUrl,
        videoId,
        title:
          searchApiData.filename?.replace(/_[a-zA-Z0-9]{8}\.[^.]+$/, "") ||
          "Unknown Title",
        channelName: "YouTube Channel",
        duration: "N/A",
        thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        segments: searchApiData.transcripts.map((transcript: any) => ({
          text: transcript.text.trim(),
          start: transcript.start,
          duration: transcript.duration,
        })),
      };

      // Save to storage
      const savedTranscript = await storage.createTranscript(transcriptData);
      
      res.json(savedTranscript);

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


  // Get transcript summary
  app.get("/api/transcripts/:id/summary", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const transcript = await storage.getTranscript(id);
      
      if (!transcript) {
        return res.status(404).json({ message: "Transcript not found" });
      }

      // Check if summary already exists in storage
      const existingSummary = await storage.getTranscriptSummary(id);
      if (existingSummary) {
        return res.json({ summary: existingSummary });
      }

      // Prepare transcript text for AI
      const transcriptText = transcript.segments
        .map(segment => `[${segment.start}] ${segment.text}`)
        .join('\n');

      // Generate summary using OpenAI
      const summary = await openaiService.summarizeTranscript(
        transcriptText,
        transcript.title
      );

      // Save summary to storage
      await storage.saveTranscriptSummary(id, summary);

      res.json({ summary });

    } catch (error: any) {
      console.error("Summary generation error:", error);
      res.status(500).json({ 
        message: error.message || "Failed to generate summary" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
