// Stream Source Resolver with AniList metadata scoring to avoid wrong specials/parodies
import { type NextRequest, NextResponse } from "next/server";
import type { StreamResponse, StreamServer } from "@/types/stream";
import { getReleasedEpisodeCount } from "@/utils/anime";
import { type AnimeMeta, fetchAnimeMeta } from "./anime-metadata";
import { getConsumetStreams } from "./consumet";
import { getPhimApiStreams } from "./phimapi";
import { buildSearchCandidates } from "./search-candidates";
import { resolveSplitRelease } from "./split-release";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const anilistIdStr = searchParams.get("anilistId");
  const titleParam = searchParams.get("title") || "";
  const englishTitleParam = searchParams.get("englishTitle") || "";
  const episode = Math.max(
    1,
    parseInt(searchParams.get("episode") || "1", 10) || 1,
  );

  let candidates: string[] = [];
  let meta: AnimeMeta | null = null;

  if (anilistIdStr) {
    const anilistId = parseInt(anilistIdStr, 10);
    if (!Number.isNaN(anilistId)) {
      meta = await fetchAnimeMeta(anilistId);
      if (!meta) {
        return NextResponse.json<StreamResponse>({
          success: false,
          episode,
          servers: [],
          message: "Chưa xác minh được thông tin phần phim. Vui lòng thử lại.",
        });
      }
      candidates = buildSearchCandidates(meta);
    }
  }

  if (candidates.length === 0) {
    if (!titleParam && !englishTitleParam) {
      return NextResponse.json<StreamResponse>(
        {
          success: false,
          episode,
          servers: [],
          message:
            "Thiếu anilistId hoặc tiêu đề phim để tìm kiếm nguồn stream.",
        },
        { status: 400 },
      );
    }

    meta = {
      romaji: titleParam || null,
      english: englishTitleParam || null,
      native: null,
      episodes: null,
      format: null,
      seasonYear: null,
    };
    candidates = buildSearchCandidates(meta);
  }

  if (!meta) return NextResponse.json({ success: false, episode, servers: [] });

  const episodeLimit = getReleasedEpisodeCount(meta) ?? meta.episodes;
  if (episodeLimit != null && episode > episodeLimit) {
    console.warn("[stream] Episode is outside the selected release", {
      id: meta.id,
      episode,
      episodeLimit,
    });
    return NextResponse.json<StreamResponse>({
      success: false,
      episode,
      servers: [],
      message: `Tập ${episode} không thuộc phần phim này hoặc chưa phát hành.`,
    });
  }

  const split = await resolveSplitRelease(meta);
  const [phimResult, consumetServers] = await Promise.all([
    getPhimApiStreams(candidates, episode, meta, split),
    getConsumetStreams(
      candidates[0] || titleParam || englishTitleParam,
      episode,
      meta,
    ),
  ]);

  const allServers: StreamServer[] = [];
  if (phimResult?.servers) allServers.push(...phimResult.servers);
  if (consumetServers.length > 0) allServers.push(...consumetServers);

  if (allServers.length === 0) {
    return NextResponse.json<StreamResponse>({
      success: false,
      animeName: phimResult?.animeName || candidates[0] || titleParam,
      episode,
      servers: [],
      message: `Chưa tìm thấy nguồn stream trực tiếp cho Tập ${episode}.`,
    });
  }

  return NextResponse.json<StreamResponse>({
    success: true,
    animeName: phimResult?.animeName || candidates[0] || titleParam,
    episode,
    servers: allServers,
  });
}
