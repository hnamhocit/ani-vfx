import { Check, Play } from "lucide-react";
import Link from "next/link";
import { EpisodeProgressBar } from "@/components/shared/EpisodeProgressBar";
import { useUserStore } from "@/store/useUserStore";

export interface DetailEpisodeItem {
  id: number;
  title?: string;
  filler?: boolean;
}

export function DetailEpisodeLinks({
  animeId,
  visibleEpisodes,
  episodeViewMode,
}: {
  animeId: number;
  visibleEpisodes: DetailEpisodeItem[];
  episodeViewMode: "grid" | "list";
}) {
  const isWatched = useUserStore((s) => s.isWatched);
  const getProgress = useUserStore((s) => s.getProgress);
  return episodeViewMode === "grid" ? (
    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 sm:gap-2.5 p-1 -mx-1 max-h-[400px] overflow-y-auto no-scrollbar">
      {visibleEpisodes.map((ep) => {
        const watched = isWatched(animeId, ep.id);
        const epProg = getProgress(animeId, ep.id);

        return (
          <Link
            key={ep.id}
            href={`/anime/${animeId}/watch?ep=${ep.id}`}
            title={
              ep.title && ep.title !== `Episode ${ep.id}`
                ? `Tập ${ep.id}: ${ep.title}`
                : `Tập ${ep.id}`
            }
            className={`group relative flex flex-col items-center justify-center min-h-[44px] px-2 py-2 rounded-xl border transition-all duration-150 cursor-pointer select-none active:scale-95 ${
              watched
                ? "bg-[#181a28] text-emerald-400 border-emerald-500/35 hover:border-purple-400"
                : "bg-[#151724] hover:bg-[#1f2235] border-purple-500/20 hover:border-purple-400 text-zinc-100 hover:shadow-md hover:shadow-purple-600/20"
            }`}
          >
            <div className="flex items-center justify-center gap-1">
              {watched ? (
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              ) : (
                <Play className="w-3 h-3 text-purple-400 group-hover:text-white fill-current shrink-0 opacity-75 group-hover:opacity-100" />
              )}
              <span className="font-heading font-black text-xs sm:text-sm">
                {ep.id}
              </span>
            </div>

            {epProg && (
              <EpisodeProgressBar
                percentage={epProg.percentage}
                watched={watched}
                className="w-full mt-1.5"
              />
            )}
          </Link>
        );
      })}
    </div>
  ) : (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 p-1 -mx-1 max-h-[420px] overflow-y-auto no-scrollbar">
      {visibleEpisodes.map((ep) => {
        const watched = isWatched(animeId, ep.id);
        const epProg = getProgress(animeId, ep.id);
        const subTitle =
          ep.title &&
          ep.title !== `Episode ${ep.id}` &&
          ep.title !== `Tập ${ep.id}`
            ? ep.title
            : "Tập phim chính";

        return (
          <Link
            key={ep.id}
            href={`/anime/${animeId}/watch?ep=${ep.id}`}
            className={`group flex items-center justify-between px-3 py-2.5 rounded-xl border cursor-pointer transition-all active:scale-98 text-left ${
              watched
                ? "bg-[#181a28] text-zinc-300 border-emerald-500/30 hover:border-purple-400"
                : "bg-[#151724] hover:bg-[#1f2235] border-purple-500/20 hover:border-purple-400 text-zinc-100"
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0 pr-2">
              <span
                className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs shrink-0 font-heading transition-colors ${
                  watched
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-purple-500/20 text-purple-200 group-hover:bg-[#7950f2] group-hover:text-white"
                }`}
              >
                {watched ? <Check className="w-3.5 h-3.5" /> : ep.id}
              </span>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-bold text-white truncate group-hover:text-purple-300 transition-colors">
                  Tập {ep.id}
                  {subTitle !== "Tập phim chính" ? ` — ${subTitle}` : ""}
                </p>
                {epProg && (
                  <EpisodeProgressBar
                    percentage={epProg.percentage}
                    watched={watched}
                    className="w-24 mt-1"
                  />
                )}
              </div>
            </div>
            <Play className="w-3.5 h-3.5 text-purple-400 group-hover:text-white fill-current shrink-0" />
          </Link>
        );
      })}
    </div>
  );
}
