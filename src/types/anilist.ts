/**
 * AniList GraphQL Types - Media, Relations & Seasons
 * Single Responsibility: Toàn bộ type liên quan đến media info và franchise navigation
 */

// ─── Enums / Union Types ────────────────────────────────────────────────
export type AniListRelationType =
  | "ADAPTATION"
  | "PREQUEL"
  | "SEQUEL"
  | "PARENT"
  | "SIDE_STORY"
  | "CHARACTER"
  | "SUMMARY"
  | "ALTERNATIVE"
  | "SPIN_OFF"
  | "OTHER"
  | "SOURCE"
  | "COMPILATION"
  | "CONTAINS";

export type AniListMediaType =
  | "TV"
  | "TV_SHORT"
  | "MOVIE"
  | "SPECIAL"
  | "OVA"
  | "ONA"
  | "MUSIC";

export type AniListMediaStatus =
  | "FINISHED"
  | "RELEASING"
  | "NOT_YET_RELEASED"
  | "CANCELLED"
  | "HIATUS";

// ─── Core Nodes ─────────────────────────────────────────────────────────
export interface AniListMediaTitle {
  romaji?: string | null;
  english?: string | null;
  native?: string | null;
}

export interface AniListFuzzyDate {
  year?: number | null;
  month?: number | null;
  day?: number | null;
}

export interface AniListRelationNode {
  id: number;
  title: AniListMediaTitle;
  type?: "ANIME" | "MANGA" | null;
  format?: AniListMediaType | null;
  status?: AniListMediaStatus | null;
  seasonYear?: number | null;
  startDate?: AniListFuzzyDate | null;
  episodes?: number | null;
  coverImage?: { medium?: string | null; large?: string | null } | null;
}

export interface AniListMediaRelations {
  edges?: Array<{
    relationType?: AniListRelationType | null;
    node: AniListRelationNode;
  }> | null;
}

// ─── Season Navigation Output ───────────────────────────────────────────
/**
 * Cấu trúc chuẩn cho thanh chuyển đổi mùa phim.
 * Dùng bởi buildAnimeSeasons() và tất cả Client components.
 * KHÔNG phụ thuộc vào bất kỳ API nào ngoài AniList.
 */
export interface AnimeSeasonItem {
  id: number;
  title: string;
  relationType: AniListRelationType;
  mediaFormat?: AniListMediaType | null;
  isCurrent?: boolean;
  unreleased?: boolean;
  year?: number | null;
  episodes?: number | null;
  coverImage?: string | null;
}

// ─── Query Input Shape ──────────────────────────────────────────────────
/** Shape tối thiểu của Media query phục vụ buildAnimeSeasons */
export interface AniListMediaForSeasons extends AniListRelationNode {
  relations: AniListMediaRelations;
  watchOrder?: number[];
}
