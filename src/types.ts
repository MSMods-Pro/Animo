export interface Anime {
  id: string;
  title: string;
  image: string;
  episodeNumber?: number;
  releaseDate?: string;
  type?: string;
}

export interface AnimeDetails {
  id: string;
  title: string;
  image: string;
  description: string;
  genres: string[];
  status: string;
  totalEpisodes: number;
  releaseDate: string;
}

export interface Episode {
  id: string;
  number: number;
  title?: string;
  isFiller?: boolean;
}

export interface StreamResponse {
  results: {
    streamingLink: {
      link: {
        file: string;
      };
    }[];
  };
  tracks?: SubtitleTrack[];
}

export interface SubtitleTrack {
  file: string;
  label: string;
  kind: string;
  default?: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}
