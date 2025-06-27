import { Youtube, HelpCircle, Settings } from "lucide-react";

export default function Header() {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-600 rounded-lg flex items-center justify-center">
              <Youtube className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-slate-900">YouTube Transcript Chat</h1>
              <p className="text-sm text-slate-500">AI-powered video analysis</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button className="text-slate-500 hover:text-slate-700 transition-colors">
              <HelpCircle size={20} />
            </button>
            <button className="text-slate-500 hover:text-slate-700 transition-colors">
              <Settings size={20} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
