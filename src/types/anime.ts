export interface JikanImages {
  jpg: {
    image_url: string;
    small_image_url: string;
    large_image_url: string;
  };
  webp: {
    image_url: string;
    small_image_url: string;
    large_image_url: string;
  };
}

export interface JikanTrailer {
  youtube_id: string | null;
  url: string | null;
  embed_url: string | null;
  images: {
    image_url: string | null;
    small_image_url: string | null;
    medium_image_url: string | null;
    large_image_url: string | null;
    maximum_image_url: string | null;
  };
}

export interface JikanNamedResource {
  mal_id: number;
  type: string;
  name: string;
  url: string;
}

export interface Anime {
  mal_id: number;
  url: string;
  images: JikanImages;
  trailer: JikanTrailer;
  approved?: boolean;
  titles?: Array<{ type: string; title: string }>;
  title: string;
  title_english: string | null;
  title_japanese: string | null;
  title_synonyms?: string[];
  type: string | null;
  source: string | null;
  episodes: number | null;
  status: string | null;
  airing: boolean;
  aired?: {
    from: string | null;
    to: string | null;
    prop?: {
      from: { day: number | null; month: number | null; year: number | null };
      to: { day: number | null; month: number | null; year: number | null };
    };
    string: string | null;
  };
  duration?: string | null;
  rating?: string | null;
  score: number | null;
  scored_by: number | null;
  rank: number | null;
  popularity: number | null;
  members: number | null;
  favorites: number | null;
  synopsis: string | null;
  background?: string | null;
  season?: string | null;
  year?: number | null;
  broadcast?: {
    day: string | null;
    time: string | null;
    timezone: string | null;
    string: string | null;
  };
  producers?: JikanNamedResource[];
  licensors?: JikanNamedResource[];
  studios?: JikanNamedResource[];
  genres: JikanNamedResource[];
  explicit_genres?: JikanNamedResource[];
  themes?: JikanNamedResource[];
  demographics?: JikanNamedResource[];
}

export interface JikanPagination {
  last_visible_page: number;
  has_next_page: boolean;
  current_page: number;
  items: {
    count: number;
    total: number;
    per_page: number;
  };
}

export interface JikanResponse<T> {
  data: T;
  pagination?: JikanPagination;
}

export interface AnimeVideoPromo {
  title: string;
  trailer: JikanTrailer;
}

export interface AnimeVideoEpisode {
  mal_id: number;
  url: string;
  title: string;
  episode: string;
  images: {
    image_url: string;
  };
}

export interface AnimeMusicVideo {
  title: string;
  video: {
    youtube_id: string | null;
    url: string | null;
    embed_url: string | null;
    images: {
      image_url: string | null;
    };
  };
  meta: {
    title: string | null;
    author: string | null;
  };
}

export interface AnimeVideosData {
  promo: AnimeVideoPromo[];
  episodes: AnimeVideoEpisode[];
  music_videos: AnimeMusicVideo[];
}

export interface AnimeEpisode {
  mal_id: number;
  url: string;
  title: string;
  title_japanese: string | null;
  title_romanji: string | null;
  aired: string | null;
  score: number | null;
  filler: boolean;
  recap: boolean;
  forum_url: string | null;
}

export interface AnimeCharacterItem {
  character: {
    mal_id: number;
    url: string;
    images: {
      jpg: { image_url: string };
      webp: { image_url: string; small_image_url: string };
    };
    name: string;
  };
  role: string;
  favorites: number;
  voice_actors: Array<{
    person: {
      mal_id: number;
      url: string;
      images: {
        jpg: { image_url: string };
      };
      name: string;
    };
    language: string;
  }>;
}

export interface AnimeRecommendationItem {
  entry: {
    mal_id: number;
    url: string;
    images: JikanImages;
    title: string;
  };
  url: string;
  votes: number;
}

export interface GenreItem {
  mal_id: number;
  name: string;
  url: string;
  count: number;
}

export interface SavedAnimeItem {
  mal_id: number;
  title: string;
  title_english?: string | null;
  image_url: string;
  score?: number | null;
  type?: string | null;
  year?: number | null;
  episodes?: number | null;
  timestamp: number;
}

export interface AnimeRelationEntry {
  mal_id: number;
  type: string;
  name: string;
  url: string;
}

export interface AnimeRelationItem {
  relation: string;
  entry: AnimeRelationEntry[];
}

export interface SeasonInfo {
  mal_id: number;
  title: string;
  relationType: string;
  type?: string;
  isCurrent?: boolean;
  unreleased?: boolean;
}

export interface StreamServer {
  id: string;
  serverName: string;
  type: "iframe" | "m3u8";
  embedUrl: string;
  m3u8Url?: string;
  quality?: string;
  provider: "phimapi" | "consumet" | "custom";
}

export interface StreamResponse {
  success: boolean;
  animeName?: string;
  episode: number;
  servers: StreamServer[];
  message?: string;
}
