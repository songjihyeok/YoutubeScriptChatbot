import { useState } from "react";
import Header from "@/components/header";
import UrlInput from "@/components/url-input";
import TranscriptPanel from "@/components/transcript-panel";
import Features from "@/components/features";
import Footer from "@/components/footer";
import { Transcript } from "@shared/schema";

export default function Home() {
  const [currentTranscript, setCurrentTranscript] = useState<Transcript | null>(
    null
  );
  const [url, setUrl] = useState("");

  return (
    <div className="bg-slate-50 min-h-screen">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <UrlInput
          onTranscriptLoaded={setCurrentTranscript}
          url={url}
          setUrl={setUrl}
        />

        <div className="max-w-4xl mx-auto">
          <TranscriptPanel transcript={currentTranscript} />
        </div>

        <Features />
      </main>

      <Footer />
    </div>
  );
}
