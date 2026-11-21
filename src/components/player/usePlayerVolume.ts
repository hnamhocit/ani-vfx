import { type RefObject, useLayoutEffect } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface PlayerVolume {
  volume: number;
  isMuted: boolean;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
}

const usePlayerVolumeStore = create<PlayerVolume>()(
  persist(
    (set) => ({
      volume: 1,
      isMuted: false,
      setVolume: (volume) =>
        set((state) => ({
          volume: volume > 0 ? volume : state.volume,
          isMuted: volume === 0,
        })),
      toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
    }),
    { name: "anivfx-player-volume" },
  ),
);

export function usePlayerVolume(videoRef: RefObject<HTMLVideoElement | null>) {
  const volume = usePlayerVolumeStore((state) => state.volume);
  const isMuted = usePlayerVolumeStore((state) => state.isMuted);
  const setVolume = usePlayerVolumeStore((state) => state.setVolume);
  const toggleMute = usePlayerVolumeStore((state) => state.toggleMute);

  useLayoutEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = volume;
    video.muted = isMuted;
  }, [videoRef, volume, isMuted]);

  return { volume, isMuted, setVolume, toggleMute };
}
