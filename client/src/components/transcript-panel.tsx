import { FileText, Copy, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Transcript } from "@shared/schema";

interface TranscriptPanelProps {
  transcript: Transcript | null;
}

export default function TranscriptPanel({ transcript }: TranscriptPanelProps) {
  const { toast } = useToast();

  const handleCopy = () => {
    if (!transcript) return;

    const transcriptText = transcript.segments
      .map((segment) => `[${segment.start}] ${segment.text}`)
      .join("\n");

    navigator.clipboard.writeText(transcriptText);
    toast({
      title: "Copied!",
      description: "Transcript copied to clipboard.",
    });
  };

  const handleDownload = () => {
    console.log("transcript", transcript);
    if (!transcript) return;

    const transcriptText = transcript.segments
      .map((segment) => `[${segment.start}] ${segment.text}`)
      .join("\n");

    const blob = new Blob([transcriptText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${transcript.title}-transcript.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 h-fit">
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center">
              <FileText className="text-accent" size={16} />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">
              Video Transcript
            </h3>
          </div>
          {transcript && (
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" onClick={handleCopy}>
                <Copy size={14} />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleDownload}>
                <Download size={14} />
              </Button>
            </div>
          )}
        </div>
      </div>

      {!transcript ? (
        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="text-slate-400" size={32} />
          </div>
          <h4 className="text-lg font-medium text-slate-900 mb-2">
            No transcript loaded
          </h4>
          <p className="text-slate-500">
            Enter a YouTube URL above to extract and display the video
            transcript.
          </p>
        </div>
      ) : (
        <div className="p-6">
          {/* Video Info */}
          <div className="flex items-start space-x-4 mb-6 p-4 bg-slate-50 rounded-lg">
            <div className="w-20 h-14 bg-slate-200 rounded-lg flex-shrink-0 flex items-center justify-center">
              {transcript.thumbnailUrl ? (
                <img
                  src={transcript.thumbnailUrl}
                  alt="Video thumbnail"
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <FileText className="text-slate-400" />
              )}
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-slate-900 line-clamp-2 mb-1">
                {transcript.title}
              </h4>
              <p className="text-sm text-slate-500">
                {transcript.channelName} • {transcript.duration}
              </p>
            </div>
          </div>

          {/* Transcript Text */}
          <div className="max-h-96 overflow-y-auto">
            <div className="space-y-4">
              {transcript.segments.map((segment, index) => (
                <div key={index} className="flex space-x-3">
                  <span className="text-xs text-slate-500 font-mono bg-slate-100 px-2 py-1 rounded flex-shrink-0">
                    {segment.start}
                  </span>
                  <p className="text-slate-700 leading-relaxed">
                    {segment.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
