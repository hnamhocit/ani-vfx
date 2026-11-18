import { ChevronLeft, Clock, Film, Layers, Play, Sparkles } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { useAnimeApp } from "@/context/AnimeAppContext";
import { resolveFranchiseSeasons } from "@/services/franchises";
import { useDetailStore } from "@/store/useDetailStore";

interface DetailUpcomingScreenProps {
  onSearchFocus: () => void;
  onSelectCategory: (cat: "now" | "popular" | "upcoming") => void;
}

export function DetailUpcomingScreen({
  onSearchFocus,
  onSelectCategory,
}: DetailUpcomingScreenProps) {
  const { openTrailerModal } = useAnimeApp();
  const animeId = useDetailStore((s) => s.animeId);
  const anime = useDetailStore((s) => s.anime);
  const relations = useDetailStore((s) => s.relations);

  const seasonList = useMemo(() => {
    if (!anime || !animeId) return [];
    return resolveFranchiseSeasons(
      animeId,
      anime.title_english || anime.title,
      relations,
    );
  }, [anime, animeId, relations]);

  if (!anime || !animeId) return null;

  const displayTitle = anime.title_english || anime.title;
  const prevSeasons = seasonList.filter((s) => !s.isCurrent && !s.unreleased);

  return (
    <div className="min-h-screen bg-[#0b0c10] text-zinc-100 flex flex-col font-sans">
      <Navbar
        onSearchFocus={onSearchFocus}
        onSelectCategory={onSelectCategory}
      />

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-10 space-y-6 sm:space-y-10">
        <div className="flex items-center gap-1.5 text-xs sm:text-sm text-zinc-400">
          <Link
            href="/"
            className="hover:text-purple-300 transition-colors flex items-center gap-1 shrink-0"
          >
            <ChevronLeft className="w-4 h-4" />
            Trang chủ
          </Link>
          <span>/</span>
          <span className="text-zinc-200 font-medium truncate">
            {displayTitle}
          </span>
        </div>

        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-b from-purple-950/40 via-[#121422] to-[#0b0c10] border border-purple-500/30 p-5 sm:p-10 md:p-16 text-center space-y-5 sm:space-y-6 shadow-2xl">
          <div className="w-16 h-16 sm:w-24 sm:h-24 mx-auto rounded-2xl sm:rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-xl shadow-amber-500/10">
            <Clock className="w-8 h-8 sm:w-12 sm:h-12 animate-pulse" />
          </div>

          <div className="space-y-2.5 sm:space-y-3 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-xs sm:text-sm font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span>Season này chưa ra mắt • Sắp khởi chiếu</span>
            </div>
            <h1 className="font-heading text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-normal leading-tight">
              {displayTitle}
            </h1>
            {anime.title_japanese && (
              <p className="text-sm sm:text-lg text-purple-300/80 font-medium">
                {anime.title_japanese}
              </p>
            )}
            <p className="text-xs sm:text-base text-zinc-400 leading-relaxed pt-1">
              {anime.synopsis ||
                "Phần phim này hiện đang trong giai đoạn sản xuất hoặc chưa có lịch phát sóng chính thức từ nhà sản xuất. Ảnh bìa chính thức, trailer và danh sách tập phim sẽ được cập nhật ngay khi được phát hành."}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 pt-2">
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
                className="inline-flex items-center justify-center gap-2 px-5 py-3 sm:px-7 sm:py-3.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm sm:text-base shadow-xl shadow-purple-600/30 transition cursor-pointer"
              >
                <Film className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Phát Trailer chính thức</span>
              </button>
            )}

            {prevSeasons.length > 0 && (
              <Link
                href={`/anime/${prevSeasons[prevSeasons.length - 1].mal_id}`}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 sm:px-7 sm:py-3.5 rounded-xl sm:rounded-2xl bg-[#1e2238] hover:bg-[#282d4a] text-purple-200 border border-purple-500/30 font-bold text-sm sm:text-base transition shadow-md"
              >
                <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current shrink-0" />
                <span className="truncate">
                  Xem phần trước ({prevSeasons[prevSeasons.length - 1].title})
                </span>
              </Link>
            )}

            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 sm:px-6 sm:py-3.5 rounded-xl sm:rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 font-bold text-sm sm:text-base transition"
            >
              <span>Quay lại Khám phá</span>
            </Link>
          </div>
        </div>

        {seasonList.length > 0 && (
          <section className="space-y-4 bg-[#12141c]/90 border border-purple-500/20 p-4 sm:p-7 rounded-2xl sm:rounded-3xl shadow-xl backdrop-blur-md">
            <div className="flex items-center gap-3 border-b border-zinc-800 pb-3.5">
              <div className="p-2 sm:p-2.5 rounded-xl bg-purple-950/80 border border-purple-500/40 text-purple-400 shrink-0">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-heading text-base sm:text-2xl font-black text-white">
                  Các phần phim & Mùa liên quan ({seasonList.length})
                </h2>
                <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
                  Chọn các phần phim đã phát sóng để xem ngay
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar pt-1">
              {seasonList.map((season) => {
                const isCurrent = season.mal_id === animeId;
                const isUnreleased = Boolean(season.unreleased);

                if (isUnreleased && !isCurrent) {
                  return (
                    <div
                      key={season.mal_id}
                      className="flex flex-col justify-between p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border bg-zinc-900/40 border-zinc-800 text-zinc-500 opacity-60 cursor-not-allowed shrink-0 min-w-[190px] sm:min-w-[230px] max-w-[260px]"
                      title="Season này chưa ra mắt"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-400">
                          {season.relationType}
                        </span>
                        <span className="text-[10px] font-extrabold text-amber-400/80 bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-500/30">
                          Chưa ra mắt
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm font-semibold text-zinc-400 line-clamp-2 mt-2 leading-snug">
                        {season.title}
                      </p>
                    </div>
                  );
                }

                return (
                  <Link
                    key={season.mal_id}
                    href={isCurrent ? "#" : `/anime/${season.mal_id}`}
                    className={`flex flex-col justify-between p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border transition-all shrink-0 min-w-[190px] sm:min-w-[230px] max-w-[260px] ${isCurrent
                        ? "bg-purple-950/80 border-purple-400 ring-2 ring-purple-400/50 text-white shadow-lg shadow-purple-600/30"
                        : "bg-[#181a28] hover:bg-[#222538] border-purple-500/20 text-zinc-300 hover:text-white hover:border-purple-400/60"
                      }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        {season.relationType}
                      </span>
                      {isCurrent && (
                        <span className="text-[10px] font-extrabold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-500/40">
                          Chưa ra mắt
                        </span>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm font-bold text-white line-clamp-2 mt-2 leading-snug">
                      {season.title}
                    </p>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
