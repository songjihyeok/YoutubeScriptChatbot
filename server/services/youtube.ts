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
}

export const youtubeService = {
  // 비디오 ID 추출
  extractVideoId(url: string): string | null {
    const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
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