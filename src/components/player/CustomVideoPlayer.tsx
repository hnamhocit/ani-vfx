"use client";

import { useRef, useState } from "react";
import { EmbedVideoPlayer } from "./EmbedVideoPlayer";
import { PlayerControlsOverlay } from "./PlayerControlsOverlay";
import { PlayerLoading } from "./PlayerLoading";
import type { CustomVideoPlayerProps } from "./types";
import { useHlsEngine } from "./useHlsEngine";
import { usePlayerControls } from "./usePlayerControls";

export function CustomVideoPlayer(props: CustomVideoPlayerProps) {
  if (props.src)
    return <HlsVideoPlayer key={props.src} {...props} src={props.src} />;
  const embedSrc =
    props.embedUrl ||
    (props.youtubeId
      ? `https://www.youtube.com/embed/${props.youtubeId}?autoplay=1&rel=0`
      : null);
  return embedSrc ? (
    <EmbedVideoPlayer
      key={embedSrc}
      src={embedSrc}
      title={props.title ?? "Video Player"}
    />
  ) : null;
}

function HlsVideoPlayer({
  src,
  title = "Video Player",
  poster,
  videoElementRef,
  autoPlay,
  hasPrevEpisode,
  hasNextEpisode,
  onPrevEpisode,
  onNextEpisode,
  onTimeUpdate,
  onEnded,
  checkpoint,
  errorFallback,
}: CustomVideoPlayerProps & { src: string }) {
  const containerRef = useRef<HTMLFieldSetElement | null>(null);
  const internalVideoRef = useRef<HTMLVideoElement | null>(null);
  const videoRef = videoElementRef ?? internalVideoRef;
  const isTouchRef = useRef(false);

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
  const [isQualityMenuOpen, setIsQualityMenuOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragTime, setDragTime] = useState(0);

  const [loading, setLoading] = useState<"initial" | "buffering" | null>(
    "initial",
  );
  const {
    clearHideTimer,
    revealControls,
    showControls,
    setShowControls,
    seekFeedback,
    isMuted,
    volume,
    playbackRate,
    isFullscreen,
    togglePlay,
    skipBy,
    toggleMute,
    handleVolumeChange,
    cyclePlaybackRate,
    toggleFullscreen,
  } = usePlayerControls({
    videoRef,
    containerRef,
    hasError,
    isPlaying,
    isQualityMenuOpen,
    isDragging,
    setCurrentTime,
  });

  const controlsVisible =
    showControls ||
    !isPlaying ||
    isQualityMenuOpen ||
    isDragging ||
    Boolean(loading);
  const activeQualityLabel =
    selectedQuality === -1
      ? activeAutoHeight
        ? `Auto (${activeAutoHeight}p)`
        : "Auto"
      : qualityLevels.find((q) => q.index === selectedQuality)?.label || "HD";

  return (
    <fieldset
      ref={containerRef}
      aria-label={title}
      // biome-ignore lint/a11y/noNoninteractiveTabindex: Focusing the player enables its scoped keyboard shortcuts.
      tabIndex={0}
      onFocus={revealControls}
      onBlur={revealControls}
      onMouseMove={() => {
        if (!isTouchRef.current) revealControls();
      }}
      onMouseEnter={() => {
        if (!isTouchRef.current) revealControls();
      }}
      onMouseLeave={() => {
        if (
          !isTouchRef.current &&
          isPlaying &&
          !isQualityMenuOpen &&
          !isDragging &&
          !containerRef.current?.matches(":focus-visible, :has(:focus-visible)")
        ) {
          clearHideTimer();
          setShowControls(false);
        }
      }}
      onTouchStart={() => {
        isTouchRef.current = true;
      }}
      onClick={(event) => {
        if (
          event.target instanceof Element &&
          event.target.closest("button, input, [role=slider]")
        )
          return;
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
        preload="auto"
        autoPlay={autoPlay && !checkpoint}
        muted={isMuted}
        onLoadedMetadata={(e) => {
          const video = e.currentTarget;
          const duration = Number.isFinite(video.duration) ? video.duration : 0;
          setDuration(duration);
          if (!checkpoint || duration <= 0) return;
          const isCompatible =
            Math.abs(duration - checkpoint.duration) <=
            Math.max(5, duration * 0.03);
          if (
            isCompatible &&
            checkpoint.time > 0 &&
            checkpoint.time < duration
          ) {
            video.currentTime = checkpoint.time;
          }
          if (checkpoint.wasPlaying) void video.play().catch(() => {});
        }}
        onPlay={() => setIsPlaying(true)}
        onPause={(event) => {
          setIsPlaying(false);
          const video = event.currentTarget;
          if (video.readyState >= 2) setLoading(null);
          if (!video.ended)
            onTimeUpdate?.(video.currentTime, video.duration, true);
        }}
        onCanPlay={() => setLoading(null)}
        onPlaying={() => setLoading(null)}
        onWaiting={(event) => {
          if (!event.currentTarget.paused || event.currentTarget.seeking) {
            setLoading((phase) => phase ?? "buffering");
          }
        }}
        onSeeking={(event) => {
          if (event.currentTarget.readyState < 3)
            setLoading((phase) => phase ?? "buffering");
        }}
        onSeeked={(event) => {
          if (event.currentTarget.paused || event.currentTarget.readyState >= 3)
            setLoading(null);
        }}
        onEnded={() => {
          setIsPlaying(false);
          setLoading(null);
          onEnded?.();
        }}
        onTimeUpdate={(e) => {
          const video = e.currentTarget;
          const curr = video.currentTime;
          const dur = Number.isFinite(video.duration) ? video.duration : 0;
          if (!isDragging) setCurrentTime(curr);
          if (dur > 0) setDuration(dur);
          if (!video.ended) onTimeUpdate?.(curr, dur);
        }}
        onProgress={({ currentTarget: video }) => {
          const ranges = video.buffered;
          setBuffered(ranges.length ? ranges.end(ranges.length - 1) : 0);
        }}
        onError={() => setHasError(true)}
        className="w-full h-full object-contain"
      />

      {hasError ? (
        (errorFallback ?? (
          <p
            role="alert"
            className="absolute inset-0 grid place-items-center bg-zinc-950 text-white"
          >
            Không thể phát video
          </p>
        ))
      ) : (
        <>
          {loading && (
            <PlayerLoading>
              {loading === "initial" ? "Đang tải video…" : "Đang tải bộ đệm…"}
            </PlayerLoading>
          )}

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
            onDragCancel={() => {
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
        </>
      )}
    </fieldset>
  );
}
