import { useEffect, useRef, useState } from "react";
import type { PlaybackCheckpoint } from "@/components/player/types";
import { useWatchStore } from "@/store/useWatchStore";
import type { StreamServer } from "@/types/stream";

export function useWatchSource(animeId: number, episode: number) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [attempt, setAttempt] = useState(0);
  const [saved, setSaved] = useState<{
    key: string;
    checkpoint: PlaybackCheckpoint;
  } | null>(null);
  const lastPosition = useRef<{ key: string; checkpoint: PlaybackCheckpoint }>(
    null,
  );
  const key = `${animeId}:${episode}`;

  useEffect(() => {
    if (saved && saved.key !== key) setSaved(null);
    if (lastPosition.current?.key !== key) lastPosition.current = null;
  }, [key, saved]);

  function recordPosition(video: HTMLVideoElement) {
    if (!Number.isFinite(video.duration) || video.duration <= 0 || video.error)
      return;
    lastPosition.current = {
      key,
      checkpoint: {
        time: video.currentTime,
        duration: video.duration,
        wasPlaying: !video.paused && !video.ended,
      },
    };
  }

  function switchSource(action: () => void) {
    const video = videoRef.current;
    if (video) recordPosition(video);
    if (lastPosition.current?.key === key) setSaved(lastPosition.current);
    useWatchStore.getState().setNextEpisodeCountdown(null);
    action();
  }

  return {
    videoRef,
    recordPosition,
    attempt,
    checkpoint: saved?.key === key ? saved.checkpoint : undefined,
    retry: () => switchSource(() => setAttempt((previous) => previous + 1)),
    selectServer: (server: StreamServer) => {
      const watch = useWatchStore.getState();
      if (watch.activeServer?.id !== server.id) {
        switchSource(() => watch.selectServer(server));
      }
    },
    setPlayerMode: (mode: "hls" | "iframe") => {
      const watch = useWatchStore.getState();
      if (watch.playerMode !== mode)
        switchSource(() => watch.setPlayerMode(mode));
    },
    enableTrailerMode: () =>
      switchSource(useWatchStore.getState().enableTrailerMode),
  };
}
