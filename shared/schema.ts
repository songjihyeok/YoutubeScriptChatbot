import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const transcripts = pgTable("transcripts", {
  id: serial("id").primaryKey(),
  youtubeUrl: text("youtube_url").notNull(),
  videoId: text("video_id").notNull(),
  title: text("title").notNull(),
  channelName: text("channel_name").notNull(),
  duration: text("duration").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  segments: jsonb("segments").notNull().$type<TranscriptSegment[]>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  transcriptId: integer("transcript_id").references(() => transcripts.id).notNull(),
  message: text("message").notNull(),
  response: text("response").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export interface TranscriptSegment {
  start: number;
  duration: number;
  text: string;
}

export const insertTranscriptSchema = createInsertSchema(transcripts).omit({
  id: true,
  createdAt: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
});

export type InsertTranscript = z.infer<typeof insertTranscriptSchema>;
export type Transcript = typeof transcripts.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// YouTube 데이터 응답 관련 타입 추가
export interface YouTubeVideoData {
  title: string;
  description: string;
  duration: number; // 초 단위
  duration_string: string;
  view_count: number;
  like_count: number;
  upload_date: string;
  uploader: string;
  uploader_id: string;
  channel: string;
  channel_id: string;
  thumbnail: string;
  thumbnails: any[];
  webpage_url: string;
  video_id: string;
  categories: string[];
  tags: string[];
  age_limit: number;
  availability: string;
  language: string;
  live_status: string;
  resolution: string;
  fps: number;
  vcodec: string;
  acodec: string;
  filesize: number;
  format: string;
  ext: string;
  used_proxy?: string; // 사용된 프록시 정보
}

export interface YouTubeDataResponse {
  success: boolean;
  message: string;
  data: YouTubeVideoData;
}

// URL 입력 검증 스키마
export const youtubeUrlSchema = z.object({
  url: z.string().url("올바른 YouTube URL을 입력해주세요")
});

export type YouTubeUrlInput = z.infer<typeof youtubeUrlSchema>;
