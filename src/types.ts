export interface Anime {
  id: string;
  title: string;
  image: string;
  episodeNumber?: number;
  releaseDate?: string;
  type?: string;
  sub?: number;
  dub?: number;
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
  recommendations?: Anime[];
  related?: Anime[];
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
  referer?: string;
  intro?: { start: number; end: number };
  outro?: { start: number; end: number };
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
