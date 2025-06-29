import type { YouTubeVideoData } from '@shared/schema';
import { google } from 'googleapis';

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

  // 비디오 정보 가져오기
  async getVideoInfo(videoId: string): Promise<VideoInfo> {
    
    const response = await fetch(`https://asia-northeast3-youtubecrawling-463910.cloudfunctions.net/youtubecrawling?videoId=${videoId}`);
    const data = await response.json();
    return data;
  },

  // 상세한 YouTube 비디오 정보 가져오기 (YouTube Data API v3 사용)
  async getDetailedVideoInfo(videoId: string): Promise<YouTubeVideoData> {
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      throw new Error('YOUTUBE_API_KEY가 설정되지 않았습니다. 환경 변수를 확인해주세요.');
    }
    try {
      const youtube = google.youtube({
        version: 'v3',
        auth: apiKey,
      });

      // 비디오 정보 가져오기
      const response = await youtube.videos.list({
        part: ['snippet', 'statistics', 'contentDetails', 'status'],
        id: [videoId],
      });

      if (!response.data.items || response.data.items.length === 0) {
        throw new Error('비디오를 찾을 수 없습니다.');
      }

      const video = response.data.items[0];
      const snippet = video.snippet!;
      const statistics = video.statistics!;
      const contentDetails = video.contentDetails!;

      // ISO 8601 duration을 초로 변환
      const duration = this.parseISO8601Duration(contentDetails.duration || 'PT0S');

      // YouTube Data API에서 제공하는 썸네일 정보
      const thumbnails = snippet.thumbnails || {};
      const thumbnailUrl = thumbnails.maxres?.url || 
                          thumbnails.high?.url || 
                          thumbnails.medium?.url || 
                          thumbnails.default?.url || 
                          `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

      // 채널 정보 추가로 가져오기 (채널 ID가 필요한 경우)
      let channelInfo = null;
      if (snippet.channelId) {
        try {
          const channelResponse = await youtube.channels.list({
            part: ['snippet'],
            id: [snippet.channelId],
          });
          channelInfo = channelResponse.data.items?.[0]?.snippet;
        } catch (error) {
          console.warn('채널 정보를 가져오는데 실패했습니다:', error);
        }
      }
      console.log("snippet", snippet);

      const videoData: YouTubeVideoData = {
        title: snippet.title || '제목 없음',
        description: snippet.description || '',
        duration: duration,
        duration_string: this.formatDuration(duration),
        view_count: parseInt(statistics.viewCount || '0'),
        like_count: parseInt(statistics.likeCount || '0'),
        upload_date: snippet.publishedAt ? snippet.publishedAt.split('T')[0].replace(/-/g, '') : '',
        uploader: snippet.channelTitle || '채널 없음',
        uploader_id: snippet.channelId || '',
        channel: snippet.channelTitle || '채널 없음',
        channel_id: snippet.channelId || '',
        thumbnail: thumbnailUrl,
        thumbnails: Object.values(thumbnails),
        webpage_url: `https://www.youtube.com/watch?v=${videoId}`,
        video_id: videoId,
        categories: snippet.categoryId ? [snippet.categoryId] : [],
        tags: snippet.tags || [],
        age_limit: 0, // YouTube Data API에서 직접 제공하지 않음
        availability: 'public', // 기본값
        language: snippet.defaultAudioLanguage || snippet.defaultLanguage || 'en',
        live_status: contentDetails.duration ? 'not_live' : 'was_live', // 간접적으로 추정
        // 다음 필드들은 YouTube Data API에서 제공하지 않으므로 기본값 설정
        resolution: 'unknown',
        fps: 0,
        vcodec: 'unknown',
        acodec: 'unknown',
        filesize: 0,
        format: 'unknown',
        ext: 'unknown',
      };

      return videoData;

    } catch (error: any) {
      console.error('YouTube Data API 오류:', error);
      if (error.message.includes('quotaExceeded')) {
        throw new Error('YouTube API 할당량이 초과되었습니다. 나중에 다시 시도해주세요.');
      } else if (error.message.includes('keyInvalid')) {
        throw new Error('YouTube API 키가 유효하지 않습니다.');
      } else {
        throw new Error(`YouTube 비디오 정보를 가져오는데 실패했습니다: ${error.message}`);
      }
    }
  },

  // 지속 시간 문자열을 초로 변환하는 유틸리티 함수
  parseDuration(durationString: string): number {
    if (!durationString) return 0;
    
    // "HH:MM:SS" 또는 "MM:SS" 형태의 문자열을 초로 변환
    const parts = durationString.split(':').map(Number);
    
    if (parts.length === 3) {
      // HH:MM:SS
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else if (parts.length === 2) {
      // MM:SS
      return parts[0] * 60 + parts[1];
    } else if (parts.length === 1) {
      // SS
      return parts[0];
    }
    
    return 0;
  },

  // ISO 8601 duration을 초로 변환하는 유틸리티 함수 (YouTube API용)
  parseISO8601Duration(duration: string): number {
    if (!duration) return 0;
    
    // PT4M13S 형태의 ISO 8601 duration을 파싱
    const regex = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/;
    const matches = duration.match(regex);
    
    if (!matches) return 0;
    
    const hours = parseInt(matches[1] || '0');
    const minutes = parseInt(matches[2] || '0');
    const seconds = parseInt(matches[3] || '0');
    
    return hours * 3600 + minutes * 60 + seconds;
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