"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { PlayerControlsOverlay } from "./PlayerControlsOverlay";
import type { CustomVideoPlayerProps } from "./types";
import { useHlsEngine } from "./useHlsEngine";

const HIDE_DELAY_MS = 1800;
const SEEK_STEP_SECONDS = 10;

export function CustomVideoPlayer({
  src,
  embedUrl,
  youtubeId,
  title = "Video Player",
  poster,
  initialTime = 0,
  hasPrevEpisode,
  hasNextEpisode,
  onPrevEpisode,
  onNextEpisode,
  onTimeUpdate,
  onEnded,
  onErrorRetry,
}: CustomVideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const seekFeedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTouchRef = useRef(false);
  const hasAppliedInitialTimeRef = useRef(false);

  const {
    hasError,
    setHasError,
    qualityLevels,
    selectedQuality,
    activeAutoHeight,
    selectQuality,
  } = useHlsEngine(videoRef, src);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [seekFeedback, setSeekFeedback] = useState<string | null>(null);
  const [isQualityMenuOpen, setIsQualityMenuOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragTime, setDragTime] = useState(0);

  const clearHideTimer = useCallback(() => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }, []);

  const scheduleHideControls = useCallback(() => {
    clearHideTimer();
    hideTimerRef.current = setTimeout(() => {
      const video = videoRef.current;
      if (
        video &&
        !video.paused &&
        !video.ended &&
        !isQualityMenuOpen &&
        !isDragging
      ) {
        setShowControls(false);
      }
    }, HIDE_DELAY_MS);
  }, [clearHideTimer, isQualityMenuOpen, isDragging]);

  const revealControls = useCallback(() => {
    setShowControls(true);
    scheduleHideControls();
  }, [scheduleHideControls]);

  useEffect(() => {
    hasAppliedInitialTimeRef.current = false;
    setIsPlaying(false);
    setCurrentTime(0);
    setIsQualityMenuOpen(false);
  }, [src]);

  useEffect(() => {
    return () => {
      clearHideTimer();
      if (seekFeedbackTimerRef.current) clearTimeout(seekFeedbackTimerRef.current);
    };
  }, [clearHideTimer]);

  useEffect(() => {
    if (!isPlaying || isQualityMenuOpen || isDragging) {
      clearHideTimer();
      setShowControls(true);
    } else {
      scheduleHideControls();
    }
  }, [isPlaying, isQualityMenuOpen, isDragging, clearHideTimer, scheduleHideControls]);

  useEffect(() => {
    const video = videoRef.current;
    if (
      video &&
      initialTime > 0 &&
      !hasAppliedInitialTimeRef.current &&
      video.readyState >= 1
    ) {
      video.currentTime = initialTime;
      hasAppliedInitialTimeRef.current = true;
    }
  }, [initialTime]);

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused || video.ended) {
      video.play().catch(() => { });
    } else {
      video.pause();
    }
    revealControls();
  }, [revealControls]);

  const skipBy = useCallback(
    (delta: number) => {
      const video = videoRef.current;
      if (!video) return;
      const maxDuration = video.duration || duration || 0;
      const nextTime = Math.min(Math.max(0, video.currentTime + delta), maxDuration);
      video.currentTime = nextTime;
      setCurrentTime(nextTime);
      setSeekFeedback(delta > 0 ? `+${delta}s` : `${delta}s`);
      if (seekFeedbackTimerRef.current) clearTimeout(seekFeedbackTimerRef.current);
      seekFeedbackTimerRef.current = setTimeout(() => setSeekFeedback(null), 650);
      revealControls();
    },
    [duration, revealControls],
  );

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
    revealControls();
  }, [revealControls]);

  const toggleFullscreen = useCallback(async () => {
    const container = containerRef.current;
    if (!container) return;
    if (!document.fullscreenElement) {
      await container.requestFullscreen().catch(() => { });
    } else {
      await document.exitFullscreen().catch(() => { });
    }
    revealControls();
  }, [revealControls]);

  useEffect(() => {
    if (!src) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        skipBy(-SEEK_STEP_SECONDS);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        skipBy(SEEK_STEP_SECONDS);
      } else if (e.key === " ") {
        e.preventDefault();
        togglePlay();
      } else if (e.key.toLowerCase() === "m") {
        e.preventDefault();
        toggleMute();
      } else if (e.key.toLowerCase() === "f") {
        e.preventDefault();
        toggleFullscreen();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [src, skipBy, togglePlay, toggleMute, toggleFullscreen]);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const nextVol = Number(e.target.value);
    video.volume = nextVol;
    video.muted = nextVol === 0;
    setVolume(nextVol);
    setIsMuted(nextVol === 0);
    revealControls();
  };

  const cyclePlaybackRate = () => {
    const video = videoRef.current;
    if (!video) return;
    const rates = [1, 1.25, 1.5, 2];
    const nextRate = rates[(rates.indexOf(playbackRate) + 1) % rates.length];
    video.playbackRate = nextRate;
    setPlaybackRate(nextRate);
    revealControls();
  };

  if (!src) {
    const iframeSrc =
      embedUrl ||
      (youtubeId
        ? `https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0`
        : null);
    if (!iframeSrc) return null;
    return (
      <div className="relative w-full h-full bg-black">
        <iframe
          src={iframeSrc}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
          className="w-full h-full border-0"
        />
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-zinc-950 text-zinc-200 space-y-3">
        <AlertCircle className="w-11 h-11 text-rose-400" />
        <p className="text-sm sm:text-base font-bold">
          Không thể phát luồng HLS trên trình duyệt này
        </p>
        {onErrorRetry && (
          <button
            type="button"
            onClick={onErrorRetry}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 text-white text-xs sm:text-sm font-bold transition cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Chuyển sang trình phát Embed</span>
          </button>
        )}
      </div>
    );
  }

  const controlsVisible =
    showControls || !isPlaying || isQualityMenuOpen || isDragging;
  const activeQualityLabel =
    selectedQuality === -1
      ? activeAutoHeight
        ? `Auto (${activeAutoHeight}p)`
        : "Auto"
      : qualityLevels.find((q) => q.index === selectedQuality)?.label || "HD";

  return (
    <div
      ref={containerRef}
      onMouseMove={() => {
        if (!isTouchRef.current) revealControls();
      }}
      onMouseEnter={() => {
        if (!isTouchRef.current) revealControls();
      }}
      onMouseLeave={() => {
        if (!isTouchRef.current && isPlaying && !isQualityMenuOpen && !isDragging) {
          clearHideTimer();
          setShowControls(false);
        }
      }}
      onTouchStart={() => {
        isTouchRef.current = true;
      }}
      onClick={() => {
        if (isQualityMenuOpen) {
          setIsQualityMenuOpen(false);
          return;
        }
        if (isTouchRef.current) {
          if (showControls && isPlaying) {
            clearHideTimer();
            setShowControls(false);
          } else {
            revealControls();
          }
        }
      }}
      className="relative w-full h-full bg-black select-none overflow-hidden"
    >
      <video
        ref={videoRef}
        poster={poster}
        playsInline
        preload="metadata"
        onLoadedMetadata={(e) => {
          const video = e.currentTarget;
          setDuration(video.duration || 0);
          if (initialTime > 0 && !hasAppliedInitialTimeRef.current) {
            video.currentTime = initialTime;
            hasAppliedInitialTimeRef.current = true;
          }
        }}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => {
          setIsPlaying(false);
          onEnded?.();
        }}
        onTimeUpdate={(e) => {
          const video = e.currentTarget;
          const curr = video.currentTime;
          const dur = video.duration || 0;
          if (!isDragging) setCurrentTime(curr);
          if (dur > 0) setDuration(dur);
          if (video.buffered.length > 0) {
            setBuffered(video.buffered.end(video.buffered.length - 1));
          }
          onTimeUpdate?.(curr, dur);
        }}
        onError={() => setHasError(true)}
        className="w-full h-full object-contain"
      />

      {seekFeedback && (
        <div className="pointer-events-none absolute top-14 left-1/2 -translate-x-1/2 z-30 px-3.5 py-1.5 rounded-full bg-black/80 border border-white/15 text-white font-heading font-black text-xs sm:text-sm shadow-xl">
          {seekFeedback}
        </div>
      )}

      <PlayerControlsOverlay
        visible={controlsVisible}
        title={title}
        activeQualityLabel={activeQualityLabel}
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        buffered={buffered}
        isDragging={isDragging}
        dragTime={dragTime}
        isMuted={isMuted}
        volume={volume}
        playbackRate={playbackRate}
        isFullscreen={isFullscreen}
        hasPrevEpisode={hasPrevEpisode}
        hasNextEpisode={hasNextEpisode}
        qualityLevels={qualityLevels}
        selectedQuality={selectedQuality}
        activeAutoHeight={activeAutoHeight}
        isQualityMenuOpen={isQualityMenuOpen}
        onTogglePlay={togglePlay}
        onSkipBy={skipBy}
        onPrevEpisode={onPrevEpisode}
        onNextEpisode={onNextEpisode}
        onDragStart={(time) => {
          setIsDragging(true);
          setDragTime(time);
          clearHideTimer();
        }}
        onDragMove={(time) => setDragTime(time)}
        onDragEnd={(time) => {
          if (videoRef.current) videoRef.current.currentTime = time;
          setCurrentTime(time);
          setIsDragging(false);
          revealControls();
        }}
        onToggleMute={toggleMute}
        onVolumeChange={handleVolumeChange}
        onCyclePlaybackRate={cyclePlaybackRate}
        onToggleQualityMenu={() => setIsQualityMenuOpen((p) => !p)}
        onSelectQuality={(idx) => {
          selectQuality(idx);
          setIsQualityMenuOpen(false);
          revealControls();
        }}
        onToggleFullscreen={toggleFullscreen}
      />
    </div>
  );
}
