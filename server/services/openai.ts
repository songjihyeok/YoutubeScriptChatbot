import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
console.log("OPENAI_API_KEY", process.env.OPENAI_API_KEY);


export class OpenAIService {

  async summarizeTranscript(transcriptText: string, videoTitle: string): Promise<string> {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an AI assistant that provides concise and informative summaries of video transcripts. Focus on the main topics, key points, and important insights."
          },
          {
            role: "user",
            content: `Please provide a comprehensive summary of this video transcript from "${videoTitle}":\n\n${transcriptText}`
          }
        ],
        max_tokens: 500,
        temperature: 0.5,
      });

      return response.choices[0].message.content || "Unable to generate summary.";

    } catch (error: any) {
      console.error("OpenAI API error:", error);
      throw new Error("Failed to generate transcript summary.");
    }
  }
}

export const openaiService = new OpenAIService();
