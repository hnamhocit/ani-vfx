"use client";

import {
  AlertCircle,
  Award,
  Bookmark,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clock,
  ExternalLink,
  Film,
  Flame,
  Layers,
  LayoutGrid,
  List,
  Play,
  Search,
  Sparkles,
  Star,
  Tv,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { SeasonGrid } from "@/components/SeasonGrid";
import { useAnimeApp } from "@/context/AnimeAppContext";
import { resolveFranchiseSeasons } from "@/services/franchises";
import { jikanApi } from "@/services/jikan";
import { useUserStore } from "@/store/useUserStore";
import type {
  Anime,
  AnimeCharacterItem,
  AnimeEpisode,
  AnimeRecommendationItem,
  AnimeRelationItem,
  SeasonInfo,
} from "@/types/anime";

interface AnimeDetailClientProps {
  id: number;
}

// Graceful Character Avatar with styled initials fallback (never broken or pixelated)
function CharacterAvatar({
  name,
  imageUrl,
  className = "w-20 h-28 sm:w-24 sm:h-32",
}: {
  name: string;
  imageUrl?: string | null;
  className?: string;
}) {
  const [hasError, setHasError] = useState(!imageUrl);

  if (!imageUrl || hasError) {
    const initials =
      name
        .split(/[\s,]+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase())
        .join("") || "NV";

    return (
      <div
        className={`${className} rounded-2xl bg-gradient-to-br from-purple-950/80 via-zinc-900 to-indigo-950/80 border border-purple-500/30 flex flex-col items-center justify-center text-purple-200 font-bold shrink-0 shadow-md select-none p-1.5 text-center`}
        title={name}
      >
        <span className="text-base sm:text-lg font-black tracking-wider">
          {initials}
        </span>
        <span className="text-xs text-zinc-400 font-medium mt-0.5">
          Nhân vật
        </span>
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={name}
      referrerPolicy="no-referrer"
      decoding="async"
      onError={() => setHasError(true)}
      className={`${className} rounded-2xl object-cover bg-zinc-800 shrink-0 border border-zinc-700/80 shadow-md`}
      loading="lazy"
    />
  );
}

// Graceful Seiyuu / Voice Actor Avatar with styled initials fallback
function VoiceActorAvatar({
  name,
  imageUrl,
  className = "w-18 h-26 sm:w-20 sm:h-28",
}: {
  name: string;
  imageUrl?: string | null;
  className?: string;
}) {
  const [hasError, setHasError] = useState(!imageUrl);

  if (!imageUrl || hasError) {
    const initials =
      name
        .split(/[\s,]+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase())
        .join("") || "VA";

    return (
      <div
        className={`${className} rounded-2xl bg-gradient-to-br from-indigo-950/80 via-zinc-900 to-purple-950/80 border border-indigo-500/30 flex flex-col items-center justify-center text-indigo-300 font-bold shrink-0 shadow-md select-none p-1.5 text-center`}
        title={name}
      >
        <span className="text-sm sm:text-base font-black tracking-wider">
          {initials}
        </span>
        <span className="text-xs text-zinc-400 font-medium mt-0.5">Seiyuu</span>
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={name}
      referrerPolicy="no-referrer"
      decoding="async"
      onError={() => setHasError(true)}
      className={`${className} rounded-2xl object-cover bg-zinc-800 shrink-0 border border-zinc-700/80 shadow-md`}
      loading="lazy"
    />
  );
}

export function AnimeDetailClient({ id }: AnimeDetailClientProps) {
  const router = useRouter();
  const { isBookmarked, toggleBookmark, addToHistory, openTrailerModal } =
    useAnimeApp();
  const { isWatched, getProgress } = useUserStore();

  const [anime, setAnime] = useState<Anime | null>(null);
  const [episodes, setEpisodes] = useState<AnimeEpisode[]>([]);
  const [characters, setCharacters] = useState<AnimeCharacterItem[]>([]);
  const [recommendations, setRecommendations] = useState<
    AnimeRecommendationItem[]
  >([]);
  const [relations, setRelations] = useState<AnimeRelationItem[]>([]);

  // Episodes pagination & controls
  const [episodePage, setEpisodePage] = useState(1);
  const [totalEpisodePages, setTotalEpisodePages] = useState(1);
  const [totalEpisodesCount, setTotalEpisodesCount] = useState(0);
  const [episodeViewMode, setEpisodeViewMode] = useState<"grid" | "list">(
    "grid",
  );
  const [episodeSearch, setEpisodeSearch] = useState("");

  // Synopsis expand/collapse
  const [isSynopsisExpanded, setIsSynopsisExpanded] = useState(false);
  const synopsisRef = useRef<HTMLParagraphElement>(null);
  const [canExpandSynopsis, setCanExpandSynopsis] = useState(false);

  useEffect(() => {
    const el = synopsisRef.current;
    if (!el || !anime?.synopsis) return;
    if (!isSynopsisExpanded) {
      setCanExpandSynopsis(
        el.scrollHeight > el.clientHeight + 4 && anime.synopsis.length > 320,
      );
    }
  }, [anime?.synopsis, isSynopsisExpanded]);

  // Loading & error
  const [isLoading, setIsLoading] = useState(true);
  const [episodesLoading, setEpisodesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasAddedToHistoryRef = useRef(false);

  // Load anime details, characters, recommendations
  useEffect(() => {
    let isMounted = true;
    hasAddedToHistoryRef.current = false;
    setIsLoading(true);
    setError(null);

    Promise.allSettled([
      jikanApi.getAnimeFull(id),
      jikanApi.getAnimeCharacters(id),
      jikanApi.getAnimeRecommendations(id),
      jikanApi.getAnimeRelations(id),
    ])
      .then(([animeRes, charsRes, recsRes, relsRes]) => {
        if (!isMounted) return;

        if (animeRes.status === "fulfilled" && animeRes.value.data) {
          const animeData = animeRes.value.data;
          setAnime(animeData);

          // Add to history once per id
          if (!hasAddedToHistoryRef.current) {
            hasAddedToHistoryRef.current = true;
            addToHistory(animeData);
          }
        } else {
          setError("Không tìm thấy thông tin anime này.");
        }

        if (charsRes.status === "fulfilled" && charsRes.value.data) {
          setCharacters(charsRes.value.data);
        }

        if (recsRes.status === "fulfilled" && recsRes.value.data) {
          setRecommendations(recsRes.value.data);
        }

        if (relsRes.status === "fulfilled" && relsRes.value.data) {
          setRelations(relsRes.value.data);
        }

        setIsLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error("Failed to load anime details:", err);
        setError("Lỗi khi tải thông tin anime. Vui lòng thử lại.");
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id, addToHistory]);

  // Load episodes when page changes
  useEffect(() => {
    let isMounted = true;
    setEpisodesLoading(true);

    jikanApi
      .getAnimeEpisodes(id, episodePage)
      .then((res) => {
        if (!isMounted) return;
        setEpisodes(res.data || []);
        if (res.pagination) {
          setTotalEpisodePages(res.pagination.last_visible_page || 1);
          setTotalEpisodesCount(res.pagination.items?.total || res.data.length);
        }
        setEpisodesLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error("Failed to load episodes:", err);
        setEpisodesLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id, episodePage]);

  // Filtered episodes based on search
  const filteredEpisodes = useMemo(() => {
    if (!episodeSearch.trim()) return episodes;
    const query = episodeSearch.toLowerCase().trim();
    return episodes.filter((ep) => {
      const matchesNumber = ep.mal_id.toString().includes(query);
      const matchesTitle = ep.title.toLowerCase().includes(query);
      return matchesNumber || matchesTitle;
    });
  }, [episodes, episodeSearch]);

  // Compute full related seasons list (guaranteed that older seasons are never removed)
  const seasonList: SeasonInfo[] = useMemo(() => {
    if (!anime) return [];
    return resolveFranchiseSeasons(
      id,
      anime.title_english || anime.title,
      relations,
    );
  }, [anime, id, relations]);

  const handleNavbarSearch = () => {
    router.push("/#search");
  };

  const handleNavbarCategory = (cat: "now" | "popular" | "upcoming") => {
    router.push(`/?category=${cat}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0b0c10] text-zinc-100 flex flex-col">
        <Navbar
          onSearchFocus={handleNavbarSearch}
          onSelectCategory={handleNavbarCategory}
        />
        <main className="flex-1 max-w-7xl 2xl:max-w-[1540px] mx-auto w-full px-4 sm:px-6 md:px-8 py-8 space-y-8 animate-pulse">
          <div className="w-full aspect-[16/7] max-h-[380px] bg-zinc-900 rounded-3xl" />
          <div className="max-w-5xl mx-auto w-full aspect-video bg-zinc-900/80 rounded-2xl" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <div className="h-10 bg-zinc-800 rounded-xl w-2/3" />
              <div className="h-32 bg-zinc-800/60 rounded-xl" />
              <div className="h-48 bg-zinc-800/40 rounded-xl" />
            </div>
            <div className="space-y-4">
              <div className="h-64 bg-zinc-800/50 rounded-2xl" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !anime) {
    return (
      <div className="min-h-screen bg-[#0b0c10] text-zinc-100 flex flex-col">
        <Navbar
          onSearchFocus={handleNavbarSearch}
          onSelectCategory={handleNavbarCategory}
        />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md w-full p-8 rounded-3xl bg-zinc-900/70 border border-zinc-800 text-center space-y-5 shadow-2xl backdrop-blur-xl">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-red-950/40 border border-red-500/30 flex items-center justify-center text-red-400">
              <AlertCircle className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-2">
                Không tìm thấy thông tin
              </h2>
              <p className="text-sm text-zinc-400 leading-relaxed">
                {error || "Anime không tồn tại trên hệ thống hoặc đã bị gỡ bỏ."}
              </p>
            </div>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-purple-600/30"
            >
              <ChevronLeft className="w-4 h-4" />
              Quay lại Khám phá
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const bookmarked = isBookmarked(anime.mal_id);
  const displayTitle = anime.title_english || anime.title;
  const isUpcoming =
    anime.status === "Not yet aired" ||
    (episodes.length === 0 && (!anime.episodes || anime.episodes === 0));

  // If anime is upcoming / unreleased, render dedicated "Season này chưa ra mắt" screen
  if (isUpcoming) {
    const prevSeasons = seasonList.filter((s) => !s.isCurrent && !s.unreleased);

    return (
      <div className="min-h-screen bg-[#0b0c10] text-zinc-100 flex flex-col font-sans">
        <Navbar
          onSearchFocus={handleNavbarSearch}
          onSelectCategory={handleNavbarCategory}
        />

        <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-10 space-y-10">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <Link
              href="/"
              className="hover:text-purple-300 transition-colors flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              Trang chủ
            </Link>
            <span>/</span>
            <span className="text-zinc-200 font-medium">{displayTitle}</span>
          </div>

          {/* Dedicated "Season này chưa ra mắt" Card */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-purple-950/40 via-[#121422] to-[#0b0c10] border border-purple-500/30 p-8 sm:p-12 md:p-16 text-center space-y-6 shadow-2xl">
            <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-xl shadow-amber-500/10">
              <Clock className="w-10 h-10 sm:w-12 sm:h-12 animate-pulse" />
            </div>

            <div className="space-y-3 max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                <Sparkles className="w-4 h-4" />
                <span>Season này chưa ra mắt • Sắp khởi chiếu</span>
              </div>
              <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-normal leading-tight">
                {displayTitle}
              </h1>
              {anime.title_japanese && (
                <p className="text-base sm:text-lg text-purple-300/80 font-medium">
                  {anime.title_japanese}
                </p>
              )}
              <p className="text-sm sm:text-base text-zinc-400 leading-relaxed pt-2">
                {anime.synopsis ||
                  "Phần phim này hiện đang trong giai đoạn sản xuất hoặc chưa có lịch phát sóng chính thức từ nhà sản xuất. Ảnh bìa chính thức, trailer và danh sách tập phim sẽ được cập nhật ngay khi được phát hành."}
              </p>
            </div>

            {/* Quick Action CTAs */}
            <div className="flex items-center justify-center gap-4 flex-wrap pt-4">
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
                  className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-base shadow-xl shadow-purple-600/30 transition cursor-pointer"
                >
                  <Film className="w-5 h-5" />
                  <span>Phát Trailer chính thức</span>
                </button>
              )}

              {prevSeasons.length > 0 && (
                <Link
                  href={`/anime/${prevSeasons[prevSeasons.length - 1].mal_id}`}
                  className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl bg-[#1e2238] hover:bg-[#282d4a] text-purple-200 border border-purple-500/30 font-bold text-base transition shadow-md"
                >
                  <Play className="w-5 h-5 fill-current" />
                  <span>
                    Xem phần trước ({prevSeasons[prevSeasons.length - 1].title})
                  </span>
                </Link>
              )}

              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 font-bold text-base transition"
              >
                <span>Quay lại Khám phá</span>
              </Link>
            </div>
          </div>

          {/* Season Switcher Box */}
          {seasonList.length > 0 && (
            <section className="space-y-4 bg-[#12141c]/90 border border-purple-500/20 p-6 sm:p-7 rounded-3xl shadow-xl backdrop-blur-md">
              <div className="flex items-center justify-between gap-3 border-b border-zinc-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-purple-950/80 border border-purple-500/40 text-purple-400">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-heading text-xl sm:text-2xl font-black text-white">
                      Các phần phim & Mùa liên quan ({seasonList.length})
                    </h2>
                    <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
                      Chọn các phần phim đã phát sóng để xem ngay
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3.5 overflow-x-auto pb-2 no-scrollbar pt-1">
                {seasonList.map((season) => {
                  const isCurrent = season.mal_id === id;
                  const isUnreleased = Boolean(season.unreleased);

                  if (isUnreleased && !isCurrent) {
                    return (
                      <div
                        key={season.mal_id}
                        className="flex flex-col justify-between p-4 rounded-2xl border bg-zinc-900/40 border-zinc-800 text-zinc-500 opacity-60 cursor-not-allowed shrink-0 min-w-[220px] max-w-[280px]"
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
                        <p className="text-sm font-semibold text-zinc-400 line-clamp-2 mt-2.5 leading-snug">
                          {season.title}
                        </p>
                      </div>
                    );
                  }

                  return (
                    <Link
                      key={season.mal_id}
                      href={isCurrent ? "#" : `/anime/${season.mal_id}`}
                      className={`flex flex-col justify-between p-4 rounded-2xl border transition-all shrink-0 min-w-[220px] max-w-[280px] ${
                        isCurrent
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
                      <p className="text-sm font-bold text-white line-clamp-2 mt-2.5 leading-snug">
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

  const poster =
    anime.images.webp?.large_image_url ||
    anime.images.jpg?.large_image_url ||
    anime.images.jpg?.image_url;

  const backdropImage =
    anime.trailer?.images?.maximum_image_url ||
    anime.trailer?.images?.large_image_url ||
    poster;

  // Translate status badge to Vietnamese
  const getStatusBadge = (status: string | null) => {
    if (!status) return null;
    const lower = status.toLowerCase();
    if (lower.includes("currently airing") || lower.includes("airing")) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-bold bg-emerald-950/70 text-emerald-300 border border-emerald-500/40 shadow-sm">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          Đang phát sóng
        </span>
      );
    }
    if (lower.includes("finished")) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-bold bg-indigo-950/70 text-indigo-300 border border-indigo-500/40">
          Đã hoàn thành
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-bold bg-amber-950/70 text-amber-300 border border-amber-500/40">
        Sắp khởi chiếu
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[#0b0c10] text-zinc-100 flex flex-col font-sans">
      {/* Sticky Global Navigation */}
      <Navbar
        onSearchFocus={handleNavbarSearch}
        onSelectCategory={handleNavbarCategory}
      />

      <main className="flex-1 w-full pb-16 space-y-12">
        {/* ============================================================== */}
        {/* 1. CINEMATIC HERO BACKDROP & HEADER DETAILS                   */}
        {/* ============================================================== */}
        <section className="relative w-full overflow-hidden border-b border-purple-500/10 pt-8 sm:pt-12 md:pt-14 pb-12 sm:pb-16">
          {/* Atmospheric Background Image with Gradient Overlay */}
          <div className="absolute inset-0 h-[540px] sm:h-[640px] md:h-[700px] pointer-events-none select-none overflow-hidden">
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

          <div className="relative z-10 max-w-7xl 2xl:max-w-[1540px] mx-auto px-4 sm:px-6 md:px-8 space-y-7">
            {/* Breadcrumb Navigation */}
            <div className="flex items-center justify-between flex-wrap gap-2 text-base text-zinc-300">
              <div className="flex items-center gap-2 font-medium">
                <Link
                  href="/"
                  className="hover:text-purple-300 transition-colors flex items-center gap-1"
                >
                  <ChevronLeft className="w-5 h-5" />
                  Trang chủ
                </Link>
                <span>/</span>
                <span className="text-zinc-500">Khám phá</span>
                <span>/</span>
                <span className="text-zinc-100 font-bold truncate max-w-[200px] sm:max-w-xs">
                  {displayTitle}
                </span>
              </div>

              {anime.url && (
                <a
                  href={anime.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm sm:text-base font-bold text-purple-300 hover:text-white transition-colors bg-purple-950/70 hover:bg-purple-900/80 px-5 py-2.5 rounded-xl border border-purple-500/40 shadow-sm"
                >
                  <span>MyAnimeList</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>

            {/* Main Header Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-10 items-start pt-2">
              {/* Left Column: Big Poster */}
              <div className="md:col-span-4 lg:col-span-3 flex justify-center md:justify-start">
                <div className="relative w-64 sm:w-72 md:w-full aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl shadow-black/90 border border-white/10 ring-1 ring-purple-500/20 group">
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
                    <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-zinc-900 text-zinc-400">
                      <Clock className="w-10 h-10 text-amber-400 mb-2" />
                      <span className="text-xs font-bold">Chưa có ảnh bìa</span>
                    </div>
                  )}
                  {anime.score && (
                    <div className="absolute top-3 right-3 flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-400 text-black font-black text-base shadow-xl shadow-amber-400/30">
                      <Star className="w-4 h-4 fill-black text-black" />
                      <span>{anime.score.toFixed(2)}</span>
                    </div>
                  )}
                  {anime.rank && (
                    <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-black/85 backdrop-blur-md text-amber-300 text-sm font-extrabold border border-amber-500/30">
                      <Award className="w-4 h-4" />
                      <span>Top #{anime.rank}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Title, Metadata, CTAs, Synopsis */}
              <div className="md:col-span-8 lg:col-span-9 space-y-6">
                {/* Status and Type Badges */}
                <div className="flex items-center gap-3 flex-wrap">
                  {anime.type && (
                    <span className="text-sm sm:text-base font-bold px-4 py-2 rounded-xl bg-zinc-800 text-zinc-100 border border-zinc-700 shadow-sm">
                      {anime.type}
                    </span>
                  )}
                  {getStatusBadge(anime.status)}
                  {anime.rating && (
                    <span className="text-sm sm:text-base font-semibold px-4 py-2 rounded-xl bg-zinc-900 text-zinc-200 border border-zinc-800">
                      {anime.rating}
                    </span>
                  )}
                  {anime.season && anime.year && (
                    <span className="text-sm sm:text-base font-bold px-4 py-2 rounded-xl bg-purple-950/60 text-purple-200 border border-purple-500/40 capitalize">
                      {anime.season} {anime.year}
                    </span>
                  )}
                  {anime.popularity && (
                    <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold px-3 py-1.5 rounded-xl bg-indigo-950/60 text-indigo-200 border border-indigo-500/40">
                      <Users className="w-3.5 h-3.5 text-indigo-400" />
                      Độ phổ biến #{anime.popularity}
                    </span>
                  )}
                </div>

                {/* Anime Title */}
                <div className="space-y-1.5">
                  <h1 className="font-heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-normal leading-[1.2] drop-shadow-md">
                    {displayTitle}
                  </h1>
                  {anime.title_japanese &&
                    anime.title_japanese !== displayTitle && (
                      <p className="text-xs sm:text-sm md:text-base text-zinc-300 font-medium tracking-normal">
                        {anime.title_japanese}
                      </p>
                    )}
                </div>

                {/* Genres Pills */}
                {anime.genres && anime.genres.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap pt-1">
                    {anime.genres.map((g) => (
                      <span
                        key={g.mal_id}
                        className="text-xs sm:text-sm font-semibold px-3 py-1 rounded-lg bg-[#1a1d2e] text-purple-200 border border-purple-500/30 shadow-sm hover:border-purple-500/60 transition"
                      >
                        {g.name}
                      </span>
                    ))}
                  </div>
                )}

                {/* Action Bar CTAs */}
                <div className="flex items-center gap-3 flex-wrap pt-2">
                  {isUpcoming ? (
                    <div className="flex items-center gap-3 flex-wrap">
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
                          className="flex items-center gap-2.5 px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-sm sm:text-base md:text-lg shadow-xl shadow-purple-600/35 hover:scale-102 active:scale-98 transition-all cursor-pointer"
                        >
                          <Film className="w-5 h-5" />
                          <span>Phát Trailer</span>
                        </button>
                      )}

                      <div className="flex items-center gap-2 px-4 py-3 rounded-xl sm:rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold text-xs sm:text-sm">
                        <Clock className="w-4 h-4 text-amber-400" />
                        <span>Chưa phát sóng chính thức</span>
                      </div>

                      {seasonList.filter((s) => !s.isCurrent).length > 0 && (
                        <Link
                          href={`/anime/${seasonList.find((s) => !s.isCurrent)?.mal_id}`}
                          className="flex items-center gap-2 px-6 py-4 rounded-2xl bg-[#1a1d2e] hover:bg-[#252a42] border border-purple-500/30 text-purple-200 font-bold text-base transition"
                        >
                          <Play className="w-4 h-4 fill-current" />
                          <span>
                            Xem phần trước (
                            {seasonList.find((s) => !s.isCurrent)?.title})
                          </span>
                        </Link>
                      )}
                    </div>
                  ) : (
                    <>
                      <Link
                        href={`/anime/${id}/watch?ep=1`}
                        className="flex items-center gap-2.5 px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-emerald-600 via-[#7950f2] to-[#9775fa] hover:from-emerald-500 hover:to-[#a380fc] text-white font-extrabold text-sm sm:text-base md:text-lg shadow-xl shadow-purple-600/35 hover:shadow-purple-600/50 hover:scale-102 active:scale-98 transition-all cursor-pointer"
                      >
                        <Play className="w-5 h-5 fill-white" />
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
                          className="flex items-center gap-2 px-5 sm:px-6 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl bg-[#1a1d2e] hover:bg-[#252940] text-zinc-200 font-bold text-sm sm:text-base border border-purple-500/30 transition cursor-pointer"
                        >
                          <Film className="w-4 h-4 text-purple-400" />
                          <span>Trailer</span>
                        </button>
                      )}
                    </>
                  )}

                  <button
                    onClick={() => toggleBookmark(anime)}
                    className={`flex items-center gap-2 px-5 sm:px-6 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base border transition-all cursor-pointer active:scale-98 ${
                      bookmarked
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

                {/* Quick Info Chips */}
                <div className="flex items-center gap-4 sm:gap-6 flex-wrap text-xs sm:text-sm md:text-base font-semibold text-zinc-200 pt-3 border-t border-zinc-800">
                  {anime.episodes && (
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <Tv className="w-4 h-4 text-purple-400" />
                      <span>{anime.episodes} tập</span>
                    </div>
                  )}
                  {anime.duration && (
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <Clock className="w-4 h-4 text-purple-400" />
                      <span>{anime.duration}</span>
                    </div>
                  )}
                  {anime.studios && anime.studios.length > 0 && (
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>Studio: {anime.studios[0].name}</span>
                    </div>
                  )}
                  {anime.source && (
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <Film className="w-4 h-4 text-indigo-400" />
                      <span>Nguồn: {anime.source}</span>
                    </div>
                  )}
                </div>

                {/* Synopsis with Expand/Collapse */}
                {anime.synopsis && (
                  <div className="space-y-2 pt-1">
                    <h3 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-purple-400">
                      Nội dung tóm tắt
                    </h3>
                    <p
                      ref={synopsisRef}
                      className={`text-sm sm:text-base text-zinc-200 leading-relaxed font-normal ${
                        !isSynopsisExpanded && canExpandSynopsis
                          ? "line-clamp-3"
                          : ""
                      }`}
                    >
                      {anime.synopsis}
                    </p>
                    {canExpandSynopsis && (
                      <button
                        onClick={() =>
                          setIsSynopsisExpanded(!isSynopsisExpanded)
                        }
                        className="inline-flex items-center gap-1.5 text-base font-bold text-purple-300 hover:text-purple-200 transition-colors pt-1 cursor-pointer"
                      >
                        {isSynopsisExpanded ? (
                          <>
                            <span>Thu gọn</span>
                            <ChevronUp className="w-4 h-4" />
                          </>
                        ) : (
                          <>
                            <span>Xem toàn bộ nội dung</span>
                            <ChevronDown className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Outer Container for Body Content (Constrained for ultrawide & 4K displays) */}
        <div className="max-w-7xl 2xl:max-w-[1540px] mx-auto w-full px-4 sm:px-6 md:px-8 space-y-12">
          {/* ============================================================== */}
          {/* SEASONS & RELATED ANIME SECTION                                */}
          {/* ============================================================== */}
          <SeasonGrid
            seasonList={seasonList}
            currentAnimeId={id}
            mode="detail"
          />

          {/* ============================================================== */}
          {/* EPISODES LIST & DETAILS                                        */}
          {/* ============================================================== */}
          <section className="space-y-5 bg-[#12141c]/90 border border-purple-500/20 p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl shadow-xl backdrop-blur-md">
            {/* Header: Title, Total Count, Search & View Switcher */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 sm:p-2.5 rounded-xl bg-purple-950/80 border border-purple-500/50 text-purple-400">
                  <Tv className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-heading text-lg sm:text-xl md:text-2xl font-black text-white">
                      Danh sách tập phim
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-purple-950 text-purple-300 border border-purple-500/30">
                      {isUpcoming
                        ? "Chưa khởi chiếu"
                        : `${totalEpisodesCount || episodes.length} tập`}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-zinc-300 mt-0.5">
                    {isUpcoming
                      ? "Thông tin các tập phim sẽ được cập nhật khi có thông báo chính thức"
                      : "Tổng hợp danh sách các tập chính thức và ngoại truyện từ MyAnimeList"}
                  </p>
                </div>
              </div>

              {/* Search & Grid/List View Switch */}
              {!isUpcoming && episodes.length > 0 && (
                <div className="flex items-center gap-3">
                  <div className="relative flex-1 sm:w-64">
                    <Search className="w-5 h-5 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={episodeSearch}
                      onChange={(e) => setEpisodeSearch(e.target.value)}
                      placeholder="Tìm số tập (VD: 1, 2)..."
                      className="w-full bg-[#1a1d2e] border border-purple-500/30 rounded-xl pl-11 pr-4 py-2.5 text-base text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-purple-400 transition"
                    />
                  </div>

                  <div className="flex items-center bg-[#1a1d2e] border border-purple-500/30 rounded-xl p-1">
                    <button
                      type="button"
                      onClick={() => setEpisodeViewMode("grid")}
                      className={`p-2.5 rounded-lg transition cursor-pointer ${
                        episodeViewMode === "grid"
                          ? "bg-[#7950f2] text-white shadow-sm"
                          : "text-zinc-400 hover:text-white"
                      }`}
                      title="Chế độ Lưới"
                    >
                      <LayoutGrid className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEpisodeViewMode("list")}
                      className={`p-2.5 rounded-lg transition cursor-pointer ${
                        episodeViewMode === "list"
                          ? "bg-[#7950f2] text-white shadow-sm"
                          : "text-zinc-400 hover:text-white"
                      }`}
                      title="Chế độ Danh sách"
                    >
                      <List className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Episode Cards / Tiles */}
            {episodesLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5 pt-2">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-24 bg-zinc-900/80 rounded-xl animate-pulse border border-zinc-800"
                  />
                ))}
              </div>
            ) : isUpcoming || filteredEpisodes.length === 0 ? (
              <div className="p-10 sm:p-14 text-center bg-[#151724]/70 rounded-2xl border border-purple-500/20 space-y-4">
                <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Clock className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl sm:text-2xl font-bold text-white font-heading">
                    {isUpcoming
                      ? "Phần phim này hiện chưa có tập phát sóng"
                      : "Không tìm thấy tập nào"}
                  </h3>
                  <p className="text-sm text-zinc-400 max-w-lg mx-auto leading-relaxed">
                    {isUpcoming
                      ? "Phim đang trong quá trình sản xuất hoặc chưa có lịch khởi chiếu chính thức từ nhà sản xuất. Quý khán giả có thể xem các mùa trước trong mục Các phần phim & Mùa liên quan bên dưới."
                      : "Không tìm thấy tập phim nào phù hợp với từ khóa tìm kiếm của bạn."}
                  </p>
                </div>
                {seasonList.filter((s) => !s.isCurrent).length > 0 && (
                  <div className="pt-2 flex items-center justify-center gap-3 flex-wrap">
                    {seasonList
                      .filter((s) => !s.isCurrent)
                      .map((s) => (
                        <Link
                          key={s.mal_id}
                          href={`/anime/${s.mal_id}`}
                          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-950/60 hover:bg-purple-900/60 border border-purple-500/40 text-purple-200 text-sm font-bold transition shadow-sm"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>
                            {s.title} ({s.relationType})
                          </span>
                        </Link>
                      ))}
                  </div>
                )}
              </div>
            ) : episodeViewMode === "grid" ? (
              /* GRID MODE: Clean, Minimalist - Direct link to watch page with Watched Indicators */
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5 pt-2">
                {filteredEpisodes.map((ep) => {
                  const watched = isWatched(id, ep.mal_id);
                  const epProg = getProgress(id, ep.mal_id);
                  return (
                    <Link
                      key={ep.mal_id}
                      href={`/anime/${id}/watch?ep=${ep.mal_id}`}
                      className={`group relative flex flex-col justify-center p-3.5 sm:p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer select-none active:scale-97 text-left overflow-hidden ${
                        watched
                          ? "bg-[#181a28] text-zinc-300 border-emerald-500/30 hover:border-purple-400"
                          : "bg-[#151724] hover:bg-[#1f2235] border-purple-500/25 hover:border-purple-400 text-zinc-100 hover:shadow-lg hover:shadow-purple-600/20"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 w-full">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                              watched
                                ? "bg-emerald-500/20 text-emerald-400"
                                : "bg-purple-500/20 text-purple-300 group-hover:bg-[#7950f2] group-hover:text-white"
                            }`}
                          >
                            {watched ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                            )}
                          </span>
                          <span className="font-heading font-black text-base sm:text-lg text-white truncate">
                            Tập {ep.mal_id}
                          </span>
                        </div>

                        {ep.filler && (
                          <span className="text-[11px] font-bold text-amber-300 bg-amber-400/20 border border-amber-400/30 px-2 py-0.5 rounded-md shrink-0">
                            Ngoại truyện
                          </span>
                        )}
                      </div>

                      <p className="text-xs sm:text-sm text-zinc-400 group-hover:text-zinc-200 font-medium truncate w-full mt-2 transition-colors">
                        {ep.title && ep.title !== `Episode ${ep.mal_id}`
                          ? ep.title
                          : "Tập phim chính"}
                      </p>

                      {/* Watched progress bar indicator */}
                      {epProg && epProg.percentage > 0 && (
                        <div className="w-full bg-zinc-800 h-1 rounded-full overflow-hidden mt-2">
                          <div
                            className={`h-full transition-all ${
                              watched ? "bg-emerald-500" : "bg-purple-500"
                            }`}
                            style={{
                              width: `${Math.min(100, epProg.percentage)}%`,
                            }}
                          />
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            ) : (
              /* LIST MODE: Clean Rows - Direct link to watch page with Watched Indicators */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-2">
                {filteredEpisodes.map((ep) => {
                  const watched = isWatched(id, ep.mal_id);
                  const epProg = getProgress(id, ep.mal_id);
                  return (
                    <Link
                      key={ep.mal_id}
                      href={`/anime/${id}/watch?ep=${ep.mal_id}`}
                      className={`group flex items-center justify-between p-3.5 sm:p-4 rounded-xl border-2 cursor-pointer transition-all active:scale-98 text-left ${
                        watched
                          ? "bg-[#181a28] text-zinc-300 border-emerald-500/30 hover:border-purple-400"
                          : "bg-[#151724] hover:bg-[#1f2235] border-purple-500/25 hover:border-purple-400 text-zinc-100 hover:shadow-lg hover:shadow-purple-600/20"
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0 pr-2">
                        <span
                          className={`w-10 h-10 rounded-lg flex items-center justify-center font-black text-base shrink-0 shadow-sm font-heading transition-colors ${
                            watched
                              ? "bg-emerald-500/20 text-emerald-400"
                              : "bg-purple-500/20 text-purple-200 group-hover:bg-[#7950f2] group-hover:text-white"
                          }`}
                        >
                          {watched ? (
                            <Check className="w-4 h-4 text-emerald-400" />
                          ) : (
                            ep.mal_id
                          )}
                        </span>
                        <div className="min-w-0">
                          <p
                            className="text-sm sm:text-base font-bold text-white truncate group-hover:text-purple-300 transition-colors"
                            title={ep.title}
                          >
                            {ep.title}
                          </p>
                          {ep.filler && (
                            <span className="text-[11px] font-bold text-amber-400 mt-0.5 inline-block">
                              Tập ngoại truyện
                            </span>
                          )}
                          {epProg && epProg.percentage > 0 && (
                            <div className="w-32 bg-zinc-800 h-1 rounded-full overflow-hidden mt-1.5">
                              <div
                                className={`h-full transition-all ${
                                  watched ? "bg-emerald-500" : "bg-purple-500"
                                }`}
                                style={{
                                  width: `${Math.min(100, epProg.percentage)}%`,
                                }}
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      <span className="text-xs font-semibold text-purple-400 shrink-0 group-hover:text-purple-300 flex items-center gap-1">
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Xem ngay</span>
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}

            {/* Pagination Controls */}
            {totalEpisodePages > 1 && (
              <div className="flex items-center justify-center gap-4 pt-6 border-t border-zinc-800">
                <button
                  onClick={() => setEpisodePage((p) => Math.max(1, p - 1))}
                  disabled={episodePage <= 1}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1a1d2e] hover:bg-[#242940] border border-purple-500/30 text-base font-bold text-zinc-200 disabled:opacity-40 transition cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5" />
                  <span>Trang trước</span>
                </button>
                <span className="text-base text-zinc-200 font-bold px-3">
                  Trang {episodePage} / {totalEpisodePages}
                </span>
                <button
                  onClick={() =>
                    setEpisodePage((p) => Math.min(totalEpisodePages, p + 1))
                  }
                  disabled={episodePage >= totalEpisodePages}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1a1d2e] hover:bg-[#242940] border border-purple-500/30 text-base font-bold text-zinc-200 disabled:opacity-40 transition cursor-pointer"
                >
                  <span>Trang sau</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </section>

          {/* ============================================================== */}
          {/* 4. CHARACTERS & VOICE ACTORS (HIGH-RES / NO PIXELATION)       */}
          {/* ============================================================== */}
          {characters.length > 0 && (
            <section className="space-y-5">
              <div>
                <h2 className="font-heading text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
                  <Sparkles className="w-7 h-7 text-[#845ef7]" />
                  <span>Nhân vật chính & Diễn viên lồng tiếng (Seiyuu)</span>
                </h2>
                <p className="text-base text-zinc-300 mt-1">
                  Hình ảnh sắc nét của các nhân vật nổi bật cùng Seiyuu tiếng
                  Nhật
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {characters.slice(0, 12).map((char, idx) => {
                  const japaneseVA =
                    char.voice_actors.find(
                      (va) => va.language === "Japanese",
                    ) || char.voice_actors[0];

                  const charImg =
                    char.character.images.webp?.image_url ||
                    char.character.images.jpg?.image_url;

                  const vaImg = japaneseVA?.person.images.jpg?.image_url;

                  return (
                    <div
                      key={`${char.character.mal_id}-${idx}`}
                      className="group flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-[#12141c]/95 border border-purple-500/20 hover:border-purple-500/60 transition-all shadow-md hover:shadow-xl hover:shadow-purple-600/20"
                    >
                      {/* Character Details */}
                      <div className="flex items-center gap-3.5 min-w-0 flex-1 pr-3">
                        <CharacterAvatar
                          name={char.character.name}
                          imageUrl={charImg}
                          className="w-14 h-20 sm:w-16 sm:h-22"
                        />
                        <div className="min-w-0 flex-1">
                          <p
                            className="text-xs sm:text-sm md:text-base font-bold text-white line-clamp-2 leading-snug break-words"
                            title={char.character.name}
                          >
                            {char.character.name}
                          </p>
                          <span className="inline-block text-[11px] sm:text-xs font-semibold text-purple-300 bg-purple-950/70 border border-purple-500/30 px-2 py-0.5 rounded-md mt-1">
                            {char.role === "Main"
                              ? "Nhân vật chính"
                              : char.role}
                          </span>
                        </div>
                      </div>

                      {/* Seiyuu Details */}
                      {japaneseVA && (
                        <div className="flex items-center gap-2.5 sm:gap-3 text-right pl-2.5 sm:pl-3 min-w-0 flex-1 justify-end border-l border-zinc-800">
                          <div className="min-w-0 flex-1">
                            <p
                              className="text-xs sm:text-sm md:text-base font-bold text-zinc-100 line-clamp-2 leading-snug break-words"
                              title={japaneseVA.person.name}
                            >
                              {japaneseVA.person.name}
                            </p>
                            <span className="text-[11px] sm:text-xs font-semibold text-indigo-400 block mt-0.5 sm:mt-1">
                              {japaneseVA.language} VA
                            </span>
                          </div>
                          <VoiceActorAvatar
                            name={japaneseVA.person.name}
                            imageUrl={vaImg}
                            className="w-14 h-20 sm:w-16 sm:h-22"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* ============================================================== */}
          {/* 5. METADATA DETAILS & MAL COMMUNITY STATS                      */}
          {/* ============================================================== */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Background Story & Studios */}
            <div className="lg:col-span-2 space-y-6 bg-[#12141c]/90 border border-purple-500/20 p-6 sm:p-8 rounded-3xl shadow-xl">
              <h3 className="font-heading text-xl sm:text-2xl font-black text-white flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-purple-400" />
                <span>Thông tin chi tiết & Bối cảnh tác phẩm</span>
              </h3>

              {anime.background ? (
                <p className="text-base sm:text-lg text-zinc-200 leading-[1.8] font-sans">
                  {anime.background}
                </p>
              ) : (
                <p className="text-base text-zinc-400 italic">
                  Chưa có thông tin bối cảnh lịch sử hoặc ghi chú sản xuất bổ
                  sung.
                </p>
              )}

              {/* Studios, Source & Producers Info Grid */}
              <div className="pt-5 border-t border-zinc-800 grid grid-cols-1 sm:grid-cols-2 gap-6 text-base">
                <div>
                  <span className="text-zinc-400 font-bold block text-sm uppercase tracking-wider">
                    Studio sản xuất chính:
                  </span>
                  <div className="flex gap-2 flex-wrap mt-2">
                    {anime.studios && anime.studios.length > 0 ? (
                      anime.studios.map((s) => (
                        <span
                          key={s.mal_id}
                          className="px-4 py-1.5 rounded-xl bg-[#1a1d2e] border border-purple-500/30 text-purple-200 font-bold text-base"
                        >
                          {s.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-zinc-500">Chưa rõ</span>
                    )}
                  </div>
                </div>

                <div>
                  <span className="text-zinc-400 font-bold block text-sm uppercase tracking-wider">
                    Nguồn gốc tác phẩm (Source):
                  </span>
                  <span className="text-zinc-100 font-extrabold text-lg mt-2 block">
                    {anime.source || "Chưa rõ"}
                  </span>
                </div>
              </div>
            </div>

            {/* MyAnimeList Community Stats Card */}
            <div className="space-y-5 bg-[#12141c]/90 border border-purple-500/20 p-6 sm:p-8 rounded-3xl shadow-xl">
              <h3 className="font-heading text-xl sm:text-2xl font-black text-white flex items-center gap-3">
                <Award className="w-6 h-6 text-amber-400" />
                <span>Chỉ số MyAnimeList</span>
              </h3>

              <div className="space-y-4 text-base divide-y divide-zinc-800/80">
                <div className="flex justify-between items-center py-2.5">
                  <span className="text-zinc-400 font-medium">
                    Điểm đánh giá:
                  </span>
                  <span className="text-amber-400 font-black text-xl flex items-center gap-1.5">
                    <Star className="w-5 h-5 fill-amber-400" />
                    {anime.score ? `${anime.score} / 10` : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2.5">
                  <span className="text-zinc-400 font-medium">
                    Lượt bình chọn:
                  </span>
                  <span className="text-zinc-100 font-extrabold text-lg">
                    {anime.scored_by ? anime.scored_by.toLocaleString() : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2.5">
                  <span className="text-zinc-400 font-medium">
                    Xếp hạng toàn cầu:
                  </span>
                  <span className="text-purple-300 font-extrabold text-lg">
                    #{anime.rank || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2.5">
                  <span className="text-zinc-400 font-medium">
                    Mức độ phổ biến:
                  </span>
                  <span className="text-zinc-100 font-extrabold text-lg">
                    #{anime.popularity || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2.5">
                  <span className="text-zinc-400 font-medium">
                    Thành viên theo dõi:
                  </span>
                  <span className="text-zinc-100 font-extrabold text-lg">
                    {anime.members ? anime.members.toLocaleString() : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2.5">
                  <span className="text-zinc-400 font-medium">
                    Yêu thích nhất:
                  </span>
                  <span className="text-zinc-100 font-extrabold text-lg">
                    {anime.favorites ? anime.favorites.toLocaleString() : "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* ============================================================== */}
          {/* 6. RECOMMENDATIONS                                             */}
          {/* ============================================================== */}
          {recommendations.length > 0 && (
            <section className="space-y-5 pt-4 border-t border-purple-500/10">
              <div>
                <h2 className="font-heading text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
                  <Flame className="w-7 h-7 text-amber-500" />
                  <span>Anime tương tự đề xuất</span>
                </h2>
                <p className="text-base text-zinc-300 mt-1">
                  Được cộng đồng MyAnimeList bình chọn và gợi ý nhiều nhất
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
                {recommendations.slice(0, 12).map((rec, idx) => {
                  const recPoster =
                    rec.entry.images.webp?.large_image_url ||
                    rec.entry.images.jpg?.large_image_url ||
                    rec.entry.images.jpg?.image_url;
                  return (
                    <Link
                      key={`${rec.entry.mal_id}-${idx}`}
                      href={`/anime/${rec.entry.mal_id}`}
                      className="group flex flex-col rounded-2xl overflow-hidden bg-[#12141c] border border-purple-500/25 hover:border-purple-400 hover:ring-2 hover:ring-purple-500/40 hover:-translate-y-2 shadow-xl shadow-black/80 hover:shadow-2xl hover:shadow-purple-600/30 transition-all duration-300"
                    >
                      <div className="relative aspect-[3/4] w-full bg-zinc-950 overflow-hidden">
                        <img
                          src={recPoster}
                          alt={rec.entry.title}
                          referrerPolicy="no-referrer"
                          decoding="async"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "https://cdn.myanimelist.net/images/anime/1208/94745.jpg";
                          }}
                          className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
                          loading="lazy"
                        />
                        <div className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-xl bg-black/90 text-xs sm:text-sm font-black text-amber-300 backdrop-blur-md border border-amber-500/30 shadow-md">
                          {rec.votes} votes
                        </div>
                      </div>
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <p className="font-heading font-black text-base sm:text-lg text-white group-hover:text-purple-300 line-clamp-2 transition-colors leading-snug">
                          {rec.entry.title}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      </main>

      {/* Global Footer */}
      <Footer />
    </div>
  );
}
