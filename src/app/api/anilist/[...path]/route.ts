import { type NextRequest, NextResponse } from "next/server";
import { queryAniList } from "./graphql";
import {
  getCharacters,
  getFull,
  getRecommendations,
  getVideos,
} from "./media-details";
import { getEpisodes } from "./media-episodes";
import { handleMediaList } from "./media-list";
import { getRelations } from "./media-relations";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  const targetPath = path.join("/");
  const searchParams = req.nextUrl.searchParams;

  try {
    if (targetPath === "genres/anime") {
      const data = await queryAniList<{ GenreCollection: string[] }>(
        `query { GenreCollection }`,
      );
      const genres = (data?.GenreCollection || []).filter(
        (g) => g !== "Hentai",
      );
      return NextResponse.json({ data: genres });
    }

    if (
      ["anime", "top/anime", "seasons/now", "schedules"].includes(targetPath)
    ) {
      return await handleMediaList(targetPath, searchParams);
    }

    const fullMatch = targetPath.match(/^anime\/(\d+)\/full$/);
    if (fullMatch) {
      return await getFull(Number(fullMatch[1]));
    }

    const videosMatch = targetPath.match(/^anime\/(\d+)\/videos$/);
    if (videosMatch) {
      return await getVideos(Number(videosMatch[1]));
    }

    const epMatch = targetPath.match(/^anime\/(\d+)\/episodes$/);
    if (epMatch) {
      return await getEpisodes(Number(epMatch[1]));
    }

    const charMatch = targetPath.match(/^anime\/(\d+)\/characters$/);
    if (charMatch) {
      return await getCharacters(Number(charMatch[1]));
    }

    const recMatch = targetPath.match(/^anime\/(\d+)\/recommendations$/);
    if (recMatch) {
      return await getRecommendations(Number(recMatch[1]));
    }

    const relMatch = targetPath.match(/^anime\/(\d+)\/relations$/);
    if (relMatch) {
      return await getRelations(Number(relMatch[1]));
    }

    return NextResponse.json({ error: "Not found" }, { status: 404 });
  } catch (err) {
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "AniList upstream error",
      },
      { status: 502 },
    );
  }
}
