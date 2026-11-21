import {
  type RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { usePlayerVolume } from "./usePlayerVolume";

const HIDE_DELAY_MS = 1800;
const SEEK_STEP_SECONDS = 10;

export function usePlayerControls({
  videoRef,
  containerRef,
  fullscreenRef,
  hasError,
  isQualityMenuOpen,
  isDragging,
  isPreviewHover,
  setCurrentTime,
}: {
  videoRef: RefObject<HTMLVideoElement | null>;
  containerRef: RefObject<HTMLFieldSetElement | null>;
  fullscreenRef?: RefObject<HTMLElement | null>;
  hasError: boolean;
  isQualityMenuOpen: boolean;
  isDragging: boolean;
  isPreviewHover: boolean;
  setCurrentTime: (time: number) => void;
}) {
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const seekFeedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const { isMuted, volume, setVolume, toggleMute } = usePlayerVolume(videoRef);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [seekFeedback, setSeekFeedback] = useState<string | null>(null);

  const clearHideTimer = useCallback(() => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }, []);

  const scheduleHideControls = useCallback(() => {
    clearHideTimer();
    if (isQualityMenuOpen || isDragging || isPreviewHover) return;
    hideTimerRef.current = setTimeout(() => {
      setShowControls(false);
      hideTimerRef.current = null;
    }, HIDE_DELAY_MS);
  }, [clearHideTimer, isQualityMenuOpen, isDragging, isPreviewHover]);

  const hideControls = useCallback(() => {
    clearHideTimer();
    setShowControls(false);
  }, [clearHideTimer]);

  const revealControls = useCallback(() => {
    setShowControls(true);
    scheduleHideControls();
  }, [scheduleHideControls]);

  useEffect(() => {
    return () => {
      clearHideTimer();
      if (seekFeedbackTimerRef.current)
        clearTimeout(seekFeedbackTimerRef.current);
    };
  }, [clearHideTimer]);

  useEffect(() => {
    revealControls();
  }, [revealControls]);

  useEffect(() => {
    const onFsChange = () =>
      setIsFullscreen(
        document.fullscreenElement ===
          (fullscreenRef?.current ?? containerRef.current),
      );
    onFsChange();
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, [containerRef, fullscreenRef]);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused || video.ended) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
    revealControls();
  }, [videoRef, revealControls]);

  const skipBy = useCallback(
    (delta: number) => {
      const video = videoRef.current;
      if (!video) return;
      if (!Number.isFinite(video.duration)) return;
      const maxDuration = video.duration;
      const nextTime = Math.min(
        Math.max(0, video.currentTime + delta),
        maxDuration,
      );
      video.currentTime = nextTime;
      setCurrentTime(nextTime);
      setSeekFeedback(delta > 0 ? `+${delta}s` : `${delta}s`);
      if (seekFeedbackTimerRef.current)
        clearTimeout(seekFeedbackTimerRef.current);
      seekFeedbackTimerRef.current = setTimeout(
        () => setSeekFeedback(null),
        650,
      );
      revealControls();
    },
    [videoRef, setCurrentTime, revealControls],
  );

  const handleToggleMute = useCallback(() => {
    toggleMute();
    revealControls();
  }, [toggleMute, revealControls]);

  const toggleFullscreen = useCallback(async () => {
    const container = fullscreenRef?.current ?? containerRef.current;
    if (!container?.requestFullscreen) return;
    if (!document.fullscreenElement) {
      await container.requestFullscreen().catch(() => {});
    } else {
      await document.exitFullscreen().catch(() => {});
    }
    revealControls();
  }, [containerRef, fullscreenRef, revealControls]);

  useEffect(() => {
    if (hasError) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      const container = containerRef.current;
      const target = e.target instanceof Element ? e.target : null;
      if (
        !container ||
        e.defaultPrevented ||
        e.altKey ||
        e.ctrlKey ||
        e.metaKey ||
        target?.closest(
          "input, textarea, select, [contenteditable]:not([contenteditable=false]), [role=slider], [role=dialog], [role=menu]",
        )
      ) {
        return;
      }
      const inside = container.contains(target);
      const { top, bottom } = container.getBoundingClientRect();
      if (!inside && (bottom <= 0 || top >= window.innerHeight)) return;

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        skipBy(-SEEK_STEP_SECONDS);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        skipBy(SEEK_STEP_SECONDS);
      } else if (e.key === " " && inside && !target?.closest("button, a")) {
        e.preventDefault();
        togglePlay();
      } else if (e.key.toLowerCase() === "m" && inside) {
        e.preventDefault();
        handleToggleMute();
      } else if (e.key.toLowerCase() === "f" && inside) {
        e.preventDefault();
        toggleFullscreen();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    hasError,
    containerRef,
    skipBy,
    togglePlay,
    handleToggleMute,
    toggleFullscreen,
  ]);

  const handleVolumeChange = (volume: number) => {
    setVolume(volume);
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

  return {
    clearHideTimer,
    hideControls,
    revealControls,
    showControls,
    seekFeedback,
    isMuted,
    volume,
    playbackRate,
    isFullscreen,
    togglePlay,
    skipBy,
    toggleMute: handleToggleMute,
    handleVolumeChange,
    cyclePlaybackRate,
    toggleFullscreen,
  };
}
