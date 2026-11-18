import {
  ChevronLeft, Clock, ExternalLink, FastForward, Film,
  Loader2, Play, RotateCcw, Sparkles, Tv, X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef } from "react";
import { CustomVideoPlayer } from "@/components/CustomVideoPlayer";
import { buildAnimeSeasons } from "@/utils/seasons";
import { useUserStore } from "@/store/useUserStore";
import { formatSeconds, useWatchStore } from "@/store/useWatchStore";

export function WatchPlayerSection() {
  const playerRef = useRef<HTMLDivElement | null>(null);
  const { saveProgress, markWatched } = useUserStore();

  const animeId = useWatchStore((s) => s.animeId);
  const anime = useWatchStore((s) => s.anime) as any;
  const episodes = useWatchStore((s) => s.episodes);
  const relations = useWatchStore((s) => s.relations);
  const currentEpisode = useWatchStore((s) => s.currentEpisode);
  const scrollTrigger = useWatchStore((s) => s.scrollTrigger);
  const streamLoading = useWatchStore((s) => s.streamLoading);
  const streamError = useWatchStore((s) => s.streamError);
  const activeServer = useWatchStore((s) => s.activeServer);
  const playerMode = useWatchStore((s) => s.playerMode);
  const isTrailerMode = useWatchStore((s) => s.isTrailerMode);
  const resumeTime = useWatchStore((s) => s.resumeTime);
  const showResumePrompt = useWatchStore((s) => s.showResumePrompt);
  const nextEpisodeCountdown = useWatchStore((s) => s.nextEpisodeCountdown);

  const selectEpisode = useWatchStore((s) => s.selectEpisode);
  const setPlayerMode = useWatchStore((s) => s.setPlayerMode);
  const enableTrailerMode = useWatchStore((s) => s.enableTrailerMode);
  const setShowResumePrompt = useWatchStore((s) => s.setShowResumePrompt);
  const setResumeTime = useWatchStore((s) => s.setResumeTime);
  const setNextEpisodeCountdown = useWatchStore((s) => s.setNextEpisodeCountdown);
  const decrementCountdown = useWatchStore((s) => s.decrementCountdown);

  useEffect(() => {
    if (scrollTrigger > 0) {
      playerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [scrollTrigger]);

  const isUpcoming =
    anime?.status === "NOT_YET_RELEASED" ||
    (episodes.length === 0 && (!anime?.episodes || anime.episodes === 0));

  const totalEpisodes = isUpcoming ? 0 : episodes.length || anime?.episodes || 0;

  useEffect(() => {
    if (nextEpisodeCountdown === null) return;
    if (nextEpisodeCountdown <= 0) {
      if (currentEpisode < (totalEpisodes || 24)) selectEpisode(currentEpisode + 1);
      setNextEpisodeCountdown(null);
      return;
    }
    const timer = setTimeout(() => decrementCountdown(), 1000);
    return () => clearTimeout(timer);
  }, [nextEpisodeCountdown, currentEpisode, totalEpisodes, selectEpisode, setNextEpisodeCountdown, decrementCountdown]);

  const seasonList = useMemo(() => {
    if (!relations) return [];
    return buildAnimeSeasons(relations);
  }, [relations]);

  if (!anime || !animeId) return null;

  const displayTitle = anime.title?.english || anime.title?.romaji || "Unknown";
  const coverImage = anime.coverImage?.extraLarge || anime.coverImage?.large || "";
  const bannerImage = anime.bannerImage || coverImage;
  const trailerId = anime.trailer?.site === "youtube" ? anime.trailer.id : null;
  const trailerEmbed = trailerId ? `https://www.youtube.com/embed/${trailerId}?autoplay=1` : null;
  const hasTrailer = Boolean(trailerId);
  const previousSeason = seasonList.find((s) => !s.isCurrent && !s.unreleased);

  const handleVideoTimeUpdate = (currTime?: number, dur?: number) => {
    if (currTime && dur && currTime > 0 && dur > 0) {
      saveProgress(animeId, currentEpisode, currTime, dur);
    }
  };

  const handleVideoEnded = () => {
    markWatched(animeId, currentEpisode);
    if (currentEpisode < (totalEpisodes || 24)) setNextEpisodeCountdown(5);
  };

  const handlePlayNextNow = () => {
    setNextEpisodeCountdown(null);
    if (currentEpisode < (totalEpisodes || 24)) selectEpisode(currentEpisode + 1);
  };

  const handleReplayEpisode = () => {
    setResumeTime(0);
    setNextEpisodeCountdown(null);
  };

  return (
    <div ref={playerRef} className="relative w-full aspect-video rounded-2xl sm:rounded-3xl overflow-hidden bg-black border border-purple-500/30 shadow-2xl shadow-black/90 group scroll-mt-32">
      {isUpcoming || totalEpisodes === 0 ? (
        isTrailerMode && hasTrailer ? (
          <CustomVideoPlayer embedUrl={trailerEmbed} youtubeId={trailerId} isTrailer={true} title={`Trailer: ${displayTitle}`} poster={bannerImage} />
        ) : (
          <div className="relative w-full h-full flex flex-col items-center justify-center p-6 sm:p-10 text-center bg-gradient-to-b from-zinc-950 via-[#111322] to-zinc-950 text-zinc-300 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-purple-950/70 border border-purple-500/40 flex items-center justify-center shadow-xl">
              <Clock className="w-8 h-8 text-amber-400 animate-pulse" />
            </div>
            <div className="space-y-1.5 max-w-lg">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Chưa phát sóng chính thức</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white font-heading">{displayTitle}</h3>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Phần phim này hiện đang trong giai đoạn sản xuất hoặc chưa có tập phim phát hành chính thức.
              </p>
            </div>
            <div className="flex items-center gap-2.5 flex-wrap justify-center pt-1">
              {hasTrailer && (
                <button type="button" onClick={enableTrailerMode} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm shadow-lg transition cursor-pointer">
                  <Film className="w-4 h-4" />
                  <span>Xem Official Trailer</span>
                </button>
              )}
              {previousSeason && (
                <Link href={`/anime/${previousSeason.id}/watch?ep=1`} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1a1d2e] hover:bg-[#252a42] text-zinc-200 border border-purple-500/30 font-bold text-xs sm:text-sm transition">
                  <ChevronLeft className="w-4 h-4" />
                  <span>Xem phần trước ({previousSeason.title})</span>
                </Link>
              )}
              <Link href={`/anime/${animeId}`} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 font-bold text-xs sm:text-sm transition">
                <span>Chi tiết anime</span>
              </Link>
            </div>
          </div>
        )
      ) : streamLoading ? (
        <div className="absolute inset-0 z-20 bg-black/90 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-11 h-11 text-emerald-400 animate-spin" />
          <p className="text-emerald-300 font-bold text-sm sm:text-base animate-pulse">Đang kết nối luồng phát Tập {currentEpisode}...</p>
        </div>
      ) : activeServer ? (
        playerMode === "hls" && activeServer.m3u8Url ? (
          <CustomVideoPlayer
            src={activeServer.m3u8Url} title={`Tập ${currentEpisode} - ${displayTitle}`} poster={bannerImage}
            initialTime={resumeTime} onTimeUpdate={handleVideoTimeUpdate} onEnded={handleVideoEnded}
            nextEpisodeCountdown={nextEpisodeCountdown} onPlayNextNow={handlePlayNextNow}
            onCancelAutoNext={() => setNextEpisodeCountdown(null)}
            resumeTime={showResumePrompt ? resumeTime : 0}
            onResumePlay={() => setShowResumePrompt(false)} onDismissResume={() => setShowResumePrompt(false)}
            onErrorRetry={() => setPlayerMode("iframe")}
          />
        ) : (
          <CustomVideoPlayer embedUrl={activeServer.embedUrl} title={`Tập ${currentEpisode} - ${displayTitle}`} poster={bannerImage} onErrorRetry={() => setPlayerMode("hls")} />
        )
      ) : isTrailerMode && hasTrailer ? (
        <CustomVideoPlayer embedUrl={trailerEmbed} youtubeId={trailerId} isTrailer={true} title={`Trailer: ${displayTitle}`} poster={bannerImage} />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-zinc-950 text-zinc-300 space-y-4">
          <Tv className="w-12 h-12 text-zinc-600" />
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white">Chưa có nguồn stream tự động cho tập này</h3>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-md mt-1">{streamError || "Vui lòng thử chọn máy chủ khác."}</p>
          </div>
          <a href={`https://www.google.com/search?q=${encodeURIComponent(`${displayTitle} tập ${currentEpisode} vietsub`)}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs sm:text-sm shadow-md">
            <span>Tìm xem trên Google</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      )}

      {showResumePrompt && resumeTime > 0 && (
        <div className="absolute top-3 left-3 right-3 sm:right-auto z-30 sm:max-w-sm p-3 rounded-2xl bg-black/85 backdrop-blur-md border border-purple-500/50 shadow-2xl flex items-center justify-between gap-3">
          <div className="space-y-0.5 min-w-0">
            <p className="text-xs font-bold text-white flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <span className="truncate">Đã xem đến {formatSeconds(resumeTime)}</span>
            </p>
            <p className="text-[11px] text-zinc-400 truncate">Nhấn để tiếp tục đoạn đang xem</p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button type="button" onClick={() => setShowResumePrompt(false)} className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition flex items-center gap-1 cursor-pointer">
              <FastForward className="w-3 h-3" />
              <span>Tua đến</span>
            </button>
            <button type="button" onClick={() => setShowResumePrompt(false)} className="p-1.5 rounded-xl text-zinc-400 hover:text-white transition cursor-pointer" title="Bỏ qua">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {nextEpisodeCountdown !== null && (
        <div className="absolute inset-0 z-40 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-4 select-none">
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-purple-500/30 flex items-center justify-center">
            <span className="text-3xl sm:text-4xl font-black text-white font-heading">{nextEpisodeCountdown}</span>
            <div className="absolute inset-0 rounded-full border-4 border-emerald-400 border-t-transparent animate-spin" />
          </div>
          <div className="space-y-1 max-w-md">
            <h3 className="text-base sm:text-xl font-black text-white">Tập tiếp theo tự động phát sau {nextEpisodeCountdown}s...</h3>
            <p className="text-xs sm:text-sm text-purple-300 font-semibold truncate">{displayTitle} - Tập {currentEpisode + 1}</p>
          </div>
          <div className="flex items-center gap-2.5 flex-wrap justify-center pt-1">
            <button type="button" onClick={handlePlayNextNow} className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm shadow-lg transition cursor-pointer flex items-center gap-1.5">
              <Play className="w-4 h-4 fill-white" />
              <span>Phát ngay</span>
            </button>
            <button type="button" onClick={() => setNextEpisodeCountdown(null)} className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white font-semibold text-xs sm:text-sm transition cursor-pointer">Hủy tự phát</button>
            <button type="button" onClick={handleReplayEpisode} className="px-4 py-2.5 rounded-xl bg-[#1b1e32] hover:bg-[#242940] text-purple-300 hover:text-white font-semibold text-xs sm:text-sm transition cursor-pointer flex items-center gap-1.5">
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Xem lại</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
