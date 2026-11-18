import Hls from "hls.js";
import { usePathname } from "next/navigation";
import { type RefObject, useCallback, useEffect, useRef, useState } from "react";
import type { QualityOption } from "./types";

export function useHlsEngine(
  videoRef: RefObject<HTMLVideoElement | null>,
  src?: string,
) {
  const pathname = usePathname();
  const hlsRef = useRef<Hls | null>(null);

  const [hasError, setHasError] = useState(false);
  const [qualityLevels, setQualityLevels] = useState<QualityOption[]>([]);
  const [selectedQuality, setSelectedQuality] = useState<number>(-1);
  const [activeAutoHeight, setActiveAutoHeight] = useState<number | null>(null);

  const disposeMedia = useCallback(() => {
    if (hlsRef.current) {
      hlsRef.current.stopLoad();
      hlsRef.current.detachMedia();
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    const video = videoRef.current;
    if (video) {
      video.pause();
      video.removeAttribute("src");
      video.load();
    }
  }, [videoRef]);

  useEffect(() => {
    return () => {
      disposeMedia();
    };
  }, [disposeMedia, pathname]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    setHasError(false);
    setQualityLevels([]);
    setSelectedQuality(-1);
    setActiveAutoHeight(null);

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

        const unique = mapped.filter(
          (item, pos, arr) =>
            arr.findIndex((other) => other.label === item.label) === pos,
        );
        setQualityLevels(unique);
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
      disposeMedia();
    };
  }, [src, videoRef, disposeMedia]);

  const selectQuality = useCallback((levelIndex: number) => {
    setSelectedQuality(levelIndex);
    if (hlsRef.current) {
      hlsRef.current.currentLevel = levelIndex;
    }
  }, []);

  return {
    hasError,
    setHasError,
    qualityLevels,
    selectedQuality,
    activeAutoHeight,
    selectQuality,
  };
}
