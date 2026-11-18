/**
 * Stream Source Resolver Service
 * Nhận AniList Media.id + episode → tìm nguồn stream từ PhimAPI & Consumet.
 * KHÔNG fallback. Lỗi → trả success: false với message rõ ràng.
 */

import type { StreamResponse } from "@/types/stream";

/**
 * Fetch streaming sources for a specific anime episode.
 * Ưu tiên dùng anilistId để search chính xác hơn title string.
 */
export async function fetchEpisodeStream(params: {
  anilistId: number;
  episode: number;
  /** Fallback title nếu anilistId không resolve được */
  title?: string;
  englishTitle?: string | null;
}): Promise<StreamResponse> {
  const searchParams = new URLSearchParams();
  searchParams.set("anilistId", params.anilistId.toString());
  searchParams.set("episode", params.episode.toString());

  if (params.title) searchParams.set("title", params.title);
  if (params.englishTitle) searchParams.set("englishTitle", params.englishTitle);

  try {
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
  } catch {
    return {
      success: false,
      episode: params.episode,
      servers: [],
      message: "Không có kết nối mạng. Vui lòng kiểm tra lại.",
    };
  }
}
