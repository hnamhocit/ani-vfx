import {
  Bookmark,
  Check,
  Clock,
  Heart,
  Share2,
  Star,
  Users,
} from "lucide-react";
import { useAnimeApp } from "@/context/AnimeAppContext";
import { useWatchStore } from "@/store/useWatchStore";

export function WatchInfoHeader() {
  const { toggleBookmark, isBookmarked } = useAnimeApp();

  const anime = useWatchStore((s) => s.anime);
  const episodes = useWatchStore((s) => s.episodes);
  const currentEpisode = useWatchStore((s) => s.currentEpisode);
  const liked = useWatchStore((s) => s.liked);
  const likeCount = useWatchStore((s) => s.likeCount);
  const copied = useWatchStore((s) => s.copied);

  const toggleLike = useWatchStore((s) => s.toggleLike);
  const shareCurrentUrl = useWatchStore((s) => s.shareCurrentUrl);

  if (!anime) return null;

  const displayTitle = anime.title_english || anime.title;
  const bookmarked = isBookmarked(anime.mal_id);
  const isUpcoming =
    anime.status === "Not yet aired" ||
    (episodes.length === 0 && (!anime.episodes || anime.episodes === 0));
  const totalEpisodes = isUpcoming
    ? 0
    : episodes.length || anime.episodes || 0;
  const currentEpisodeData =
    episodes.find((e) => e.mal_id === currentEpisode) || null;

  return (
    <div className="space-y-4 pt-1">
      <div>
        {isUpcoming || totalEpisodes === 0 ? (
          <>
            <h1 className="font-heading text-xl sm:text-3xl md:text-4xl font-black text-white tracking-normal">
              {displayTitle}
            </h1>
            <p className="text-xs sm:text-base text-amber-300 font-semibold mt-1 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Chưa phát sóng chính thức • Sắp khởi chiếu</span>
            </p>
          </>
        ) : (
          <>
            <h1 className="font-heading text-xl sm:text-3xl md:text-4xl font-black text-white tracking-normal">
              {displayTitle} - Tập {currentEpisode}
            </h1>
            {currentEpisodeData?.title &&
              currentEpisodeData.title !== `Episode ${currentEpisode}` && (
                <p className="text-sm sm:text-lg text-purple-300 font-semibold mt-1">
                  {currentEpisodeData.title}
                </p>
              )}
          </>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-zinc-800">
        <div className="flex items-center gap-3 sm:gap-4 flex-wrap text-xs sm:text-sm text-zinc-400 font-medium">
          {anime.score && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg bg-amber-400/10 border border-amber-400/30 text-amber-300 font-bold">
              <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-amber-400" />
              <span>{anime.score.toFixed(2)} MAL</span>
            </div>
          )}
          <span className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-zinc-500" />
            <span>
              {anime.members?.toLocaleString() || anime.popularity} lượt theo dõi
            </span>
          </span>
          {anime.year && <span>Năm {anime.year}</span>}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={toggleLike}
            className={`flex items-center gap-1.5 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold border transition cursor-pointer active:scale-95 ${liked
                ? "bg-rose-950/70 border-rose-500/60 text-rose-300 shadow-lg shadow-rose-600/20"
                : "bg-[#1a1d2e] hover:bg-[#252a42] border-purple-500/20 text-zinc-200"
              }`}
          >
            <Heart
              className={`w-4 h-4 transition-transform ${liked ? "fill-rose-500 text-rose-500 scale-110" : ""
                }`}
            />
            <span>{likeCount.toLocaleString()}</span>
          </button>

          <button
            type="button"
            onClick={() => toggleBookmark(anime)}
            className={`flex items-center gap-1.5 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold border transition cursor-pointer active:scale-95 ${bookmarked
                ? "bg-indigo-950/70 border-indigo-500/60 text-indigo-300"
                : "bg-[#1a1d2e] hover:bg-[#252a42] border-purple-500/20 text-zinc-200"
              }`}
          >
            {bookmarked ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Đã lưu phim</span>
              </>
            ) : (
              <>
                <Bookmark className="w-4 h-4 text-purple-400" />
                <span>Lưu phim</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={shareCurrentUrl}
            className="flex items-center gap-1.5 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[#1a1d2e] hover:bg-[#252a42] border border-purple-500/20 text-zinc-200 transition cursor-pointer active:scale-95"
            title="Sao chép liên kết xem phim"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400">Đã copy!</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4 text-purple-400" />
                <span>Chia sẻ</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
