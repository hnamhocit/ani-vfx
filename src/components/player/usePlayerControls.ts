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
  hasError,
  isPlaying,
  isQualityMenuOpen,
  isDragging,
  setCurrentTime,
}: {
  videoRef: RefObject<HTMLVideoElement | null>;
  containerRef: RefObject<HTMLFieldSetElement | null>;
  hasError: boolean;
  isPlaying: boolean;
  isQualityMenuOpen: boolean;
  isDragging: boolean;
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
    hideTimerRef.current = setTimeout(() => {
      const video = videoRef.current;
      if (
        video &&
        !video.paused &&
        !video.ended &&
        !isQualityMenuOpen &&
        !isDragging &&
        !containerRef.current?.matches(":focus-visible, :has(:focus-visible)")
      ) {
        setShowControls(false);
      }
    }, HIDE_DELAY_MS);
  }, [clearHideTimer, containerRef, videoRef, isQualityMenuOpen, isDragging]);

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
    const onFsChange = () =>
      setIsFullscreen(document.fullscreenElement === containerRef.current);
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, [containerRef]);

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
    const container = containerRef.current;
    if (!container?.requestFullscreen) return;
    if (!document.fullscreenElement) {
      await container.requestFullscreen().catch(() => {});
    } else {
      await document.exitFullscreen().catch(() => {});
    }
    revealControls();
  }, [containerRef, revealControls]);

  useEffect(() => {
    if (hasError) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        e.defaultPrevented ||
        e.altKey ||
        e.ctrlKey ||
        e.metaKey ||
        target?.closest(
          "input, textarea, select, button, a, [contenteditable]:not([contenteditable=false]), [role=slider]",
        )
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
        handleToggleMute();
      } else if (e.key.toLowerCase() === "f") {
        e.preventDefault();
        toggleFullscreen();
      }
    };
    const container = containerRef.current;
    container?.addEventListener("keydown", handleKeyDown);
    return () => container?.removeEventListener("keydown", handleKeyDown);
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
    toggleMute: handleToggleMute,
    handleVolumeChange,
    cyclePlaybackRate,
    toggleFullscreen,
  };
}
