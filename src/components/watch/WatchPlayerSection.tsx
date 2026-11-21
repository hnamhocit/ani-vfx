import { useCallback, useEffect, useRef, useState } from "react";
import { CustomVideoPlayer } from "@/components/player/CustomVideoPlayer";
import { PlayerLoading } from "@/components/player/PlayerLoading";
import { useUserStore } from "@/store/useUserStore";
import { useWatchStore } from "@/store/useWatchStore";
import type { AnimeSeasonItem } from "@/types/anilist";
import { getReleasedEpisodeCount, isAnimeUpcoming } from "@/utils/anime";
import { useWatchReminder } from "./useWatchReminder";
import type { useWatchSource } from "./useWatchSource";
import {
  WatchNextEpisodeHint,
  WatchNextEpisodePrompt,
  WatchResumePrompt,
} from "./WatchPlaybackPrompts";
import { WatchReminder } from "./WatchReminder";
import { WatchSourceError } from "./WatchSourceError";
import { WatchUnavailablePanel } from "./WatchUnavailablePanel";
import { WatchUpcomingPanel } from "./WatchUpcomingPanel";

export function WatchPlayerSection({
  seasonList,
  source,
  onRetryStream,
}: {
  seasonList: AnimeSeasonItem[];
  source: ReturnType<typeof useWatchSource>;
  onRetryStream: () => void;
}) {
  const playerRef = useRef<HTMLDivElement | null>(null);
  const { videoRef, checkpoint } = source;
  const [nearEndEpisode, setNearEndEpisode] = useState<number | null>(null);
  const lastSavedTime = useRef<{ key: string; at: number } | null>(null);
  const saveProgress = useUserStore((s) => s.saveProgress);
  const autoPlayNextEpisode = useUserStore((s) => s.autoPlayNextEpisode);
  const markWatched = useUserStore((s) => s.markWatched);

  const animeId = useWatchStore((s) => s.animeId);
  const anime = useWatchStore((s) => s.anime);
  const episodes = useWatchStore((s) => s.episodes);
  const playEpisodeOnLoad = useWatchStore((s) => s.playEpisodeOnLoad);
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

  const watchReminder = useWatchReminder(videoRef);

  useEffect(() => {
    if (scrollTrigger > 0 && document.fullscreenElement !== playerRef.current) {
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
    : (getReleasedEpisodeCount(anime) ?? episodes.length);

  const hasNextEpisode = currentEpisode < totalEpisodes;
  const handlePlayNextNow = useCallback(() => {
    setNextEpisodeCountdown(null);
    if (hasNextEpisode) selectEpisode(currentEpisode + 1);
  }, [currentEpisode, hasNextEpisode, selectEpisode, setNextEpisodeCountdown]);

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
    if (duration <= 0 || !Number.isFinite(duration)) return;
    if (
      useWatchStore.getState().animeId !== animeId ||
      useWatchStore.getState().currentEpisode !== currentEpisode
    )
      return;
    setNearEndEpisode(currTime / duration >= 0.95 ? currentEpisode : null);
    if (currTime <= 0) return;
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
    if (hasNextEpisode && autoPlayNextEpisode) setNextEpisodeCountdown(5);
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
    setNearEndEpisode(null);
    setNextEpisodeCountdown(null);
  };

  return (
    <div
      ref={playerRef}
      className="relative w-full aspect-video rounded-2xl sm:rounded-3xl overflow-hidden bg-black border border-purple-500/30 shadow-2xl shadow-black/90 group scroll-mt-32 fullscreen:h-full fullscreen:rounded-none fullscreen:border-0"
    >
      {isUpcoming ? (
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
            fullscreenRef={playerRef}
            autoPlay={playEpisodeOnLoad}
            startTime={playEpisodeOnLoad && showResumePrompt ? resumeTime : 0}
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
        <WatchUnavailablePanel
          error={streamError}
          links={anime.externalLinks ?? []}
          onRetry={onRetryStream}
        />
      )}

      {activeServer &&
        playerMode === "hls" &&
        !streamLoading &&
        !checkpoint &&
        !playEpisodeOnLoad &&
        showResumePrompt &&
        resumeTime > 0 && (
          <WatchResumePrompt
            resumeTime={resumeTime}
            onResume={handleResume}
            onDismiss={() => setShowResumePrompt(false)}
          />
        )}
      {hasNextEpisode &&
        nearEndEpisode === currentEpisode &&
        !streamLoading &&
        activeServer &&
        playerMode === "hls" &&
        nextEpisodeCountdown === null && (
          <WatchNextEpisodeHint
            episode={currentEpisode + 1}
            autoPlay={autoPlayNextEpisode}
            onPlayNext={handlePlayNextNow}
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
      {watchReminder !== null && <WatchReminder minutes={watchReminder} />}
    </div>
  );
}
