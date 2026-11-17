import type { StreamResponse } from "@/types/anime";

/**
 * Fetch streaming sources for a specific anime episode
 */
export async function fetchEpisodeStream(params: {
  title: string;
  englishTitle?: string | null;
  episode: number;
  malId?: number;
}): Promise<StreamResponse> {
  const searchParams = new URLSearchParams();
  searchParams.set("title", params.title);
  if (params.englishTitle) {
    searchParams.set("englishTitle", params.englishTitle);
  }
  searchParams.set("episode", params.episode.toString());
  if (params.malId) {
    searchParams.set("malId", params.malId.toString());
  }

  const res = await fetch(`/api/stream?${searchParams.toString()}`);
  if (!res.ok) {
    return {
      success: false,
      episode: params.episode,
      servers: [],
      message: "Không thể kết nối đến máy chủ phát video.",
    };
  }
  return res.json();
}
