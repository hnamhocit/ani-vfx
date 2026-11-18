import { ExpandableSynopsis } from "@/components/shared/ExpandableSynopsis";
import { useWatchStore } from "@/store/useWatchStore";

export function WatchSynopsisCard() {
  const anime = useWatchStore((s) => s.anime);

  if (!anime) return null;

  return (
    <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-[#111320] border border-purple-500/20 space-y-3">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h4 className="font-heading font-bold text-base sm:text-lg text-white">
          Nội dung anime
        </h4>
        {anime.genres && anime.genres.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {anime.genres.slice(0, 3).map((g) => (
              <span
                key={g.mal_id}
                className="text-xs font-bold px-2.5 py-1 rounded-lg bg-[#181a28] text-purple-300 border border-purple-500/30"
              >
                {g.name}
              </span>
            ))}
          </div>
        )}
      </div>

      <ExpandableSynopsis
        text={anime.synopsis || "Chưa có tóm tắt chi tiết cho bộ phim này."}
      />

      {anime.studios && anime.studios.length > 0 && (
        <div className="pt-2 text-xs text-zinc-400 border-t border-zinc-800/80">
          <span>Studio sản xuất: </span>
          <span className="text-zinc-200 font-semibold">
            {anime.studios.map((s) => s.name).join(", ")}
          </span>
        </div>
      )}
    </div>
  );
}
