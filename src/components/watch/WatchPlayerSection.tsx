import { ExternalLink, Tv } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { CustomVideoPlayer } from "@/components/player/CustomVideoPlayer";
import { PlayerLoading } from "@/components/player/PlayerLoading";
import { useUserStore } from "@/store/useUserStore";
import { useWatchStore } from "@/store/useWatchStore";
import type { AnimeSeasonItem } from "@/types/anilist";
import { getReleasedEpisodeCount, isAnimeUpcoming } from "@/utils/anime";
import type { useWatchSource } from "./useWatchSource";
import {
  WatchNextEpisodePrompt,
  WatchResumePrompt,
} from "./WatchPlaybackPrompts";
import { WatchSourceError } from "./WatchSourceError";
import { WatchUpcomingPanel } from "./WatchUpcomingPanel";

export function WatchPlayerSection({
  seasonList,
  source,
}: {
  seasonList: AnimeSeasonItem[];
  source: ReturnType<typeof useWatchSource>;
}) {
  const playerRef = useRef<HTMLDivElement | null>(null);
  const { videoRef, checkpoint } = source;
  const [autoPlayEpisode, setAutoPlayEpisode] = useState<number | null>(null);
  const lastSavedTime = useRef<{ key: string; at: number } | null>(null);
  const saveProgress = useUserStore((s) => s.saveProgress);
  const markWatched = useUserStore((s) => s.markWatched);

  const animeId = useWatchStore((s) => s.animeId);
  const anime = useWatchStore((s) => s.anime);
  const episodes = useWatchStore((s) => s.episodes);
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
  const streamServers = useWatchStore((s) => s.streamServers);
  const setShowResumePrompt = useWatchStore((s) => s.setShowResumePrompt);
  const setNextEpisodeCountdown = useWatchStore(
    (s) => s.setNextEpisodeCountdown,
  );
  const decrementCountdown = useWatchStore((s) => s.decrementCountdown);

  useEffect(() => {
    if (scrollTrigger > 0) {
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      playerRef.current?.scrollIntoView({
        behavior: reduceMotion ? "instant" : "smooth",
        block: "start",
      });
    }
  }, [scrollTrigger]);

  const isUpcoming = isAnimeUpcoming(anime, episodes.length);

  const totalEpisodes = isUpcoming
    ? 0
    : (getReleasedEpisodeCount(anime) ??
      (episodes.length || anime?.episodes || 0));

  const hasNextEpisode = currentEpisode < totalEpisodes;
  const handlePlayNextNow = useCallback(() => {
    setNextEpisodeCountdown(null);
    if (hasNextEpisode) {
      setAutoPlayEpisode(currentEpisode + 1);
      selectEpisode(currentEpisode + 1);
    }
  }, [currentEpisode, hasNextEpisode, selectEpisode, setNextEpisodeCountdown]);

  useEffect(() => {
    if (autoPlayEpisode !== null && autoPlayEpisode !== currentEpisode) {
      setAutoPlayEpisode(null);
    }
  }, [autoPlayEpisode, currentEpisode]);

  useEffect(() => {
    if (nextEpisodeCountdown === null) return;
    if (nextEpisodeCountdown <= 0) {
      handlePlayNextNow();
      return;
    }
    const timer = setTimeout(() => decrementCountdown(), 1000);
    return () => clearTimeout(timer);
  }, [nextEpisodeCountdown, handlePlayNextNow, decrementCountdown]);

  if (!anime || !animeId) return null;

  const displayTitle = anime.title?.english || anime.title?.romaji || "Unknown";
  const coverImage =
    anime.coverImage?.extraLarge || anime.coverImage?.large || "";
  const bannerImage = anime.bannerImage || coverImage;
  const trailerId = anime.trailer?.site === "youtube" ? anime.trailer.id : null;
  const hasTrailer = Boolean(trailerId);
  const previousSeason = seasonList.findLast(
    (s) => !s.isCurrent && !s.unreleased,
  );

  const handleVideoTimeUpdate = (
    currTime: number,
    duration: number,
    flush = false,
  ) => {
    if (currTime <= 0 || duration <= 0 || !Number.isFinite(duration)) return;
    if (
      useWatchStore.getState().animeId !== animeId ||
      useWatchStore.getState().currentEpisode !== currentEpisode
    )
      return;
    if (videoRef.current) source.recordPosition(videoRef.current);
    const key = `${animeId}_${currentEpisode}`;
    const now = Date.now();
    if (
      !flush &&
      lastSavedTime.current?.key === key &&
      now - lastSavedTime.current.at < 2000
    )
      return;
    lastSavedTime.current = { key, at: now };
    saveProgress(animeId, currentEpisode, currTime, duration);
  };

  const handleVideoEnded = () => {
    markWatched(animeId, currentEpisode);
    if (hasNextEpisode && useUserStore.getState().autoPlayNextEpisode)
      setNextEpisodeCountdown(5);
  };

  const handleResume = () => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = resumeTime;
    video.play().catch(() => {});
    setShowResumePrompt(false);
  };

  const handleReplayEpisode = () => {
    const video = videoRef.current;
    if (video) {
      video.currentTime = 0;
      video.play().catch(() => {});
    }
    setNextEpisodeCountdown(null);
  };

  return (
    <div
      ref={playerRef}
      className="relative w-full aspect-video rounded-2xl sm:rounded-3xl overflow-hidden bg-black border border-purple-500/30 shadow-2xl shadow-black/90 group scroll-mt-32"
    >
      {isUpcoming || totalEpisodes === 0 ? (
        isTrailerMode && hasTrailer ? (
          <CustomVideoPlayer
            youtubeId={trailerId}
            title={`Trailer: ${displayTitle}`}
            poster={bannerImage}
          />
        ) : (
          <WatchUpcomingPanel
            animeId={animeId}
            displayTitle={displayTitle}
            hasTrailer={hasTrailer}
            previousSeason={previousSeason}
            onPlayTrailer={source.enableTrailerMode}
          />
        )
      ) : streamLoading ? (
        <PlayerLoading>
          Đang tìm nguồn phát cho tập {currentEpisode}…
        </PlayerLoading>
      ) : activeServer ? (
        playerMode === "hls" && activeServer.m3u8Url ? (
          <CustomVideoPlayer
            key={`${animeId}:${currentEpisode}:${activeServer.id}:${source.attempt}`}
            src={activeServer.m3u8Url}
            title={`Tập ${currentEpisode} - ${displayTitle}`}
            poster={bannerImage}
            videoElementRef={videoRef}
            autoPlay={autoPlayEpisode === currentEpisode && !showResumePrompt}
            onTimeUpdate={handleVideoTimeUpdate}
            onEnded={handleVideoEnded}
            hasPrevEpisode={currentEpisode > 1}
            hasNextEpisode={hasNextEpisode}
            onPrevEpisode={() => selectEpisode(currentEpisode - 1)}
            onNextEpisode={handlePlayNextNow}
            checkpoint={checkpoint}
            errorFallback={
              <WatchSourceError
                alternatives={streamServers.filter(
                  (server) => server.id !== activeServer.id,
                )}
                onRetry={source.retry}
                onSelectServer={source.selectServer}
                onEmbed={
                  activeServer.embedUrl
                    ? () => source.setPlayerMode("iframe")
                    : undefined
                }
              />
            }
          />
        ) : (
          <CustomVideoPlayer
            embedUrl={activeServer.embedUrl}
            title={`Tập ${currentEpisode} - ${displayTitle}`}
            poster={bannerImage}
          />
        )
      ) : isTrailerMode && hasTrailer ? (
        <CustomVideoPlayer
          youtubeId={trailerId}
          title={`Trailer: ${displayTitle}`}
          poster={bannerImage}
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-zinc-950 text-zinc-300 space-y-4">
          <Tv className="w-12 h-12 text-zinc-600" />
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white">
              Chưa có nguồn stream tự động cho tập này
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-md mt-1">
              {streamError || "Vui lòng thử chọn máy chủ khác."}
            </p>
          </div>
          <a
            href={`https://www.google.com/search?q=${encodeURIComponent(`${displayTitle} tập ${currentEpisode} vietsub`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs sm:text-sm shadow-md"
          >
            <span>Tìm xem trên Google</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      )}

      {activeServer &&
        playerMode === "hls" &&
        !streamLoading &&
        !checkpoint &&
        showResumePrompt &&
        resumeTime > 0 && (
          <WatchResumePrompt
            resumeTime={resumeTime}
            onResume={handleResume}
            onDismiss={() => setShowResumePrompt(false)}
          />
        )}
      {nextEpisodeCountdown !== null && (
        <WatchNextEpisodePrompt
          seconds={nextEpisodeCountdown}
          displayTitle={displayTitle}
          currentEpisode={currentEpisode}
          onPlayNext={handlePlayNextNow}
          onCancel={() => setNextEpisodeCountdown(null)}
          onReplay={handleReplayEpisode}
        />
      )}
    </div>
  );
}
