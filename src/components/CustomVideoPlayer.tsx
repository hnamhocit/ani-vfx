"use client";

import Hls from "hls.js";
import {
  AlertCircle,
  Check,
  Maximize,
  Minimize,
  Pause,
  Play,
  RefreshCw,
  RotateCcw,
  RotateCw,
  Settings,
  Volume2,
  VolumeX,
} from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";

interface CustomVideoPlayerProps {
  src?: string;
  embedUrl?: string | null;
  youtubeId?: string | null;
  isTrailer?: boolean;
  title?: string;
  poster?: string;
  initialTime?: number;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  onEnded?: () => void;
  nextEpisodeCountdown?: number | null;
  onPlayNextNow?: () => void;
  onCancelAutoNext?: () => void;
  resumeTime?: number;
  onResumePlay?: () => void;
  onDismissResume?: () => void;
  onErrorRetry?: () => void;
}

interface QualityOption {
  index: number;
  label: string;
  height: number;
}

const HIDE_DELAY_MS = 1800;
const SEEK_STEP_SECONDS = 10;

function formatTime(seconds: number): string {
  if (!seconds || Number.isNaN(seconds) || !Number.isFinite(seconds)) {
    return "00:00";
  }
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) {
    return `${h}:${m < 10 ? "0" : ""}${m}:${s < 10 ? "0" : ""}${s}`;
  }
  return `${m < 10 ? "0" : ""}${m}:${s < 10 ? "0" : ""}${s}`;
}

export function CustomVideoPlayer({
  src,
  embedUrl,
  youtubeId,
  title = "Video Player",
  poster,
  initialTime = 0,
  onTimeUpdate,
  onEnded,
  onErrorRetry,
}: CustomVideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const seekFeedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTouchRef = useRef(false);
  const hasAppliedInitialTimeRef = useRef(false);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [seekFeedback, setSeekFeedback] = useState<string | null>(null);

  const [qualityLevels, setQualityLevels] = useState<QualityOption[]>([]);
  const [selectedQuality, setSelectedQuality] = useState<number>(-1);
  const [activeAutoHeight, setActiveAutoHeight] = useState<number | null>(null);
  const [isQualityMenuOpen, setIsQualityMenuOpen] = useState(false);

  const [isDragging, setIsDragging] = useState(false);
  const [dragTime, setDragTime] = useState(0);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverPercent, setHoverPercent] = useState(0);

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
    return () => {
      clearHideTimer();
      if (seekFeedbackTimerRef.current) {
        clearTimeout(seekFeedbackTimerRef.current);
      }
    };
  }, [clearHideTimer]);

  useEffect(() => {
    if (!isPlaying || isQualityMenuOpen || isDragging) {
      clearHideTimer();
      setShowControls(true);
    } else {
      scheduleHideControls();
    }
  }, [
    isPlaying,
    isQualityMenuOpen,
    isDragging,
    clearHideTimer,
    scheduleHideControls,
  ]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    setHasError(false);
    setQualityLevels([]);
    setSelectedQuality(-1);
    setActiveAutoHeight(null);
    setIsQualityMenuOpen(false);
    hasAppliedInitialTimeRef.current = false;

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
      hls.loadSource(src);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, (_event, data) => {
        const mapped: QualityOption[] = data.levels
          .map((lvl, idx) => ({
            index: idx,
            height: lvl.height || 0,
            label: lvl.height ? `${lvl.height}p` : `Mức ${idx + 1}`,
          }))
          .sort((a, b) => b.height - a.height);

        const uniqueByLabel = mapped.filter(
          (item, pos, arr) =>
            arr.findIndex((other) => other.label === item.label) === pos,
        );
        setQualityLevels(uniqueByLabel);
      });

      hls.on(Hls.Events.LEVEL_SWITCHED, (_event, data) => {
        const lvl = hls.levels[data.level];
        if (lvl?.height) {
          setActiveAutoHeight(lvl.height);
        }
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          setHasError(true);
        }
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
    } else {
      setHasError(true);
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [src]);

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
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
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
      const nextTime = Math.min(
        Math.max(0, video.currentTime + delta),
        maxDuration,
      );
      video.currentTime = nextTime;
      setCurrentTime(nextTime);
      setSeekFeedback(delta > 0 ? `+${delta}s` : `${delta}s`);
      if (seekFeedbackTimerRef.current) {
        clearTimeout(seekFeedbackTimerRef.current);
      }
      seekFeedbackTimerRef.current = setTimeout(() => {
        setSeekFeedback(null);
      }, 650);
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

  const handleSelectQuality = (levelIndex: number) => {
    setSelectedQuality(levelIndex);
    if (hlsRef.current) {
      hlsRef.current.currentLevel = levelIndex;
    }
    setIsQualityMenuOpen(false);
    revealControls();
  };

  const getScrubInfo = useCallback(
    (clientX: number) => {
      const bar = progressBarRef.current;
      if (!bar || !duration) return { time: 0, percent: 0 };
      const rect = bar.getBoundingClientRect();
      const ratio = Math.min(
        Math.max(0, (clientX - rect.left) / rect.width),
        1,
      );
      return {
        time: ratio * duration,
        percent: ratio * 100,
      };
    },
    [duration],
  );

  const handleProgressPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (!duration) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const { time } = getScrubInfo(e.clientX);
    setIsDragging(true);
    setDragTime(time);
    clearHideTimer();
  };

  const handleProgressPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const { time, percent } = getScrubInfo(e.clientX);
    setHoverTime(time);
    setHoverPercent(percent);
    if (isDragging) {
      setDragTime(time);
    }
  };

  const handleProgressPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (!isDragging) return;
    const { time } = getScrubInfo(e.clientX);
    const video = videoRef.current;
    if (video) {
      video.currentTime = time;
    }
    setCurrentTime(time);
    setIsDragging(false);
    revealControls();
  };

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

  const handleMouseMove = () => {
    if (isTouchRef.current) return;
    revealControls();
  };

  const handleMouseLeave = () => {
    if (isTouchRef.current || !isPlaying || isQualityMenuOpen || isDragging) {
      return;
    }
    clearHideTimer();
    setShowControls(false);
  };

  const handleSurfaceTouchStart = () => {
    isTouchRef.current = true;
  };

  const handleSurfaceClick = () => {
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

  const displayedTime = isDragging ? dragTime : currentTime;
  const progressPercent = duration > 0 ? (displayedTime / duration) * 100 : 0;
  const bufferedPercent = duration > 0 ? (buffered / duration) * 100 : 0;
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
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleSurfaceTouchStart}
      onClick={handleSurfaceClick}
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
          if (!isDragging) {
            setCurrentTime(curr);
          }
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

      <div
        className={`absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/75 transition-opacity duration-200 flex flex-col justify-between ${controlsVisible
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none"
          }`}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="px-4 sm:px-5 pt-3.5 sm:pt-4 pb-4 flex items-center justify-between gap-3"
        >
          <p className="text-xs sm:text-sm md:text-base font-bold text-white truncate drop-shadow">
            {title}
          </p>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-white/10 text-zinc-200 border border-white/15 shrink-0">
            {activeQualityLabel}
          </span>
        </div>

        <div className="flex items-center justify-center gap-8 sm:gap-12">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              skipBy(-SEEK_STEP_SECONDS);
            }}
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black/65 hover:bg-black/85 text-white border border-white/20 flex flex-col items-center justify-center transition active:scale-90 cursor-pointer"
            aria-label="Tua lùi 10 giây"
          >
            <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-[9px] font-bold leading-none mt-0.5">
              10s
            </span>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              togglePlay();
            }}
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#7950f2] hover:bg-[#845ef7] text-white border border-purple-300/40 shadow-2xl shadow-purple-600/50 flex items-center justify-center transition active:scale-90 cursor-pointer"
            aria-label={isPlaying ? "Tạm dừng" : "Phát"}
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 sm:w-7 sm:h-7 fill-white" />
            ) : (
              <Play className="w-6 h-6 sm:w-7 sm:h-7 fill-white ml-0.5" />
            )}
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              skipBy(SEEK_STEP_SECONDS);
            }}
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black/65 hover:bg-black/85 text-white border border-white/20 flex flex-col items-center justify-center transition active:scale-90 cursor-pointer"
            aria-label="Tua tới 10 giây"
          >
            <RotateCw className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-[9px] font-bold leading-none mt-0.5">
              10s
            </span>
          </button>
        </div>

        <div
          onClick={(e) => e.stopPropagation()}
          className="px-3.5 sm:px-5 pb-3 sm:pb-4 pt-3 space-y-2"
        >
          <div
            ref={progressBarRef}
            onPointerDown={handleProgressPointerDown}
            onPointerMove={handleProgressPointerMove}
            onPointerUp={handleProgressPointerUp}
            onPointerLeave={() => {
              if (!isDragging) setHoverTime(null);
            }}
            className="group/scrub relative flex items-center h-5 cursor-pointer touch-none"
          >
            {hoverTime !== null && duration > 0 && (
              <div
                className="absolute -top-7 -translate-x-1/2 px-2 py-0.5 rounded bg-black/90 text-white font-mono text-[11px] font-bold border border-white/15 pointer-events-none shadow-md"
                style={{
                  left: `${Math.min(Math.max(hoverPercent, 4), 96)}%`,
                }}
              >
                {formatTime(hoverTime)}
              </div>
            )}

            <div className="relative w-full h-1 group-hover/scrub:h-1.5 transition-all rounded-full bg-white/25 overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-white/35"
                style={{ width: `${Math.min(100, bufferedPercent)}%` }}
              />
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#7950f2] to-emerald-400"
                style={{ width: `${Math.min(100, progressPercent)}%` }}
              />
            </div>

            <div
              className={`absolute -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-white ring-2 ring-[#7950f2] shadow-lg transition-transform pointer-events-none ${isDragging
                ? "scale-125"
                : "scale-90 group-hover/scrub:scale-110"
                }`}
              style={{ left: `${Math.min(100, Math.max(0, progressPercent))}%` }}
            />
          </div>

          <div className="flex items-center justify-between gap-2 text-xs sm:text-sm text-zinc-200">
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={togglePlay}
                className="p-1.5 rounded-lg hover:bg-white/10 text-white transition cursor-pointer"
                aria-label={isPlaying ? "Tạm dừng" : "Phát"}
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                ) : (
                  <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                )}
              </button>

              <div className="group/vol flex items-center">
                <button
                  type="button"
                  onClick={toggleMute}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-white transition cursor-pointer"
                  aria-label={isMuted ? "Bật tiếng" : "Tắt tiếng"}
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 text-rose-400" />
                  ) : (
                    <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                </button>
                <div className="hidden sm:flex items-center overflow-hidden w-0 opacity-0 group-hover/vol:w-20 group-hover/vol:opacity-100 group-hover/vol:ml-1.5 transition-all duration-200">
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    aria-label="Âm lượng"
                    className="w-20 h-1 accent-[#7950f2] cursor-pointer"
                  />
                </div>
              </div>

              <span className="font-mono text-[11px] sm:text-xs text-zinc-300 tabular-nums">
                {formatTime(displayedTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="relative flex items-center gap-1.5 sm:gap-2.5">
              <button
                type="button"
                onClick={cyclePlaybackRate}
                className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[11px] sm:text-xs font-bold text-zinc-100 transition cursor-pointer"
                title="Tốc độ phát"
              >
                {playbackRate}x
              </button>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsQualityMenuOpen((prev) => !prev)}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[11px] sm:text-xs font-bold text-zinc-100 transition cursor-pointer"
                  title="Chất lượng video"
                >
                  <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">
                    {selectedQuality === -1
                      ? "Auto"
                      : qualityLevels.find((q) => q.index === selectedQuality)
                        ?.label || "HD"}
                  </span>
                </button>

                {isQualityMenuOpen && (
                  <div className="absolute bottom-full right-0 mb-2 w-44 rounded-xl bg-[#121420]/95 backdrop-blur-md border border-purple-500/30 shadow-2xl py-1.5 z-50 text-xs">
                    <div className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 border-b border-zinc-800">
                      Chất lượng phát
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSelectQuality(-1)}
                      className="w-full px-3 py-2 flex items-center justify-between hover:bg-white/10 text-left font-semibold text-zinc-100 cursor-pointer"
                    >
                      <span>
                        Auto
                        {activeAutoHeight ? ` (${activeAutoHeight}p)` : ""}
                      </span>
                      {selectedQuality === -1 && (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      )}
                    </button>
                    {qualityLevels.map((lvl) => (
                      <button
                        key={lvl.index}
                        type="button"
                        onClick={() => handleSelectQuality(lvl.index)}
                        className="w-full px-3 py-2 flex items-center justify-between hover:bg-white/10 text-left font-semibold text-zinc-100 cursor-pointer"
                      >
                        <span>{lvl.label}</span>
                        {selectedQuality === lvl.index && (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={toggleFullscreen}
                className="p-1.5 rounded-lg hover:bg-white/10 text-white transition cursor-pointer"
                aria-label="Toàn màn hình"
              >
                {isFullscreen ? (
                  <Minimize className="w-4 h-4 sm:w-5 sm:h-5" />
                ) : (
                  <Maximize className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
