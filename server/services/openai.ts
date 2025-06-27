import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export class OpenAIService {
  async chatWithTranscript(message: string, transcriptText: string, videoTitle: string): Promise<string> {
    try {
      const systemPrompt = `You are an AI assistant helping users understand and analyze YouTube video content. You have access to the complete transcript of a video titled "${videoTitle}".

Your role is to:
- Answer questions about the video content based on the transcript
- Provide summaries and explanations of key topics
- Help users find specific information within the video
- Offer insights and analysis based on what's discussed

Always base your responses on the actual transcript content provided. If something isn't covered in the transcript, let the user know.

Here is the complete transcript:
${transcriptText}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      });

      return response.choices[0].message.content || "I apologize, but I couldn't generate a response. Please try again.";

    } catch (error: any) {
      console.error("OpenAI API error:", error);
      throw new Error("Failed to generate AI response. Please check your OpenAI API configuration.");
    }
  }

  async summarizeTranscript(transcriptText: string, videoTitle: string): Promise<string> {
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
