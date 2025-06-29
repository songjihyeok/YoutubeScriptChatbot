import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Link, Download, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Transcript } from "@shared/schema";

interface UrlInputProps {
  onTranscriptLoaded: (transcript: Transcript) => void;
  url: string;
  setUrl: (url: string) => void;
}

export default function UrlInput({
  onTranscriptLoaded,
  url,
  setUrl,
}: UrlInputProps) {
  const { toast } = useToast();
  const extractMutation = useMutation({
    mutationFn: async (youtubeUrl: string) => {
      try {
        // Extract transcript using our server endpoint
        const res = await apiRequest("POST", "/api/extract-transcript", {
          youtubeUrl,
        });

        return await res.json();
      } catch (error) {
        console.error("Error extracting transcript:", error);
        throw error;
      }
    },
    onSuccess: (transcript: Transcript) => {
      onTranscriptLoaded(transcript);
      toast({
        title: "Success!",
        description: "Transcript extracted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to extract transcript",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      toast({
        title: "Error",
        description: "Please enter a YouTube URL",
        variant: "destructive",
      });
      return;
    }
    extractMutation.mutate(url.trim());
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
          <Link className="text-primary" size={16} />
        </div>
        <h2 className="text-lg font-semibold text-slate-900">
          Extract YouTube Transcript
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            type="url"
            placeholder="Enter YouTube URL (e.g., https://youtube.com/watch?v=...)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex-1"
            disabled={extractMutation.isPending}
          />
          <Button
            type="submit"
            disabled={extractMutation.isPending}
            className="whitespace-nowrap"
          >
            {extractMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Extract Transcript
          </Button>
        </div>

        <div className="text-sm text-slate-600">
          <p className="mb-2">Try these sample videos that work well:</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() =>
                setUrl("https://www.youtube.com/watch?v=kJQP7kiw5Fk")
              }
              className="text-blue-600 hover:text-blue-800 underline text-xs"
            >
              DeepMind Tutorial
            </button>
            <button
              type="button"
              onClick={() =>
                setUrl("https://www.youtube.com/watch?v=aircAruvnKk")
              }
              className="text-blue-600 hover:text-blue-800 underline text-xs"
            >
              3Blue1Brown Math
            </button>
            <button
              type="button"
              onClick={() =>
                setUrl("https://www.youtube.com/watch?v=R9OHn5ZF4Uo")
              }
              className="text-blue-600 hover:text-blue-800 underline text-xs"
            >
              Web Dev Tutorial
            </button>
          </div>
        </div>

        {extractMutation.isPending && (
          <div className="flex items-center space-x-3 text-slate-600">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Extracting transcript from YouTube video...</span>
          </div>
        )}

        {extractMutation.isError && (
          <div className="space-y-3">
            <div className="flex items-center space-x-3 text-red-600 bg-red-50 p-3 rounded-lg">
              <AlertTriangle size={20} />
              <div>
                <p className="font-medium">
                  {extractMutation.error?.message ||
                    "Failed to extract transcript"}
                </p>
              </div>
            </div>
            <div className="text-sm text-slate-600 bg-blue-50 p-3 rounded-lg">
              <p className="font-medium mb-2">
                💡 Tips for successful transcript extraction:
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>Try videos with captions/subtitles enabled</li>
                <li>Educational or tutorial videos usually work well</li>
                <li>Some popular channels may be temporarily blocked</li>
                <li>
                  If you get a bot detection error, try again in a few minutes
                </li>
              </ul>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
