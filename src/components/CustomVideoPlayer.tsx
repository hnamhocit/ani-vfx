"use client";

import Hls from "hls.js";
import {
  AlertCircle,
  Maximize,
  Minimize,
  Pause,
  Play,
  RefreshCw,
  RotateCcw,
  RotateCw,
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

const HIDE_DELAY_MS = 1500;

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
  const hlsRef = useRef<Hls | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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
      if (video && !video.paused && !video.ended) {
        setShowControls(false);
      }
    }, HIDE_DELAY_MS);
  }, [clearHideTimer]);

  const revealControls = useCallback(() => {
    setShowControls(true);
    scheduleHideControls();
  }, [scheduleHideControls]);

  useEffect(() => {
    return () => clearHideTimer();
  }, [clearHideTimer]);

  useEffect(() => {
    if (!isPlaying) {
      clearHideTimer();
      setShowControls(true);
    } else {
      scheduleHideControls();
    }
  }, [isPlaying, clearHideTimer, scheduleHideControls]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    setHasError(false);
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
      revealControls();
    },
    [duration, revealControls],
  );

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const nextTime = Number(e.target.value);
    video.currentTime = nextTime;
    setCurrentTime(nextTime);
    revealControls();
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
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

  const toggleFullscreen = async () => {
    const container = containerRef.current;
    if (!container) return;
    if (!document.fullscreenElement) {
      await container.requestFullscreen().catch(() => { });
    } else {
      await document.exitFullscreen().catch(() => { });
    }
    revealControls();
  };

  const handleSurfaceTouchStart = () => {
    isTouchRef.current = true;
  };

  const handleSurfaceClick = () => {
    if (isTouchRef.current) {
      if (showControls && isPlaying) {
        clearHideTimer();
        setShowControls(false);
      } else {
        revealControls();
      }
      return;
    }
    togglePlay();
  };

  const handleMouseLeave = () => {
    if (isTouchRef.current || !isPlaying) return;
    clearHideTimer();
    setShowControls(false);
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

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const bufferedPercent = duration > 0 ? (buffered / duration) * 100 : 0;
  const controlsVisible = showControls || !isPlaying;

  return (
    <div
      ref={containerRef}
      onTouchStart={handleSurfaceTouchStart}
      onClick={handleSurfaceClick}
      onMouseLeave={handleMouseLeave}
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
          setCurrentTime(curr);
          if (dur > 0) setDuration(dur);
          if (video.buffered.length > 0) {
            setBuffered(video.buffered.end(video.buffered.length - 1));
          }
          onTimeUpdate?.(curr, dur);
        }}
        onError={() => setHasError(true)}
        className="w-full h-full object-contain"
      />

      <div
        className={`absolute inset-0 bg-black/45 backdrop-blur-[1px] transition-opacity duration-150 flex flex-col justify-between ${controlsVisible
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
          }`}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="px-3.5 sm:px-5 pt-3 sm:pt-4 pb-6 bg-gradient-to-b from-black/80 to-transparent"
        >
          <p className="text-xs sm:text-sm font-bold text-white truncate drop-shadow">
            {title}
          </p>
        </div>

        <div className="flex items-center justify-center gap-7 sm:gap-12">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              skipBy(-10);
            }}
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black/60 text-white border border-white/20 flex flex-col items-center justify-center transition active:scale-90 cursor-pointer"
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
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#7950f2]/90 text-white border border-purple-300/40 shadow-2xl shadow-purple-600/50 flex items-center justify-center transition active:scale-90 cursor-pointer"
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
              skipBy(10);
            }}
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black/60 text-white border border-white/20 flex flex-col items-center justify-center transition active:scale-90 cursor-pointer"
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
          className="px-3.5 sm:px-5 pb-3 sm:pb-4 pt-6 bg-gradient-to-t from-black/90 via-black/60 to-transparent space-y-2"
        >
          <div className="relative flex items-center h-4">
            <div className="w-full h-1 sm:h-1.5 rounded-full bg-white/20 overflow-hidden">
              <div
                className="h-full bg-white/35"
                style={{ width: `${Math.min(100, bufferedPercent)}%` }}
              />
            </div>
            <div
              className="absolute left-0 h-1 sm:h-1.5 rounded-full bg-gradient-to-r from-[#7950f2] to-emerald-400 pointer-events-none"
              style={{ width: `${Math.min(100, progressPercent)}%` }}
            />
            <input
              type="range"
              min={0}
              max={duration || 0}
              step={0.1}
              value={currentTime}
              onChange={handleSeek}
              aria-label="Thanh tua video"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between gap-2 text-xs sm:text-sm text-zinc-200">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <button
                type="button"
                onClick={togglePlay}
                className="p-1 text-white transition cursor-pointer"
                aria-label={isPlaying ? "Tạm dừng" : "Phát"}
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                ) : (
                  <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                )}
              </button>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={toggleMute}
                  className="p-1 text-white transition cursor-pointer"
                  aria-label={isMuted ? "Bật tiếng" : "Tắt tiếng"}
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 text-rose-400" />
                  ) : (
                    <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  aria-label="Âm lượng"
                  className="hidden sm:block w-16 accent-purple-500 cursor-pointer"
                />
              </div>

              <span className="font-mono text-[11px] sm:text-xs text-zinc-300">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={cyclePlaybackRate}
                className="px-2 py-0.5 rounded-md bg-white/15 text-[11px] sm:text-xs font-bold text-zinc-100 transition cursor-pointer"
                title="Tốc độ phát"
              >
                {playbackRate}x
              </button>

              <button
                type="button"
                onClick={toggleFullscreen}
                className="p-1 text-white transition cursor-pointer"
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
