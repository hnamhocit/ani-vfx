import Hls from "hls.js";
import {
  type RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import type { QualityOption } from "./types";

export function useHlsEngine(
  videoRef: RefObject<HTMLVideoElement | null>,
  src?: string,
) {
  const hlsRef = useRef<Hls | null>(null);

  const [hasError, setHasError] = useState(false);
  const [qualityLevels, setQualityLevels] = useState<QualityOption[]>([]);
  const [selectedQuality, setSelectedQuality] = useState<number>(-1);
  const [activeAutoHeight, setActiveAutoHeight] = useState<number | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });
      hlsRef.current = hls;

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
      hls.loadSource(src);
      hls.attachMedia(video);
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
    } else {
      setHasError(true);
    }

    return () => {
      const hls = hlsRef.current;
      hlsRef.current = null;
      hls?.destroy();
      video.pause();
      video.removeAttribute("src");
      video.load();
    };
  }, [src, videoRef]);

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
