import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bot, User, Send, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Transcript, ChatMessage } from "@shared/schema";

interface ChatPanelProps {
  transcript: Transcript | null;
}

export default function ChatPanel({ transcript }: ChatPanelProps) {
  const [message, setMessage] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch chat history
  const { data: chatHistory = [] } = useQuery<ChatMessage[]>({
    queryKey: [`/api/transcripts/${transcript?.id}/chat`],
    enabled: !!transcript?.id,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageText: string) => {
      if (!transcript) throw new Error("No transcript loaded");
      
      const res = await apiRequest("POST", "/api/chat", {
        transcriptId: transcript.id,
        message: messageText,
      });
      return res.json();
    },
    onSuccess: () => {
      setMessage("");
      queryClient.invalidateQueries({
        queryKey: [`/api/transcripts/${transcript?.id}/chat`],
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !transcript) return;
    sendMessageMutation.mutate(message.trim());
  };

  const formatTime = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-[600px]">
      {/* Chat Header */}
      <div className="p-6 border-b border-slate-200 flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
            <Bot className="text-purple-600" size={16} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">AI Assistant</h3>
            <p className="text-sm text-slate-500">Ask questions about the transcript</p>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {!transcript ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bot className="text-purple-600" size={32} />
            </div>
            <h4 className="text-lg font-medium text-slate-900 mb-2">Ready to chat!</h4>
            <p className="text-slate-500 max-w-xs mx-auto">Once you load a transcript, you can ask me questions about the video content.</p>
          </div>
        ) : chatHistory.length === 0 ? (
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Bot className="text-purple-600" size={16} />
            </div>
            <div className="flex-1">
              <div className="bg-slate-100 rounded-2xl rounded-tl-md p-4 max-w-lg">
                <p className="text-slate-800">
                  Hi! I've analyzed the transcript for "{transcript.title}". Feel free to ask me any questions about the video content, key topics discussed, or specific details you'd like me to clarify.
                </p>
              </div>
              <span className="text-xs text-slate-500 mt-1 block">Just now</span>
            </div>
          </div>
        ) : (
          chatHistory.map((chat) => (
            <div key={chat.id} className="space-y-4">
              {/* User Message */}
              <div className="flex items-start space-x-3 justify-end">
                <div className="flex-1">
                  <div className="bg-primary rounded-2xl rounded-tr-md p-4 max-w-lg ml-auto">
                    <p className="text-white">{chat.message}</p>
                  </div>
                  <span className="text-xs text-slate-500 mt-1 block text-right">
                    {formatTime(chat.createdAt)}
                  </span>
                </div>
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="text-white" size={16} />
                </div>
              </div>

              {/* AI Response */}
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="text-purple-600" size={16} />
                </div>
                <div className="flex-1">
                  <div className="bg-slate-100 rounded-2xl rounded-tl-md p-4 max-w-lg">
                    <p className="text-slate-800 whitespace-pre-wrap">{chat.response}</p>
                  </div>
                  <span className="text-xs text-slate-500 mt-1 block">
                    {formatTime(chat.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
        
        {sendMessageMutation.isPending && (
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Bot className="text-purple-600" size={16} />
            </div>
            <div className="flex-1">
              <div className="bg-slate-100 rounded-2xl rounded-tl-md p-4 max-w-lg">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                  <span className="text-slate-600">Thinking...</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Chat Input */}
      <div className="p-6 border-t border-slate-200 flex-shrink-0">
        <form onSubmit={handleSubmit} className="flex space-x-3">
          <Input
            type="text"
            placeholder="Ask a question about the transcript..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={!transcript || sendMessageMutation.isPending}
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={!transcript || !message.trim() || sendMessageMutation.isPending}
          >
            <Send size={16} />
          </Button>
        </form>
        <p className="text-xs text-slate-500 mt-2">
          <Info className="inline mr-1" size={12} />
          {transcript ? "Ask me anything about this video!" : "Chat will be enabled once you load a transcript"}
        </p>
      </div>
    </div>
  );
}
