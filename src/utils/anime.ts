import type { Anime } from "@/types/anime";

export function isAnimeUpcoming(
  anime: Pick<Anime, "status" | "episodes"> | null,
  loadedEpisodesCount: number,
): boolean {
  if (!anime) return false;
  return (
    anime.status === "Not yet aired" ||
    (loadedEpisodesCount === 0 && (!anime.episodes || anime.episodes === 0))
  );
}
