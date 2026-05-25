import axios from 'axios';
import { Anime, AnimeDetails, Episode, StreamResponse } from '../types';

// Using real provided REST API base URL
const API_BASE_URL = 'https://anikotoapi.vercel.app/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const handleApiError = (error: any): never => {
  const message = error.response?.data?.message || error.message || 'An unexpected error occurred';
  console.error('[API Error]:', message);
  throw new Error(message);
};

export const animeApi = {
  getLatestEpisodes: async (): Promise<Anime[]> => {
    try {
      const response = await apiClient.get('/latest-episodes');
      const list = response.data?.data || response.data?.results || [];
      return list.map((item: any) => ({
        id: item.id,
        title: item.title || item.name,
        image: item.image || item.poster,
        episodeNumber: Number(item.episodes || item.episode) || undefined,
        type: item.type,
        sub: Number(item.sub) || undefined,
        dub: Number(item.dub) || undefined,
      }));
    } catch (error) {
      handleApiError(error);
    }
  },

  getRandomAnime: async (): Promise<AnimeDetails | null> => {
    try {
      const response = await apiClient.get('/random');
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  getCategoryAnime: async (category: string, page = 1): Promise<Anime[]> => {
    try {
      const response = await apiClient.get(`/${category}`, { params: { page } });
      const list = response.data?.data || response.data?.results || [];
      return list.map((item: any) => ({
        id: item.id,
        title: item.title || item.name,
        image: item.poster || item.image,
        type: item.type,
        sub: Number(item.sub || item.tvInfo?.sub) || undefined,
        dub: Number(item.dub || item.tvInfo?.dub) || undefined,
      }));
    } catch (error) {
      handleApiError(error);
    }
  },

  searchAnime: async (keyword: string): Promise<Anime[]> => {
    try {
      const response = await apiClient.get(`/search`, { params: { keyword } });
      const list = response.data?.data || response.data?.results || [];
      return list.map((item: any) => ({
        id: item.id,
        title: item.title,
        image: item.poster || item.image,
        type: item.tvInfo?.showType || item.type,
        sub: Number(item.tvInfo?.sub || item.sub) || undefined,
        dub: Number(item.tvInfo?.dub || item.dub) || undefined,
      }));
    } catch (error) {
      handleApiError(error);
    }
  },

  getSearchSuggestions: async (keyword: string): Promise<any> => {
    try {
      const response = await apiClient.get(`/search/suggest`, { params: { keyword } });
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  getAdvancedFilter: async (params: any): Promise<Anime[]> => {
    try {
      const response = await apiClient.get(`/filter`, { params });
      const list = response.data?.data || response.data?.results || [];
      return list.map((item: any) => ({
        id: item.id,
        title: item.title || item.name,
        image: item.poster || item.image,
        type: item.type,
        sub: Number(item.sub || item.tvInfo?.sub) || undefined,
        dub: Number(item.dub || item.tvInfo?.dub) || undefined,
      }));
    } catch (error) {
      handleApiError(error);
    }
  },

  getQtip: async (id: string): Promise<any> => {
    try {
      const response = await apiClient.get(`/qtip/${id}`);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  getProducerAnime: async (producerName: string, page = 1): Promise<Anime[]> => {
    try {
      const response = await apiClient.get(`/producer/${producerName}`, { params: { page } });
      const list = response.data?.data || response.data?.results || [];
      return list.map((item: any) => ({
        id: item.id,
        title: item.title || item.name,
        image: item.poster || item.image,
        type: item.type,
        sub: Number(item.sub) || undefined,
        dub: Number(item.dub) || undefined,
      }));
    } catch (error) {
      handleApiError(error);
    }
  },

  getAnimeInfo: async (id: string): Promise<AnimeDetails | null> => {
    try {
      const response = await apiClient.get(`/info`, { params: { id } });
      // API format: { success: true, data: { ... } }
      const data = response.data?.data || response.data?.results?.data;
      if (!data) return null;

      const formatAnimeList = (list: any[]) => {
        if (!list || !Array.isArray(list)) return [];
        return list.map(item => ({
          id: item.id || item.animeId,
          title: item.title || item.name,
          image: item.poster || item.image || item.cover,
          type: item.type,
          sub: Number(item.sub || item.episodes?.sub) || undefined,
          dub: Number(item.dub || item.episodes?.dub) || undefined,
        }));
      };

      return {
        id: data.id,
        title: data.title,
        image: data.poster || '',
        description: data.description || data.animeInfo?.Overview || 'No description available for this anime.',
        genres: data.genres || data.animeInfo?.Genres?.map((g: any) => typeof g === 'string' ? g : g?.name || '') || [],
        status: data.status?.[0] || data.animeInfo?.Status || 'Unknown',
        totalEpisodes: Number(data.episodes?.[0] || data.animeInfo?.Episodes) || 0,
        releaseDate: data.premiered?.[0] || data.animeInfo?.Aired || '',
        recommendations: formatAnimeList(data.recommendations || data.recommended || []),
        related: formatAnimeList(data.related || [])
      };
    } catch (error) {
      handleApiError(error);
    }
  },

  getEpisodes: async (id: string): Promise<Episode[]> => {
    try {
      const response = await apiClient.get(`/episodes/${id}`);
      let epList: any[] = response.data?.data || [];
      const results = response.data?.results;
      
      if (!epList.length && results) {
        if (Array.isArray(results.episodes)) {
          epList = results.episodes;
        } else if (Array.isArray(results) && (results as any).episodes) {
          epList = (results as any).episodes;
        } else if (Array.isArray(results) && results.length > 0 && results[0].episodes) {
          epList = results[0].episodes;
        } else if (Array.isArray(results)) {
          epList = results;
        }
      }

      return epList.map((ep: any) => ({
        id: String(ep.slug || ep.num || ep.id),
        number: Number(ep.num) || Number(ep.episode_no) || Number(ep.number) || 0,
        title: ep.title || ep.japanese_title || `Episode ${ep.num || ep.episode_no || ep.number || 'Unknown'}`,
        isFiller: ep.isFiller || false,
      }));
    } catch (error) {
      handleApiError(error);
    }
  },

  getStreamLink: async (animeId: string, epId: string, server = 'hd-1', type = 'sub'): Promise<StreamResponse | null> => {
    try {
      const response = await apiClient.get(`/stream`, { 
        params: { id: animeId, ep: epId, server, type } 
      });
      
      const data = response.data?.data;
      if (!data || !data.m3u8) return null;
      
      return {
        results: {
          streamingLink: [{
            link: {
              file: data.m3u8
            }
          }]
        },
        tracks: data.subtitles || [],
        referer: data.referer,
        intro: data.intro,
        outro: data.outro
      };
    } catch (error) {
      handleApiError(error);
    }
  },

  getStreamFallbackLink: async (animeId: string, epId: string, server = 'hd-1', type = 'sub'): Promise<StreamResponse | null> => {
    try {
      const response = await apiClient.get(`/stream/fallback`, { 
        params: { id: animeId, ep: epId, server, type } 
      });
      
      const data = response.data?.data;
      if (!data || !data.m3u8) return null;
      
      return {
        results: {
          streamingLink: [{
            link: {
              file: data.m3u8
            }
          }]
        },
        tracks: data.subtitles || [],
        referer: data.referer,
        intro: data.intro,
        outro: data.outro
      };
    } catch (error) {
      handleApiError(error);
    }
  },

  getServers: async (episodeId: string): Promise<any> => {
    try {
      const response = await apiClient.get(`/servers/${episodeId}`);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  getCharacters: async (animeId: string): Promise<any> => {
    try {
      const response = await apiClient.get(`/character/list/${animeId}`);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  getCharacterDetails: async (characterId: string): Promise<any> => {
    try {
      const response = await apiClient.get(`/character/${characterId}`);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  getVoiceActorDetails: async (actorId: string): Promise<any> => {
    try {
      const response = await apiClient.get(`/actors/${actorId}`);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  getScheduleByDate: async (date: string): Promise<any> => {
    // date format: YYYY-MM-DD
    try {
      const response = await apiClient.get(`/schedule`, { params: { date } });
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  getScheduleForAnime: async (animeId: string): Promise<any> => {
    try {
      const response = await apiClient.get(`/schedule/${animeId}`);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  }
};
