import type { EpisodeProgress } from "@/store/useUserStore";

export function getWatchAction(
  animeId: number,
  latest: { episode: number; progress: EpisodeProgress } | null,
  releasedEpisodes?: number | null,
) {
  let episode = latest?.episode ?? 1;
  let label = "Xem ngay";

  if (latest) {
    if (latest.progress.completed || latest.progress.percentage >= 85) {
      if (releasedEpisodes != null && episode < releasedEpisodes) {
        episode += 1;
        label = `Xem tập tiếp theo · Tập ${episode}`;
      } else {
        label = `Xem lại Tập ${episode}`;
      }
    } else {
      label = `Xem tiếp Tập ${episode}`;
    }
  }

  return { href: `/anime/${animeId}/watch?ep=${episode}`, label };
}
