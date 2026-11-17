"use client";

import {
  AlertCircle,
  Check,
  ChevronRight,
  ExternalLink,
  Film,
  Maximize,
  Minimize,
  Pause,
  PictureInPicture,
  Play,
  RotateCcw,
  RotateCw,
  Settings,
  Volume2,
  VolumeX,
} from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";

interface CustomVideoPlayerProps {
  // Video sources
  src?: string | null; // HLS .m3u8 or MP4 direct URL
  embedUrl?: string | null; // Iframe embed fallback (Consumet / YouTube)
  isTrailer?: boolean;
  youtubeId?: string | null;
  title: string;
  poster?: string;

  // Progress tracking
  initialTime?: number;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  onEnded?: () => void;

  // Auto-next episode countdown
  nextEpisodeCountdown?: number | null;
  onPlayNextNow?: () => void;
  onCancelAutoNext?: () => void;

  // Resume playback prompt
  resumeTime?: number;
  onResumePlay?: () => void;
  onDismissResume?: () => void;

  // Error handling
  onErrorRetry?: () => void;
}

export function CustomVideoPlayer({
  src,
  embedUrl,
  isTrailer = false,
  youtubeId,
  title,
  poster,
  initialTime = 0,
  onTimeUpdate,
  onEnded,
  nextEpisodeCountdown,
  onPlayNextNow,
  onCancelAutoNext,
  resumeTime = 0,
  onResumePlay,
  onDismissResume,
  onErrorRetry,
}: CustomVideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [bufferedTime, setBufferedTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverPos, setHoverPos] = useState<number>(0);
  const [hasError, setHasError] = useState(false);

  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize HLS if src is an m3u8 URL
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    let hlsInstance: import("hls.js").default | null = null;

    setHasError(false);
    setCurrentTime(0);

    const isM3u8 = src.includes(".m3u8");

    if (isM3u8) {
      import("hls.js").then(({ default: Hls }) => {
        if (Hls.isSupported()) {
          const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90,
          });
          hlsInstance = hls;
          hls.loadSource(src);
          hls.attachMedia(video);

          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            if (initialTime > 0) {
              video.currentTime = initialTime;
            }
            video.play().catch(() => setIsPlaying(false));
          });

          hls.on(Hls.Events.ERROR, (_, data) => {
            if (data.fatal) {
              console.warn("HLS fatal error in CustomVideoPlayer:", data);
              setHasError(true);
            }
          });
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = src;
          if (initialTime > 0) video.currentTime = initialTime;
          video.play().catch(() => setIsPlaying(false));
        }
      });
    } else {
      video.src = src;
      if (initialTime > 0) video.currentTime = initialTime;
      video.play().catch(() => setIsPlaying(false));
    }

    return () => {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    };
  }, [src, initialTime]);

  // Pause playback when user switches browser tab, and clean up audio/video on unmount
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Pause native HTML5 video if playing
        if (videoRef.current && !videoRef.current.paused) {
          videoRef.current.pause();
          setIsPlaying(false);
        }
        // Send pause command to iframe (YouTube/Embed)
        if (iframeRef.current?.contentWindow) {
          iframeRef.current.contentWindow.postMessage(
            JSON.stringify({ event: "command", func: "pauseVideo", args: "" }),
            "*",
          );
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      // Clean up HTML5 video on unmount
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.removeAttribute("src");
        videoRef.current.load();
      }
      // Clean up iframe on unmount
      if (iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: "command", func: "stopVideo", args: "" }),
          "*",
        );
      }
    };
  }, []);

  // Autohide controls on mouse idle
  const handleMouseMove = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
        setShowSpeedMenu(false);
      }, 2600);
    }
  }, [isPlaying]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {});
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    video.currentTime = pos * duration;
    setCurrentTime(video.currentTime);
  };

  const handleTimelineHover = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setHoverPos(e.clientX - rect.left);
    setHoverTime(pos * duration);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number.parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
    }
    setIsMuted(val === 0);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const newMuted = !isMuted;
    videoRef.current.muted = newMuted;
    setIsMuted(newMuted);
  };

  const changePlaybackRate = (rate: number) => {
    if (!videoRef.current) return;
    videoRef.current.playbackRate = rate;
    setPlaybackRate(rate);
    setShowSpeedMenu(false);
  };

  const skipTime = (seconds: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(
      0,
      Math.min(duration, videoRef.current.currentTime + seconds),
    );
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current
        .requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch(() => {});
    } else {
      document
        .exitFullscreen()
        .then(() => setIsFullscreen(false))
        .catch(() => {});
    }
  };

  const togglePiP = async () => {
    const video = videoRef.current;
    if (!video) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await video.requestPictureInPicture();
      }
    } catch (err) {
      console.warn("PiP error:", err);
    }
  };

  // Format seconds to mm:ss or hh:mm:ss
  const formatTime = (time: number) => {
    if (Number.isNaN(time) || time < 0) return "00:00";
    const h = Math.floor(time / 3600);
    const m = Math.floor((time % 3600) / 60);
    const s = Math.floor(time % 60);
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    }
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Keyboard controls (Space, K, Left, Right, Up, Down, F, M)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if focus is in an input field
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;

      if (e.code === "Space" || e.key === "k" || e.key === "K") {
        e.preventDefault();
        togglePlay();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        skipTime(-5);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        skipTime(5);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setVolume((v) => {
          const next = Math.min(1, v + 0.1);
          if (videoRef.current) videoRef.current.volume = next;
          return next;
        });
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setVolume((v) => {
          const next = Math.max(0, v - 0.1);
          if (videoRef.current) videoRef.current.volume = next;
          return next;
        });
      } else if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === "m" || e.key === "M") {
        e.preventDefault();
        toggleMute();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  // Calculate safe YouTube embed URL to completely prevent Error 153
  const getSafeEmbedUrl = () => {
    if (youtubeId) {
      return `https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&enablejsapi=1&rel=0&modestbranding=1`;
    }
    if (embedUrl) {
      try {
        const url = new URL(embedUrl);
        url.searchParams.set("enablejsapi", "1");
        return url.toString();
      } catch {
        return embedUrl;
      }
    }
    return null;
  };

  const safeEmbedUrl = getSafeEmbedUrl();

  // If we have an iframe embed (or trailer mode)
  if (!src || hasError) {
    if (safeEmbedUrl) {
      return (
        <div
          ref={containerRef}
          className="relative w-full aspect-video rounded-3xl overflow-hidden bg-black border border-purple-500/30 shadow-2xl group"
        >
          <iframe
            ref={iframeRef}
            src={safeEmbedUrl}
            title={title}
            className="w-full h-full aspect-video border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />

          {/* Top Info Badge */}
          <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
            <div className="px-3 py-1.5 rounded-xl bg-black/80 backdrop-blur-md border border-purple-500/40 text-purple-200 text-xs font-bold flex items-center gap-1.5 shadow-lg">
              <Film className="w-3.5 h-3.5 text-purple-400" />
              <span>
                {isTrailer ? "Official Trailer" : "Stream Server (Embed)"}
              </span>
            </div>
            {youtubeId && (
              <a
                href={`https://www.youtube.com/watch?v=${youtubeId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-xl bg-red-600/30 hover:bg-red-600/50 border border-red-500/40 text-red-200 text-xs font-bold flex items-center gap-1.5 shadow-lg transition"
                title="Mở trực tiếp trên YouTube"
              >
                <span>Mở YouTube</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="relative w-full aspect-video rounded-3xl overflow-hidden bg-[#0c0d15] border border-purple-500/30 flex flex-col items-center justify-center p-6 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-amber-400" />
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-white">
            Chưa thể tải nguồn video trực tiếp
          </h3>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-md">
            Máy chủ stream có thể đang bận hoặc bị chặn. Bạn có thể thử kết nối
            lại hoặc chuyển sang máy chủ khác.
          </p>
        </div>
        {onErrorRetry && (
          <button
            type="button"
            onClick={onErrorRetry}
            className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition cursor-pointer"
          >
            Thử kết nối lại
          </button>
        )}
      </div>
    );
  }

  // Native HTML5 Video with Full Custom AniVFX Controls
  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      className="relative w-full aspect-video rounded-3xl overflow-hidden bg-black border border-purple-500/30 shadow-2xl group select-none"
    >
      <video
        ref={videoRef}
        poster={poster}
        playsInline
        autoPlay
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={() => {
          if (!videoRef.current) return;
          const curr = videoRef.current.currentTime;
          const dur = videoRef.current.duration || 0;
          setCurrentTime(curr);
          setDuration(dur);
          onTimeUpdate?.(curr, dur);

          // Update buffered bar
          if (videoRef.current.buffered.length > 0) {
            setBufferedTime(
              videoRef.current.buffered.end(
                videoRef.current.buffered.length - 1,
              ),
            );
          }
        }}
        onEnded={() => {
          setIsPlaying(false);
          onEnded?.();
        }}
        onClick={togglePlay}
        className="w-full h-full aspect-video bg-black object-contain cursor-pointer"
      >
        <track kind="captions" />
      </video>

      {/* Resume Playback Prompt Banner */}
      {resumeTime > 0 && (
        <div className="absolute top-4 left-4 z-30 flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-[#121422]/95 border border-purple-500/50 backdrop-blur-md shadow-2xl animate-in fade-in slide-in-from-top-2 duration-300">
          <p className="text-xs font-semibold text-zinc-200">
            Bạn đã xem tới{" "}
            <strong className="text-purple-300">
              {formatTime(resumeTime)}
            </strong>
          </p>
          <button
            type="button"
            onClick={onResumePlay}
            className="px-3 py-1 rounded-xl bg-[#7950f2] hover:bg-[#845ef7] text-white text-xs font-bold transition shadow-md cursor-pointer"
          >
            Xem tiếp
          </button>
          <button
            type="button"
            onClick={onDismissResume}
            className="text-xs text-zinc-400 hover:text-white px-1.5 py-1 cursor-pointer"
          >
            Bỏ qua
          </button>
        </div>
      )}

      {/* Center Big Play Button (when paused) */}
      {!isPlaying && (
        <button
          type="button"
          onClick={togglePlay}
          className="absolute inset-0 m-auto w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-purple-600/90 hover:bg-purple-500 text-white flex items-center justify-center shadow-2xl shadow-purple-600/60 backdrop-blur-md transition-all hover:scale-110 active:scale-95 cursor-pointer z-20"
          aria-label="Phát video"
        >
          <Play className="w-8 h-8 sm:w-9 sm:h-9 fill-white ml-1" />
        </button>
      )}

      {/* Next Episode Auto Countdown Overlay */}
      {nextEpisodeCountdown !== null && nextEpisodeCountdown !== undefined && (
        <div className="absolute inset-0 z-30 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 space-y-4 animate-in fade-in duration-200">
          <div className="w-16 h-16 rounded-full border-4 border-purple-500/30 border-t-purple-400 flex items-center justify-center text-xl font-black text-white animate-spin">
            <span className="animate-none">{nextEpisodeCountdown}</span>
          </div>
          <div className="text-center space-y-1">
            <h4 className="text-lg font-bold text-white">
              Tập tiếp theo sẽ phát sau {nextEpisodeCountdown}s
            </h4>
            <p className="text-xs text-zinc-400">
              Tự động chuyển tập phim liền mạch
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onPlayNextNow}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/40 flex items-center gap-1.5 transition cursor-pointer"
            >
              <span>Phát ngay</span>
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onCancelAutoNext}
              className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-xs transition cursor-pointer"
            >
              Hủy
            </button>
          </div>
        </div>
      )}

      {/* Custom Controls Bottom Bar (Autohides during playback) */}
      <div
        className={`absolute bottom-0 inset-x-0 z-20 bg-gradient-to-t from-black/95 via-black/80 to-transparent p-4 sm:p-5 pt-8 transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Scrubber Progress Bar */}
        <div
          onClick={handleSeek}
          onMouseMove={handleTimelineHover}
          onMouseLeave={() => setHoverTime(null)}
          className="relative w-full h-2 hover:h-3 bg-white/20 rounded-full cursor-pointer mb-3.5 group/timeline transition-all"
        >
          {/* Buffered Progress */}
          <div
            className="absolute top-0 left-0 h-full bg-white/30 rounded-full pointer-events-none transition-all"
            style={{
              width: `${duration > 0 ? (bufferedTime / duration) * 100 : 0}%`,
            }}
          />

          {/* Current Played Progress */}
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 to-[#9775fa] rounded-full pointer-events-none"
            style={{
              width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`,
            }}
          >
            {/* Scrubber Thumb */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white shadow-md scale-0 group-hover/timeline:scale-100 transition-transform" />
          </div>

          {/* Hover Time Tooltip */}
          {hoverTime !== null && (
            <div
              className="absolute -top-8 px-2 py-0.5 rounded-md bg-black/90 text-white text-[10px] font-bold pointer-events-none border border-white/20 -translate-x-1/2"
              style={{ left: `${hoverPos}px` }}
            >
              {formatTime(hoverTime)}
            </div>
          )}
        </div>

        {/* Action Controls Row */}
        <div className="flex items-center justify-between text-white text-xs sm:text-sm">
          {/* Left Controls: Play, Skip, Volume, Time */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={togglePlay}
              className="p-1.5 hover:text-purple-300 transition cursor-pointer"
              aria-label={isPlaying ? "Tạm dừng" : "Phát"}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current" />
              )}
            </button>

            <button
              type="button"
              onClick={() => skipTime(-10)}
              className="p-1.5 hover:text-purple-300 transition cursor-pointer hidden sm:block"
              title="Lùi 10 giây"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => skipTime(10)}
              className="p-1.5 hover:text-purple-300 transition cursor-pointer hidden sm:block"
              title="Tua 10 giây"
            >
              <RotateCw className="w-4 h-4" />
            </button>

            {/* Volume */}
            <div className="flex items-center gap-1.5 group/volume">
              <button
                type="button"
                onClick={toggleMute}
                className="p-1.5 hover:text-purple-300 transition cursor-pointer"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-5 h-5 text-red-400" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-14 sm:w-20 h-1.5 accent-purple-500 bg-white/30 rounded-lg cursor-pointer"
              />
            </div>

            {/* Elapsed / Total Time */}
            <div className="text-xs font-semibold text-zinc-300 pl-1">
              <span>{formatTime(currentTime)}</span>
              <span className="text-zinc-500 mx-1">/</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Right Controls: Speed, PiP, Fullscreen */}
          <div className="flex items-center gap-2">
            {/* Playback Speed Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowSpeedMenu((prev) => !prev)}
                className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold transition cursor-pointer flex items-center gap-1"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>{playbackRate}x</span>
              </button>

              {showSpeedMenu && (
                <div className="absolute right-0 bottom-full mb-2 bg-[#121422] border border-purple-500/40 rounded-xl p-1 shadow-2xl z-40 min-w-[80px]">
                  {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                    <button
                      key={rate}
                      type="button"
                      onClick={() => changePlaybackRate(rate)}
                      className={`w-full px-3 py-1.5 rounded-lg text-left text-xs font-semibold flex items-center justify-between cursor-pointer ${
                        playbackRate === rate
                          ? "bg-purple-600 text-white"
                          : "text-zinc-300 hover:bg-white/10"
                      }`}
                    >
                      <span>{rate}x</span>
                      {playbackRate === rate && (
                        <Check className="w-3 h-3 ml-1" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* PiP */}
            <button
              type="button"
              onClick={togglePiP}
              className="p-1.5 hover:text-purple-300 transition cursor-pointer hidden sm:block"
              title="Hình trong hình (PiP)"
            >
              <PictureInPicture className="w-4 h-4" />
            </button>

            {/* Fullscreen */}
            <button
              type="button"
              onClick={toggleFullscreen}
              className="p-1.5 hover:text-purple-300 transition cursor-pointer"
              title={isFullscreen ? "Thoát toàn màn hình" : "Toàn màn hình"}
            >
              {isFullscreen ? (
                <Minimize className="w-5 h-5" />
              ) : (
                <Maximize className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
