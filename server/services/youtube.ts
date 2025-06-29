export interface TranscriptSegment {
  start: number;
  duration: number;
  text: string;
}

export interface VideoInfo {
  id: string;
  title: string;
  description: string;
  duration: string;
  channelTitle: string;
  publishedAt: string;
  language?: string;
  defaultLanguage?: string;
  availableLanguages?: string[];
}

export const youtubeService = {
  // 비디오 ID 추출
  extractVideoId(url: string): string | null {
    const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  },

  // yt-dlp를 사용하여 비디오 정보 가져오기
  async getVideoInfo(videoId: string): Promise<VideoInfo> {
    try {
      const { default: ytDlpExec } = await import('yt-dlp-exec');
      
      // yt-dlp로 비디오 메타데이터 가져오기
      const info = await ytDlpExec(`https://www.youtube.com/watch?v=${videoId}`, {
        dumpSingleJson: true,
        skipDownload: true,
      } as any);

      // 타입 안전을 위해 info를 any로 캐스팅
      const videoData = info as any;

      // 자막 언어 정보 추출
      const availableLanguages: string[] = [];
      const subtitles = videoData.subtitles || {};
      const automaticCaptions = videoData.automatic_captions || {};
      
      // 수동 자막 언어
      Object.keys(subtitles).forEach(lang => {
        if (!availableLanguages.includes(lang)) {
          availableLanguages.push(lang);
        }
      });
      
      // 자동 생성 자막 언어
      Object.keys(automaticCaptions).forEach(lang => {
        if (!availableLanguages.includes(lang)) {
          availableLanguages.push(lang);
        }
      });

      // 비디오 기본 언어 결정
      const defaultLanguage = videoData.language || 
                             (availableLanguages.length > 0 ? availableLanguages[0] : undefined);

      // 업로드 날짜 포맷팅
      const uploadDate = videoData.upload_date;
      let publishedAt = "";
      if (uploadDate && uploadDate.length === 8) {
        const year = uploadDate.slice(0, 4);
        const month = uploadDate.slice(4, 6);
        const day = uploadDate.slice(6, 8);
        publishedAt = `${year}-${month}-${day}`;
      }

      return {
        id: videoId,
        title: videoData.title || "Unknown Title",
        description: videoData.description || "",
        duration: this.formatDuration(videoData.duration || 0),
        channelTitle: videoData.uploader || videoData.channel || "Unknown Channel",
        publishedAt,
        language: videoData.language,
        defaultLanguage,
        availableLanguages
      };
    } catch (error) {
      console.error('Error fetching video info with yt-dlp:', error);
      
      // yt-dlp 실패 시 기본 정보만 반환
      return {
        id: videoId,
        title: "Unknown Title",
        description: "",
        duration: "N/A",
        channelTitle: "Unknown Channel",
        publishedAt: "",
        language: undefined,
        defaultLanguage: undefined,
        availableLanguages: []
      };
    }
  },

  // 초를 시:분:초 형태로 변환
  formatDuration(seconds: number): string {
    if (!seconds || seconds === 0) return "N/A";
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
      return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
  },

  async getTranscript(videoId: string): Promise<TranscriptSegment[]> {
    try {
      // youtube-transcript 라이브러리 사용
      return await this.getTranscriptFallback(videoId);
    } catch (error) {
      console.error('Error fetching transcript:', error);
      throw new Error('Failed to fetch transcript. This video may not have accessible captions.');
    }
  },

  // youtube-transcript 라이브러리 사용
  async getTranscriptFallback(videoId: string): Promise<TranscriptSegment[]> {
    try {
      const { YoutubeTranscript } = await import('youtube-transcript');
      const transcript = await YoutubeTranscript.fetchTranscript(videoId);
      
      return transcript.map((item: any) => ({
        start: item.offset / 1000, // 밀리초를 초로 변환
        duration: item.duration / 1000,
        text: item.text
      }));
    } catch (error) {
      console.error('Transcript fetch error:', error);
      throw new Error('Failed to fetch transcript from YouTube');
    }
  },

  // 전체 과정을 통합한 메서드
  async extractTranscript(youtubeUrl: string): Promise<{
    segments: TranscriptSegment[];
  }> {
    const videoId = this.extractVideoId(youtubeUrl);
    if (!videoId) {
      throw new Error('Invalid YouTube URL');
    }
    console.log("videoId", videoId)
    const segments = await this.getTranscript(videoId);

    return {
      segments
    };
  }  
};