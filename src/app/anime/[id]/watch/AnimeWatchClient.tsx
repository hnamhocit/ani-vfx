"use client";

import Hls from "hls.js";
import {
  AlertCircle,
  Bookmark,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clock,
  ExternalLink,
  FastForward,
  Film,
  Heart,
  Loader2,
  Play,
  RotateCcw,
  Search,
  Share2,
  Sparkles,
  Star,
  Tv,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CustomVideoPlayer } from "@/components/CustomVideoPlayer";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { SeasonGrid } from "@/components/SeasonGrid";
import { useAnimeApp } from "@/context/AnimeAppContext";
import { resolveFranchiseSeasons } from "@/services/franchises";
import { jikanApi } from "@/services/jikan";
import { MOCK_ANIMES } from "@/services/mockData";
import { fetchEpisodeStream } from "@/services/streaming";
import { useUserStore } from "@/store/useUserStore";
import type {
  Anime,
  AnimeEpisode,
  AnimeRecommendationItem,
  AnimeRelationItem,
  SeasonInfo,
  StreamServer,
} from "@/types/anime";

interface AnimeWatchClientProps {
  id: number;
  initialEpisode?: number;
}

function formatSeconds(sec: number): string {
  if (!sec || Number.isNaN(sec)) return "00:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s < 10 ? "0" : ""}${s}`;
}

export function AnimeWatchClient({
  id,
  initialEpisode = 1,
}: AnimeWatchClientProps) {
  const { toggleBookmark, isBookmarked, addToHistory } = useAnimeApp();
  const { saveProgress, getProgress, isWatched, markWatched } = useUserStore();

  // Core Data State
  const [anime, setAnime] = useState<Anime | null>(null);
  const [episodes, setEpisodes] = useState<AnimeEpisode[]>([]);
  const [recommendations, setRecommendations] = useState<
    AnimeRecommendationItem[]
  >([]);
  const [relations, setRelations] = useState<AnimeRelationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Active Episode & Streaming State
  const [currentEpisode, setCurrentEpisode] = useState<number>(initialEpisode);
  const [streamServers, setStreamServers] = useState<StreamServer[]>([]);
  const [activeServer, setActiveServer] = useState<StreamServer | null>(null);
  const [streamLoading, setStreamLoading] = useState(false);
  const [streamError, setStreamError] = useState<string | null>(null);
  const [isTrailerMode, setIsTrailerMode] = useState(false);
  const [playerMode, setPlayerMode] = useState<"hls" | "iframe">("hls");

  // Playback Progress & Resume Prompt State
  const [showResumePrompt, setShowResumePrompt] = useState(false);
  const [resumeTime, setResumeTime] = useState(0);
  const [nextEpisodeCountdown, setNextEpisodeCountdown] = useState<
    number | null
  >(null);

  // Interactive Action States (Like, Share, Synopsis)
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [copied, setCopied] = useState(false);
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
  const [episodeSearch, setEpisodeSearch] = useState("");

  const playerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);

  // 1. Load anime data, episodes, relations and recommendations
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError(null);

    Promise.allSettled([
      jikanApi.getAnimeFull(id),
      jikanApi.getAnimeEpisodes(id),
      jikanApi.getAnimeRecommendations(id),
      jikanApi.getAnimeRelations(id),
    ]).then(([animeRes, epsRes, recsRes, relsRes]) => {
      if (!isMounted) return;

      if (animeRes.status === "fulfilled" && animeRes.value.data) {
        const animeData = animeRes.value.data;
        setAnime(animeData);
        addToHistory(animeData);

        const initialLikes =
          animeData.favorites ||
          Math.floor((animeData.score || 8.0) * 1200) ||
          1540;
        setLikeCount(initialLikes);
      } else {
        setError("Không thể tải thông tin anime này.");
      }

      if (epsRes.status === "fulfilled" && epsRes.value.data) {
        setEpisodes(epsRes.value.data);
      }

      if (recsRes.status === "fulfilled" && recsRes.value.data) {
        setRecommendations(recsRes.value.data.slice(0, 15));
      }

      if (relsRes.status === "fulfilled" && relsRes.value.data) {
        setRelations(relsRes.value.data);
      }

      setIsLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [id, addToHistory]);

  // 2. Fetch stream whenever currentEpisode or anime is ready
  useEffect(() => {
    if (!anime) return;

    // Check if anime is unreleased / has no episodes
    const isAnimeUpcoming =
      anime.status === "Not yet aired" ||
      (episodes.length === 0 && (!anime.episodes || anime.episodes === 0));

    if (isAnimeUpcoming) {
      setStreamLoading(false);
      setStreamServers([]);
      setActiveServer(null);
      if (anime.trailer?.embed_url || anime.trailer?.youtube_id) {
        setIsTrailerMode(true);
      }
      return;
    }

    let isCancelled = false;
    setStreamLoading(true);
    setStreamError(null);
    setIsTrailerMode(false);
    setNextEpisodeCountdown(null);

    // Check existing watch progress for resume
    const existingProgress = getProgress(id, currentEpisode);
    if (
      existingProgress &&
      existingProgress.currentTime > 15 &&
      !existingProgress.completed
    ) {
      setResumeTime(existingProgress.currentTime);
      setShowResumePrompt(true);
    } else {
      setShowResumePrompt(false);
      setResumeTime(0);
    }

    fetchEpisodeStream({
      title: anime.title,
      englishTitle: anime.title_english,
      episode: currentEpisode,
      malId: id,
    })
      .then((res) => {
        if (isCancelled) return;

        if (res.success && res.servers.length > 0) {
          setStreamServers(res.servers);
          const firstServer = res.servers[0];
          setActiveServer(firstServer);
          setIsTrailerMode(false);
          // Default to HLS native player if m3u8Url is present
          setPlayerMode(firstServer.m3u8Url ? "hls" : "iframe");
        } else {
          setStreamServers([]);
          setActiveServer(null);
          if (anime.trailer?.embed_url || anime.trailer?.youtube_id) {
            setIsTrailerMode(true);
          } else {
            setStreamError(
              res.message ||
                `Chưa tìm thấy máy chủ stream cho Tập ${currentEpisode}.`,
            );
          }
        }
      })
      .catch(() => {
        if (isCancelled) return;
        setStreamServers([]);
        setActiveServer(null);
        if (anime.trailer?.embed_url || anime.trailer?.youtube_id) {
          setIsTrailerMode(true);
        } else {
          setStreamError("Lỗi kết nối khi tải nguồn video trực tiếp.");
        }
      })
      .finally(() => {
        if (!isCancelled) setStreamLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [anime, currentEpisode, id, getProgress, episodes.length]);

  // 3. Initialize HLS.js for native video playback when activeServer changes
  useEffect(() => {
    if (playerMode !== "hls" || !activeServer?.m3u8Url || !videoRef.current) {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      return;
    }

    const video = videoRef.current;
    const m3u8Url = activeServer.m3u8Url;

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });
      hlsRef.current = hls;
      hls.loadSource(m3u8Url);
      hls.attachMedia(video);
      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          // If HLS fails fatally, fallback to iframe embed
          setPlayerMode("iframe");
        }
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = m3u8Url;
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [activeServer, playerMode]);

  // Handle switching episode
  const handleSelectEpisode = useCallback(
    (epNum: number) => {
      if (epNum === currentEpisode) return;
      setCurrentEpisode(epNum);
      setNextEpisodeCountdown(null);
      window.history.replaceState(null, "", `/anime/${id}/watch?ep=${epNum}`);
      playerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    },
    [currentEpisode, id],
  );

  // 4. Timer for Auto Next Episode Countdown (5s)
  useEffect(() => {
    if (nextEpisodeCountdown === null) return;

    if (nextEpisodeCountdown <= 0) {
      if (currentEpisode < (episodes.length || anime?.episodes || 24)) {
        handleSelectEpisode(currentEpisode + 1);
      }
      setNextEpisodeCountdown(null);
      return;
    }

    const timer = setTimeout(() => {
      setNextEpisodeCountdown((c) => (c !== null ? c - 1 : null));
    }, 1000);

    return () => clearTimeout(timer);
  }, [
    nextEpisodeCountdown,
    currentEpisode,
    episodes.length,
    anime?.episodes,
    handleSelectEpisode,
  ]);

  const backdropImage =
    anime?.trailer?.images?.maximum_image_url ||
    anime?.trailer?.images?.large_image_url ||
    anime?.images?.webp?.large_image_url ||
    anime?.images?.jpg?.large_image_url ||
    "";

  // Video time update event (save progress every few seconds)
  const handleVideoTimeUpdate = (currTime?: number, dur?: number) => {
    const currentTime =
      currTime !== undefined ? currTime : videoRef.current?.currentTime || 0;
    const duration = dur !== undefined ? dur : videoRef.current?.duration || 0;
    if (currentTime > 0 && duration > 0) {
      saveProgress(id, currentEpisode, currentTime, duration);
    }
  };

  // Video ended event (triggers 5s auto next countdown)
  const handleVideoEnded = () => {
    markWatched(id, currentEpisode);
    const totalEps = episodes.length || anime?.episodes || 24;
    if (currentEpisode < totalEps) {
      setNextEpisodeCountdown(5);
    }
  };

  // Play next episode immediately
  const handlePlayNextEpisode = () => {
    setNextEpisodeCountdown(null);
    const totalEps = episodes.length || anime?.episodes || 24;
    if (currentEpisode < totalEps) {
      handleSelectEpisode(currentEpisode + 1);
    }
  };

  // Jump to saved progress time
  const handleResumePlayback = () => {
    if (videoRef.current && resumeTime > 0) {
      videoRef.current.currentTime = resumeTime;
      videoRef.current.play().catch(() => {});
    }
    setShowResumePrompt(false);
  };

  // Handle like toggle
  const handleToggleLike = () => {
    setLiked((prev) => {
      const next = !prev;
      setLikeCount((c) => (next ? c + 1 : c - 1));
      return next;
    });
  };

  // Handle share link copy
  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // Format seasons list from curated franchises & graph resolution (older seasons are NEVER removed)
  const seasonList: SeasonInfo[] = useMemo(() => {
    if (!anime) return [];
    return resolveFranchiseSeasons(
      id,
      anime.title_english || anime.title,
      relations,
    );
  }, [anime, id, relations]);

  // Filter episodes for search
  const filteredEpisodes = useMemo(() => {
    if (!episodeSearch.trim()) return episodes;
    const q = episodeSearch.toLowerCase().trim();
    return episodes.filter(
      (e) =>
        e.mal_id.toString().includes(q) || e.title.toLowerCase().includes(q),
    );
  }, [episodes, episodeSearch]);

  const currentEpisodeData = useMemo(() => {
    return episodes.find((e) => e.mal_id === currentEpisode) || null;
  }, [episodes, currentEpisode]);

  const isUpcoming =
    anime?.status === "Not yet aired" ||
    (episodes.length === 0 && (!anime?.episodes || anime.episodes === 0));

  const totalEpisodes = isUpcoming
    ? 0
    : episodes.length || anime?.episodes || 0;
  const bookmarked = anime ? isBookmarked(anime.mal_id) : false;
  const displayTitle = anime?.title_english || anime?.title || "Anime";

  // Sidebar recommendations
  const sidebarAnimeList = useMemo(() => {
    if (recommendations.length > 0) {
      return recommendations.map((r) => ({
        mal_id: r.entry.mal_id,
        title: r.entry.title,
        image_url:
          r.entry.images.webp?.large_image_url ||
          r.entry.images.jpg?.large_image_url ||
          r.entry.images.jpg?.image_url,
        score: null as number | null,
        type: "TV",
      }));
    }
    return MOCK_ANIMES.filter((a) => a.mal_id !== id)
      .slice(0, 10)
      .map((a) => ({
        mal_id: a.mal_id,
        title: a.title_english || a.title,
        image_url:
          a.images.webp?.large_image_url ||
          a.images.jpg?.large_image_url ||
          a.images.jpg?.image_url,
        score: a.score,
        type: a.type || "TV",
      }));
  }, [recommendations, id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#07080c] text-zinc-100 flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center gap-4 py-20">
          <Loader2 className="w-12 h-12 text-[#7950f2] animate-spin" />
          <p className="text-zinc-400 font-semibold text-base">
            Đang tải dữ liệu phim và máy chủ stream...
          </p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !anime) {
    return (
      <div className="min-h-screen bg-[#07080c] text-zinc-100 flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center gap-4 py-20 px-4 text-center">
          <AlertCircle className="w-16 h-16 text-rose-500" />
          <h2 className="text-2xl font-black text-white">{error}</h2>
          <Link
            href="/"
            className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition"
          >
            Quay lại trang chủ
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07080c] text-zinc-100 flex flex-col font-sans">
      <Navbar />

      {/* Breadcrumb Navigation */}
      <div className="border-b border-zinc-800/80 bg-[#0c0e17]/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-[1780px] mx-auto px-4 sm:px-6 md:px-8 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-zinc-400 truncate">
            <Link
              href={`/anime/${id}`}
              className="hover:text-purple-300 flex items-center gap-1 shrink-0 font-bold text-zinc-300 transition"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Thông tin phim</span>
            </Link>
            <span>/</span>
            <span className="truncate max-w-[200px] sm:max-w-md text-zinc-300">
              {displayTitle}
            </span>
            <span>/</span>
            <span className="text-emerald-400 font-bold shrink-0">
              Tập {currentEpisode}
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href={`/anime/${id}`}
              className="text-xs font-bold px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition"
            >
              Chi tiết anime
            </Link>
          </div>
        </div>
      </div>

      {/* Main Watch Page Body: 2-Column YouTube-Style Layout */}
      <main className="flex-1 max-w-[1780px] w-full mx-auto px-4 sm:px-6 md:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ========================================================= */}
          {/* LEFT COLUMN: Main Video Player, Action Bar, Episodes (70%) */}
          {/* ========================================================= */}
          <div className="lg:col-span-8 xl:col-span-8 space-y-6">
            {/* 1. Large 16:9 Video Player Container */}
            <div
              ref={playerRef}
              className="relative w-full aspect-video rounded-3xl overflow-hidden bg-black border border-purple-500/30 shadow-2xl shadow-black/90 group"
            >
              {isUpcoming || totalEpisodes === 0 ? (
                isTrailerMode &&
                (anime.trailer?.embed_url || anime.trailer?.youtube_id) ? (
                  <CustomVideoPlayer
                    embedUrl={anime.trailer?.embed_url}
                    youtubeId={anime.trailer?.youtube_id}
                    isTrailer={true}
                    title={`Trailer: ${displayTitle}`}
                    poster={backdropImage}
                  />
                ) : (
                  <div className="relative w-full h-full flex flex-col items-center justify-center p-6 sm:p-10 text-center bg-gradient-to-b from-zinc-950 via-[#111322] to-zinc-950 text-zinc-300 space-y-5">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-purple-950/70 border border-purple-500/40 flex items-center justify-center text-purple-300 shadow-2xl shadow-purple-600/30">
                      <Clock className="w-8 h-8 sm:w-10 sm:h-10 text-amber-400 animate-pulse" />
                    </div>
                    <div className="space-y-2 max-w-lg">
                      <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Chưa phát sóng chính thức</span>
                      </div>
                      <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-white font-heading">
                        {displayTitle}
                      </h3>
                      <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                        Phần phim này hiện đang trong giai đoạn sản xuất hoặc
                        chưa có tập phim phát hành chính thức từ MyAnimeList.
                        Quý khán giả có thể xem Trailer chính thức (nếu có) hoặc
                        chọn xem các phần phim trước trong danh sách các mùa.
                      </p>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap justify-center pt-2">
                      {(anime.trailer?.embed_url ||
                        anime.trailer?.youtube_id) && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsTrailerMode(true);
                            setActiveServer(null);
                          }}
                          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-purple-600/30 transition cursor-pointer"
                        >
                          <Film className="w-4 h-4" />
                          <span>Xem Official Trailer</span>
                        </button>
                      )}
                      {seasonList.filter((s) => !s.isCurrent).length > 0 && (
                        <Link
                          href={`/anime/${seasonList.find((s) => !s.isCurrent)?.mal_id}/watch?ep=1`}
                          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1a1d2e] hover:bg-[#252a42] text-zinc-200 border border-purple-500/30 font-bold text-sm transition"
                        >
                          <ChevronLeft className="w-4 h-4" />
                          <span>
                            Xem phần trước (
                            {seasonList.find((s) => !s.isCurrent)?.title})
                          </span>
                        </Link>
                      )}
                      <Link
                        href={`/anime/${id}`}
                        className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 font-bold text-sm transition"
                      >
                        <span>Chi tiết anime</span>
                      </Link>
                    </div>
                  </div>
                )
              ) : streamLoading ? (
                <div className="absolute inset-0 z-20 bg-black/90 flex flex-col items-center justify-center gap-3">
                  <Loader2 className="w-12 h-12 text-emerald-400 animate-spin" />
                  <p className="text-emerald-300 font-bold text-base animate-pulse">
                    Đang kết nối luồng phát Tập {currentEpisode}...
                  </p>
                </div>
              ) : activeServer ? (
                playerMode === "hls" && activeServer.m3u8Url ? (
                  /* Native HTML5 Video with Full Custom Player */
                  <CustomVideoPlayer
                    src={activeServer.m3u8Url}
                    title={`Tập ${currentEpisode} - ${displayTitle}`}
                    poster={backdropImage}
                    initialTime={resumeTime}
                    onTimeUpdate={handleVideoTimeUpdate}
                    onEnded={handleVideoEnded}
                    nextEpisodeCountdown={nextEpisodeCountdown}
                    onPlayNextNow={handlePlayNextEpisode}
                    onCancelAutoNext={() => setNextEpisodeCountdown(null)}
                    resumeTime={showResumePrompt ? resumeTime : 0}
                    onResumePlay={handleResumePlayback}
                    onDismissResume={() => setShowResumePrompt(false)}
                    onErrorRetry={() => setPlayerMode("iframe")}
                  />
                ) : (
                  /* Iframe Embed Player */
                  <CustomVideoPlayer
                    embedUrl={activeServer.embedUrl}
                    title={`Tập ${currentEpisode} - ${displayTitle}`}
                    poster={backdropImage}
                    onErrorRetry={() => setPlayerMode("hls")}
                  />
                )
              ) : isTrailerMode &&
                (anime.trailer?.embed_url || anime.trailer?.youtube_id) ? (
                <CustomVideoPlayer
                  embedUrl={anime.trailer?.embed_url}
                  youtubeId={anime.trailer?.youtube_id}
                  isTrailer={true}
                  title={`Trailer: ${displayTitle}`}
                  poster={backdropImage}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-zinc-950 text-zinc-300 space-y-4">
                  <Tv className="w-14 h-14 text-zinc-600" />
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      Chưa có nguồn stream tự động cho tập này
                    </h3>
                    <p className="text-sm text-zinc-400 max-w-md mt-1">
                      {streamError ||
                        "Vui lòng thử chọn máy chủ khác hoặc tìm kiếm link Vietsub ngoài."}
                    </p>
                  </div>
                  <a
                    href={`https://www.google.com/search?q=${encodeURIComponent(
                      `${displayTitle} tập ${currentEpisode} vietsub`,
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-sm shadow-md"
                  >
                    <span>Tìm xem trên Google</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              )}

              {/* Floating Resume Playback Banner */}
              {showResumePrompt && resumeTime > 0 && (
                <div className="absolute top-4 left-4 z-30 max-w-sm p-3 sm:p-3.5 rounded-2xl bg-black/85 backdrop-blur-md border border-purple-500/50 shadow-2xl flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-purple-400" />
                      <span>
                        Bạn đã xem đến phút {formatSeconds(resumeTime)}
                      </span>
                    </p>
                    <p className="text-[11px] text-zinc-400">
                      Nhấn nút để tua tiếp tục từ đoạn dở dang
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={handleResumePlayback}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition flex items-center gap-1 cursor-pointer"
                    >
                      <FastForward className="w-3 h-3" />
                      <span>Tua đến</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowResumePrompt(false)}
                      className="p-1.5 rounded-xl text-zinc-400 hover:text-white transition cursor-pointer"
                      title="Bỏ qua"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Auto Next Episode Countdown Overlay (5s) */}
              {nextEpisodeCountdown !== null && (
                <div className="absolute inset-0 z-40 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in-95 duration-200 space-y-4 select-none">
                  <div className="relative w-20 h-20 rounded-full border-4 border-purple-500/30 flex items-center justify-center">
                    <span className="text-4xl font-black text-white font-heading animate-pulse">
                      {nextEpisodeCountdown}
                    </span>
                    <div className="absolute inset-0 rounded-full border-4 border-emerald-400 border-t-transparent animate-spin" />
                  </div>

                  <div className="space-y-1 max-w-md">
                    <h3 className="text-lg sm:text-xl font-black text-white">
                      Tập tiếp theo sẽ tự động phát sau {nextEpisodeCountdown}
                      s...
                    </h3>
                    <p className="text-xs sm:text-sm text-purple-300 font-semibold truncate">
                      {displayTitle} - Tập {currentEpisode + 1}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        handleSelectEpisode(currentEpisode + 1);
                        setNextEpisodeCountdown(null);
                      }}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 transition cursor-pointer flex items-center gap-2"
                    >
                      <Play className="w-4 h-4 fill-white" />
                      <span>Phát ngay</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setNextEpisodeCountdown(null)}
                      className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white font-semibold text-sm transition cursor-pointer"
                    >
                      Hủy tự phát
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (videoRef.current) {
                          videoRef.current.currentTime = 0;
                          videoRef.current.play().catch(() => {});
                        }
                        setNextEpisodeCountdown(null);
                      }}
                      className="px-4 py-2.5 rounded-xl bg-[#1b1e32] hover:bg-[#242940] text-purple-300 hover:text-white font-semibold text-sm transition cursor-pointer flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Xem lại</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 2. Server Switcher & Prev/Next Episode Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#111320] border border-purple-500/20 shadow-lg">
              {isUpcoming || totalEpisodes === 0 ? (
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-xs font-bold text-amber-300 bg-amber-950/60 border border-amber-500/40 px-3.5 py-2 rounded-xl flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span>Phần phim chưa phát sóng chính thức</span>
                  </span>
                  {(anime.trailer?.embed_url || anime.trailer?.youtube_id) && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsTrailerMode(true);
                        setActiveServer(null);
                      }}
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
                        isTrailerMode
                          ? "bg-[#7950f2] text-white shadow-md border border-purple-400"
                          : "bg-[#1a1d2e] hover:bg-[#252a42] text-zinc-300 border border-purple-500/20"
                      }`}
                    >
                      <Film className="w-3.5 h-3.5" />
                      <span>Xem Official Trailer</span>
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      Máy chủ:
                    </span>

                    {streamServers.length > 0 ? (
                      streamServers.map((server) => {
                        const isActive =
                          !isTrailerMode && activeServer?.id === server.id;
                        return (
                          <button
                            key={server.id}
                            type="button"
                            onClick={() => {
                              setActiveServer(server);
                              setIsTrailerMode(false);
                              if (server.m3u8Url) setPlayerMode("hls");
                            }}
                            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
                              isActive
                                ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/30 border border-emerald-400"
                                : "bg-[#1a1d2e] hover:bg-[#252a42] text-zinc-300 border border-purple-500/20"
                            }`}
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span>{server.serverName}</span>
                          </button>
                        );
                      })
                    ) : (
                      <span className="text-xs font-semibold text-amber-300 bg-amber-950/40 border border-amber-500/30 px-3 py-1.5 rounded-lg">
                        Chế độ dự phòng
                      </span>
                    )}

                    {/* Player Mode Switcher (HLS vs Iframe) if activeServer has m3u8Url */}
                    {activeServer?.m3u8Url && !isTrailerMode && (
                      <div className="flex items-center bg-[#1a1d2e] border border-purple-500/20 rounded-xl p-0.5 ml-1">
                        <button
                          type="button"
                          onClick={() => setPlayerMode("hls")}
                          className={`px-2.5 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                            playerMode === "hls"
                              ? "bg-purple-600 text-white shadow-sm"
                              : "text-zinc-400 hover:text-white"
                          }`}
                          title="Trình phát Native HLS (Hỗ trợ tua & lưu tiến độ)"
                        >
                          HLS Native
                        </button>
                        <button
                          type="button"
                          onClick={() => setPlayerMode("iframe")}
                          className={`px-2.5 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                            playerMode === "iframe"
                              ? "bg-purple-600 text-white shadow-sm"
                              : "text-zinc-400 hover:text-white"
                          }`}
                          title="Trình phát Iframe Embed"
                        >
                          Embed
                        </button>
                      </div>
                    )}

                    {/* Official Trailer Button */}
                    {(anime.trailer?.embed_url ||
                      anime.trailer?.youtube_id) && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsTrailerMode(true);
                          setActiveServer(null);
                        }}
                        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
                          isTrailerMode
                            ? "bg-[#7950f2] text-white shadow-md border border-purple-400"
                            : "bg-[#1a1d2e] hover:bg-[#252a42] text-zinc-300 border border-purple-500/20"
                        }`}
                      >
                        <Film className="w-3.5 h-3.5" />
                        <span>Trailer</span>
                      </button>
                    )}
                  </div>

                  {/* Prev / Next Episode Controls */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      disabled={currentEpisode <= 1}
                      onClick={() => handleSelectEpisode(currentEpisode - 1)}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1a1d2e] hover:bg-[#252a42] disabled:opacity-40 text-xs sm:text-sm font-bold text-zinc-200 border border-purple-500/20 transition cursor-pointer disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Tập trước</span>
                    </button>

                    <button
                      type="button"
                      disabled={currentEpisode >= totalEpisodes}
                      onClick={() => handleSelectEpisode(currentEpisode + 1)}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1a1d2e] hover:bg-[#252a42] disabled:opacity-40 text-xs sm:text-sm font-bold text-zinc-200 border border-purple-500/20 transition cursor-pointer disabled:cursor-not-allowed"
                    >
                      <span>Tập tiếp</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* 3. Title, Metadata & YouTube-Style Action Bar */}
            <div className="space-y-4 pt-1">
              <div>
                {isUpcoming || totalEpisodes === 0 ? (
                  <>
                    <h1 className="font-heading text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-normal">
                      {displayTitle}
                    </h1>
                    <p className="text-sm sm:text-base text-amber-300 font-semibold mt-1 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>Chưa phát sóng chính thức • Sắp khởi chiếu</span>
                    </p>
                  </>
                ) : (
                  <>
                    <h1 className="font-heading text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-normal">
                      {displayTitle} - Tập {currentEpisode}
                    </h1>
                    {currentEpisodeData?.title &&
                      currentEpisodeData.title !==
                        `Episode ${currentEpisode}` && (
                        <p className="text-base sm:text-lg text-purple-300 font-semibold mt-1">
                          {currentEpisodeData.title}
                        </p>
                      )}
                  </>
                )}
              </div>

              {/* Action Bar (Like, Bookmark, Share, Views) */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-zinc-800">
                {/* Left side: Rating / View count */}
                <div className="flex items-center gap-4 text-xs sm:text-sm text-zinc-400 font-medium">
                  {anime.score && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-400/10 border border-amber-400/30 text-amber-300 font-bold">
                      <Star className="w-4 h-4 fill-amber-400" />
                      <span>{anime.score.toFixed(2)} MAL</span>
                    </div>
                  )}
                  <span className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-zinc-500" />
                    <span>
                      {anime.members?.toLocaleString() || anime.popularity} lượt
                      theo dõi
                    </span>
                  </span>
                  {anime.year && <span>Năm {anime.year}</span>}
                </div>

                {/* Right side: Interactive buttons */}
                <div className="flex items-center gap-2.5 flex-wrap">
                  {/* Like / Heart Button */}
                  <button
                    type="button"
                    onClick={handleToggleLike}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold border transition cursor-pointer active:scale-95 ${
                      liked
                        ? "bg-rose-950/70 border-rose-500/60 text-rose-300 shadow-lg shadow-rose-600/20"
                        : "bg-[#1a1d2e] hover:bg-[#252a42] border-purple-500/20 text-zinc-200"
                    }`}
                  >
                    <Heart
                      className={`w-4 h-4 transition-transform ${
                        liked ? "fill-rose-500 text-rose-500 scale-110" : ""
                      }`}
                    />
                    <span>{likeCount.toLocaleString()}</span>
                  </button>

                  {/* Bookmark Button */}
                  <button
                    type="button"
                    onClick={() => toggleBookmark(anime)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold border transition cursor-pointer active:scale-95 ${
                      bookmarked
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

                  {/* Share Button */}
                  <button
                    type="button"
                    onClick={handleShare}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[#1a1d2e] hover:bg-[#252a42] border border-purple-500/20 text-zinc-200 transition cursor-pointer active:scale-95"
                    title="Sao chép liên kết xem phim"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span className="text-emerald-400">Đã copy link!</span>
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

            {/* 4. Seasons / Relations Selector (Kimetsu no Yaiba, JJK, etc.) */}
            <SeasonGrid
              seasonList={seasonList}
              currentAnimeId={id}
              mode="watch"
            />

            {/* 5. Episode Selector Box (Danh sách chọn tập) with Watched Indicators & Progress Bar */}
            <div className="space-y-4 p-5 rounded-3xl bg-[#111320] border border-purple-500/20 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <Tv className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-heading text-lg sm:text-xl font-black text-white">
                    Chọn tập phim
                  </h3>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-500/30">
                    {totalEpisodes} tập
                  </span>
                </div>

                {/* Quick Search Episode */}
                {!isUpcoming && totalEpisodes > 0 && (
                  <div className="relative w-full sm:w-48">
                    <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={episodeSearch}
                      onChange={(e) => setEpisodeSearch(e.target.value)}
                      placeholder="Tìm số tập..."
                      className="w-full bg-[#181a28] border border-purple-500/20 rounded-xl pl-9 pr-3 py-1.5 text-xs sm:text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-purple-400"
                    />
                  </div>
                )}
              </div>

              {isUpcoming || totalEpisodes === 0 ? (
                <div className="p-8 sm:p-10 text-center bg-[#151724]/60 rounded-2xl border border-purple-500/20 space-y-3">
                  <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Clock className="w-6 h-6" />
                  </div>
                  <h4 className="text-base sm:text-lg font-bold text-white font-heading">
                    Chưa có tập phim phát hành
                  </h4>
                  <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">
                    Phần phim này chưa có tập phát sóng chính thức. Bạn có thể
                    chọn xem các mùa trước trong danh sách các phần phim bên
                    trên.
                  </p>
                </div>
              ) : (
                /* Grid of Episode Buttons */
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-6 xl:grid-cols-8 gap-2.5 max-h-[380px] overflow-y-auto pr-1 no-scrollbar">
                  {(filteredEpisodes.length > 0
                    ? filteredEpisodes
                    : Array.from({ length: totalEpisodes }).map((_, idx) => ({
                        mal_id: idx + 1,
                        title: `Tập ${idx + 1}`,
                        filler: false,
                      }))
                  ).map((ep) => {
                    const isCurrent = ep.mal_id === currentEpisode;
                    const watched = isWatched(id, ep.mal_id);
                    const epProg = getProgress(id, ep.mal_id);

                    return (
                      <button
                        key={ep.mal_id}
                        type="button"
                        onClick={() => handleSelectEpisode(ep.mal_id)}
                        className={`relative flex flex-col items-center justify-center p-2 sm:p-2.5 md:p-3 rounded-xl font-heading font-black text-xs sm:text-sm transition cursor-pointer active:scale-95 overflow-hidden ${
                          isCurrent
                            ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/30 ring-2 ring-emerald-400 border border-emerald-400"
                            : watched
                              ? "bg-[#181a28] text-zinc-300 border border-emerald-500/30 hover:border-purple-500/50"
                              : "bg-[#161826] hover:bg-[#222538] text-zinc-200 border border-purple-500/20 hover:border-purple-400"
                        }`}
                        title={
                          epProg && epProg.currentTime > 0
                            ? `Tập ${ep.mal_id} - Đã xem đến ${formatSeconds(epProg.currentTime)}`
                            : ep.title || `Tập ${ep.mal_id}`
                        }
                      >
                        <div className="flex items-center gap-1.5">
                          {isCurrent ? (
                            <Play className="w-3.5 h-3.5 fill-white shrink-0" />
                          ) : watched ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          ) : null}
                          <span>Tập {ep.mal_id}</span>
                        </div>

                        {/* Watched progress bar indicator */}
                        {epProg && epProg.percentage > 0 && !isCurrent && (
                          <div className="w-full bg-zinc-800 h-1 rounded-full overflow-hidden mt-1.5">
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

                        {ep.filler && !isCurrent && (
                          <span className="absolute -top-1.5 -right-1 text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            Ngoại
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 6. Collapsible Anime Synopsis & Details Box */}
            <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-[#111320] border border-purple-500/20 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <h4 className="font-heading font-bold text-base sm:text-lg text-white">
                  Nội dung anime
                </h4>
                {anime.genres && (
                  <div className="flex items-center gap-2 flex-wrap">
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

              <div className="text-xs sm:text-sm text-zinc-300 leading-relaxed space-y-2">
                <p
                  ref={synopsisRef}
                  className={
                    isSynopsisExpanded || !canExpandSynopsis
                      ? ""
                      : "line-clamp-3 overflow-hidden"
                  }
                >
                  {anime.synopsis ||
                    "Chưa có tóm tắt chi tiết cho bộ phim này."}
                </p>
                {canExpandSynopsis && (
                  <button
                    type="button"
                    onClick={() => setIsSynopsisExpanded(!isSynopsisExpanded)}
                    className="text-purple-400 hover:text-purple-300 text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>{isSynopsisExpanded ? "Thu gọn" : "Xem thêm"}</span>
                    {isSynopsisExpanded ? (
                      <ChevronUp className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" />
                    )}
                  </button>
                )}
              </div>

              {anime.studios && anime.studios.length > 0 && (
                <div className="pt-2 text-xs text-zinc-400 border-t border-zinc-800/80">
                  <span>Studio sản xuất: </span>
                  <span className="text-zinc-200 font-semibold">
                    {anime.studios.map((s) => s.name).join(", ")}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* ========================================================= */}
          {/* RIGHT COLUMN: Recommended Anime Sidebar (YouTube-Style 30%) */}
          {/* ========================================================= */}
          <div className="lg:col-span-4 xl:col-span-4 space-y-4">
            <div className="flex items-center justify-between gap-3 border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h3 className="font-heading text-lg sm:text-xl font-black text-white">
                  Đề xuất cho bạn
                </h3>
              </div>
              <span className="text-xs text-zinc-400 font-medium">
                Gợi ý tương tự
              </span>
            </div>

            {/* Sidebar Recommended Anime Cards (Compact Horizontal Format) */}
            <div className="space-y-3">
              {sidebarAnimeList.map((rec) => (
                <Link
                  key={rec.mal_id}
                  href={`/anime/${rec.mal_id}/watch?ep=1`}
                  className="group flex gap-3 p-2.5 rounded-2xl bg-[#111320] hover:bg-[#1b1e32] border border-purple-500/15 hover:border-purple-400/50 transition-all shadow-md cursor-pointer"
                >
                  {/* Left Thumbnail (16:10 aspect ratio) */}
                  <div className="relative w-32 sm:w-36 aspect-[16/10] rounded-xl overflow-hidden shrink-0 bg-zinc-900">
                    <img
                      src={rec.image_url}
                      alt={rec.title}
                      loading="lazy"
                      decoding="async"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="w-8 h-8 rounded-full bg-purple-600/90 text-white flex items-center justify-center shadow-lg">
                        <Play className="w-4 h-4 fill-white ml-0.5" />
                      </span>
                    </div>
                    {rec.score && (
                      <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded-md bg-black/80 backdrop-blur-sm text-amber-300 font-black text-[10px] flex items-center gap-0.5">
                        <Star className="w-2.5 h-2.5 fill-amber-300" />
                        {rec.score.toFixed(1)}
                      </span>
                    )}
                  </div>

                  {/* Right Info */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                    <div>
                      <h4
                        className="font-heading font-bold text-sm sm:text-base text-zinc-100 group-hover:text-purple-300 transition-colors line-clamp-2 leading-snug"
                        title={rec.title}
                      >
                        {rec.title}
                      </h4>
                      <p className="text-xs text-zinc-400 mt-1 line-clamp-1">
                        {rec.type} • Vietsub FHD
                      </p>
                    </div>

                    <div className="flex items-center gap-2 pt-1 text-[11px] text-zinc-500 font-medium">
                      <span className="text-purple-400 font-bold">
                        Xem ngay
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
