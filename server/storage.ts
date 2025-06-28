import { transcripts, users, type Transcript, type InsertTranscript, type User, type InsertUser, type TranscriptSegment } from "@shared/schema";

export interface IStorage {
  // Transcript methods
  createTranscript(transcript: InsertTranscript): Promise<Transcript>;
  getTranscriptByVideoId(videoId: string): Promise<Transcript | undefined>;
  getTranscript(id: number): Promise<Transcript | undefined>;
  
  // Summary methods
  getTranscriptSummary(transcriptId: number): Promise<string | undefined>;
  saveTranscriptSummary(transcriptId: number, summary: string): Promise<void>;
  
  // User methods (existing)
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
}

export class MemStorage implements IStorage {
  private transcripts: Map<number, Transcript>;
  private users: Map<number, User>;
  private summaries: Map<number, string>;
  private currentTranscriptId: number;
  private currentUserId: number;

  constructor() {
    this.transcripts = new Map();
    this.users = new Map();
    this.summaries = new Map();
    this.currentTranscriptId = 1;
    this.currentUserId = 1;
  }

  async createTranscript(insertTranscript: InsertTranscript): Promise<Transcript> {
    const id = this.currentTranscriptId++;
    const transcript: Transcript = { 
      id,
      youtubeUrl: insertTranscript.youtubeUrl,
      videoId: insertTranscript.videoId,
      title: insertTranscript.title,
      channelName: insertTranscript.channelName,
      duration: insertTranscript.duration,
      thumbnailUrl: insertTranscript.thumbnailUrl ?? null,
      segments: insertTranscript.segments as TranscriptSegment[],
      createdAt: new Date()
    };
    this.transcripts.set(id, transcript);
    return transcript;
  }

  async getTranscriptByVideoId(videoId: string): Promise<Transcript | undefined> {
    return Array.from(this.transcripts.values()).find(
      (transcript) => transcript.videoId === videoId
    );
  }

  async getTranscript(id: number): Promise<Transcript | undefined> {
    return this.transcripts.get(id);
  }


  async getTranscriptSummary(transcriptId: number): Promise<string | undefined> {
    return this.summaries.get(transcriptId);
  }

  async saveTranscriptSummary(transcriptId: number, summary: string): Promise<void> {
    this.summaries.set(transcriptId, summary);
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
}

export const storage = new MemStorage();
