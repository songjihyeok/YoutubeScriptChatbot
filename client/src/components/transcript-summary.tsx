import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Transcript } from "@shared/schema";

interface TranscriptSummaryProps {
  transcript: Transcript | null;
}

export default function TranscriptSummary({ transcript }: TranscriptSummaryProps) {
  const [summary, setSummary] = useState<string | null>(null);

  const generateSummary = useMutation({
    mutationFn: async (transcriptId: number) => {
      const response = await fetch(`/api/transcripts/${transcriptId}/summary`);
      if (!response.ok) {
        throw new Error("Failed to generate summary");
      }
      const data = await response.json();
      return data.summary;
    },
    onSuccess: (data) => {
      setSummary(data);
    },
  });

  const handleGenerateSummary = () => {
    if (transcript) {
      generateSummary.mutate(transcript.id);
    }
  };

  if (!transcript) {
    return null;
  }

  return (
    <Card className="mt-6">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <CardTitle className="text-lg">AI Summary</CardTitle>
          </div>
          {!summary && (
            <Button
              onClick={handleGenerateSummary}
              disabled={generateSummary.isPending}
              size="sm"
              className="bg-purple-600 hover:bg-purple-700"
            >
              {generateSummary.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Summary
                </>
              )}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {summary ? (
          <div className="prose prose-sm max-w-none">
            <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
              {summary}
            </p>
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-slate-500 text-sm">
              Click "Generate Summary" to create an AI-powered summary of the video transcript.
            </p>
          </div>
        )}
        {generateSummary.isError && (
          <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
            Failed to generate summary. Please try again.
          </div>
        )}
      </CardContent>
    </Card>
  );
}