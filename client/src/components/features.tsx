import { Zap, Sparkles, Smartphone } from "lucide-react";

export default function Features() {
  return (
    <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="text-center p-6">
        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
          <Zap className="text-blue-600" size={24} />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Fast Extraction</h3>
        <p className="text-slate-600">Quickly extract transcripts from any YouTube video with automatic caption detection.</p>
      </div>
      <div className="text-center p-6">
        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
          <Sparkles className="text-purple-600" size={24} />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">AI Summary</h3>
        <p className="text-slate-600">Generate concise summaries of video content with AI-powered analysis.</p>
      </div>
      <div className="text-center p-6">
        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
          <Smartphone className="text-green-600" size={24} />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Mobile Friendly</h3>
        <p className="text-slate-600">Works seamlessly across all devices with responsive design and touch-friendly interface.</p>
      </div>
    </div>
  );
}
