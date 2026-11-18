import {
  Award,
  Bookmark,
  Check,
  ChevronLeft,
  Clock,
  ExternalLink,
  Film,
  Play,
  Sparkles,
  Star,
  Tv,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useAnimeApp } from "@/context/AnimeAppContext";
import { useDetailStore } from "@/store/useDetailStore";
import { ExpandableSynopsis } from "../shared/ExpandableSynopsis";

function getStatusBadge(status: string | null) {
  if (!status) return null;
  const lower = status.toLowerCase();
  if (lower.includes("currently airing") || lower.includes("airing")) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full text-xs sm:text-sm font-bold bg-emerald-950/70 text-emerald-300 border border-emerald-500/40 shadow-sm">
        <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-emerald-400 animate-pulse" />
        Đang phát sóng
      </span>
    );
  }
  if (lower.includes("finished")) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full text-xs sm:text-sm font-bold bg-indigo-950/70 text-indigo-300 border border-indigo-500/40">
        Đã hoàn thành
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full text-xs sm:text-sm font-bold bg-amber-950/70 text-amber-300 border border-amber-500/40">
      Sắp khởi chiếu
    </span>
  );
}

export function DetailHeroSection() {
  const { isBookmarked, toggleBookmark, openTrailerModal } = useAnimeApp();
  const animeId = useDetailStore((s) => s.animeId);
  const anime = useDetailStore((s) => s.anime);

  if (!anime || !animeId) return null;

  const bookmarked = isBookmarked(anime.mal_id);
  const displayTitle = anime.title_english || anime.title;

  const poster =
    anime.images.webp?.large_image_url ||
    anime.images.jpg?.large_image_url ||
    anime.images.jpg?.image_url;

  const backdropImage =
    anime.trailer?.images?.maximum_image_url ||
    anime.trailer?.images?.large_image_url ||
    poster;

  return (
    <section className="relative w-full overflow-hidden border-b border-purple-500/10 pt-5 sm:pt-10 md:pt-14 pb-8 sm:pb-14">
      <div className="absolute inset-0 h-[460px] sm:h-[620px] md:h-[700px] pointer-events-none select-none overflow-hidden">
        <img
          src={backdropImage}
          alt={displayTitle}
          decoding="async"
          fetchPriority="high"
          loading="eager"
          className="w-full h-full object-cover filter brightness-[0.25] blur-sm scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0c10] via-[#0b0c10]/85 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0b0c10] via-transparent to-[#0b0c10]" />
      </div>

      <div className="relative z-10 max-w-7xl 2xl:max-w-[1540px] mx-auto px-4 sm:px-6 md:px-8 space-y-5 sm:space-y-7">
        <div className="flex items-center justify-between gap-2 text-xs sm:text-sm md:text-base text-zinc-300">
          <div className="flex items-center gap-1.5 sm:gap-2 font-medium min-w-0">
            <Link
              href="/"
              className="hover:text-purple-300 transition-colors flex items-center gap-1 shrink-0"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              Trang chủ
            </Link>
            <span className="shrink-0">/</span>
            <span className="text-zinc-100 font-bold truncate">
              {displayTitle}
            </span>
          </div>

          {anime.url && (
            <a
              href={anime.url}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-purple-300 hover:text-white transition-colors bg-purple-950/70 hover:bg-purple-900/80 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl border border-purple-500/40 shadow-sm"
            >
              <span>MAL</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-8 lg:gap-10 items-start">
          <div className="md:col-span-4 lg:col-span-3 flex justify-center md:justify-start">
            <div className="relative w-44 sm:w-64 md:w-full aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl shadow-black/90 border border-white/10 ring-1 ring-purple-500/20 group">
              {poster ? (
                <img
                  src={poster}
                  alt={displayTitle}
                  decoding="async"
                  fetchPriority="high"
                  loading="eager"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-zinc-900 text-zinc-400">
                  <Clock className="w-8 h-8 text-amber-400 mb-2" />
                  <span className="text-xs font-bold">Chưa có ảnh bìa</span>
                </div>
              )}
              {anime.score && (
                <div className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-lg sm:rounded-xl bg-amber-400 text-black font-black text-xs sm:text-base shadow-xl shadow-amber-400/30">
                  <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-black text-black" />
                  <span>{anime.score.toFixed(2)}</span>
                </div>
              )}
              {anime.rank && (
                <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1 px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-lg sm:rounded-xl bg-black/85 backdrop-blur-md text-amber-300 text-xs sm:text-sm font-extrabold border border-amber-500/30">
                  <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>Top #{anime.rank}</span>
                </div>
              )}
            </div>
          </div>

          <div className="md:col-span-8 lg:col-span-9 space-y-4 sm:space-y-6">
            <div className="flex items-center gap-1.5 sm:gap-2.5 flex-wrap">
              {anime.type && (
                <span className="text-xs sm:text-sm font-bold px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-lg sm:rounded-xl bg-zinc-800 text-zinc-100 border border-zinc-700 shadow-sm">
                  {anime.type}
                </span>
              )}
              {getStatusBadge(anime.status)}
              {anime.rating && (
                <span className="text-xs sm:text-sm font-semibold px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-lg sm:rounded-xl bg-zinc-900 text-zinc-200 border border-zinc-800">
                  {anime.rating}
                </span>
              )}
              {anime.season && anime.year && (
                <span className="text-xs sm:text-sm font-bold px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-lg sm:rounded-xl bg-purple-950/60 text-purple-200 border border-purple-500/40 capitalize">
                  {anime.season} {anime.year}
                </span>
              )}
              {anime.popularity && (
                <span className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl bg-indigo-950/60 text-indigo-200 border border-indigo-500/40">
                  <Users className="w-3.5 h-3.5 text-indigo-400" />
                  #{anime.popularity}
                </span>
              )}
            </div>

            <div className="space-y-1">
              <h1 className="font-heading text-xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-normal leading-[1.2] drop-shadow-md">
                {displayTitle}
              </h1>
              {anime.title_japanese &&
                anime.title_japanese !== displayTitle && (
                  <p className="text-xs sm:text-sm md:text-base text-zinc-400 sm:text-zinc-300 font-medium">
                    {anime.title_japanese}
                  </p>
                )}
            </div>

            {anime.genres && anime.genres.length > 0 && (
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                {anime.genres.map((g) => (
                  <span
                    key={g.mal_id}
                    className="text-xs sm:text-sm font-semibold px-2.5 py-1 sm:px-3 sm:py-1 rounded-lg bg-[#1a1d2e] text-purple-200 border border-purple-500/30 shadow-sm hover:border-purple-500/60 transition"
                  >
                    {g.name}
                  </span>
                ))}
              </div>
            )}

            <div className="grid grid-cols-2 sm:flex sm:items-center gap-2.5 sm:gap-3 sm:flex-wrap pt-1">
              <Link
                href={`/anime/${animeId}/watch?ep=1`}
                className="col-span-2 sm:col-span-1 flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-emerald-600 via-[#7950f2] to-[#9775fa] hover:from-emerald-500 hover:to-[#a380fc] text-white font-extrabold text-sm sm:text-base md:text-lg shadow-xl shadow-purple-600/35 hover:shadow-purple-600/50 transition-all cursor-pointer active:scale-98"
              >
                <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-white" />
                <span>Xem ngay</span>
              </Link>

              {anime.trailer?.youtube_id && (
                <button
                  type="button"
                  onClick={() =>
                    openTrailerModal(
                      displayTitle,
                      anime.trailer?.youtube_id,
                      anime.trailer?.embed_url,
                    )
                  }
                  className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3.5 rounded-xl sm:rounded-2xl bg-[#1a1d2e] hover:bg-[#252940] text-zinc-200 font-bold text-xs sm:text-base border border-purple-500/30 transition cursor-pointer active:scale-98"
                >
                  <Film className="w-4 h-4 text-purple-400" />
                  <span>Trailer</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => toggleBookmark(anime)}
                className={`${!anime.trailer?.youtube_id ? "col-span-2 sm:col-span-1" : ""
                  } flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3.5 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-base border transition-all cursor-pointer active:scale-98 ${bookmarked
                    ? "bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-600/30"
                    : "bg-[#1a1d2e] hover:bg-[#242940] text-zinc-100 border-purple-500/30 hover:border-purple-500/60"
                  }`}
              >
                {bookmarked ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    <span>Đã lưu</span>
                  </>
                ) : (
                  <>
                    <Bookmark className="w-4 h-4 text-purple-400" />
                    <span>Lưu phim</span>
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-2 sm:flex sm:items-center gap-3 sm:gap-6 sm:flex-wrap text-xs sm:text-sm md:text-base font-semibold text-zinc-200 pt-3 border-t border-zinc-800">
              {anime.episodes && (
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Tv className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>{anime.episodes} tập</span>
                </div>
              )}
              {anime.duration && (
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Clock className="w-4 h-4 text-purple-400 shrink-0" />
                  <span className="truncate">{anime.duration}</span>
                </div>
              )}
              {anime.studios && anime.studios.length > 0 && (
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="truncate">
                    Studio: {anime.studios[0].name}
                  </span>
                </div>
              )}
              {anime.source && (
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Film className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span className="truncate">Nguồn: {anime.source}</span>
                </div>
              )}
            </div>

            {anime.synopsis && (
              <div className="space-y-1.5 pt-1">
                <h3 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-purple-400">
                  Nội dung tóm tắt
                </h3>
                <ExpandableSynopsis
                  text={anime.synopsis}
                  textClassName="text-xs sm:text-base text-zinc-200 leading-relaxed font-normal"
                  buttonClassName="text-xs sm:text-base font-bold text-purple-300 hover:text-purple-200 pt-0.5"
                  expandLabel="Xem toàn bộ nội dung"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
