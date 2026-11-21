import { useEffect, useRef, useState } from "react";
import { formatTime } from "@/utils/date-time";
import { useHlsEngine } from "./useHlsEngine";

export function PlayerSeekPreview({
  src,
  time,
  percent,
}: {
  src: string;
  time: number;
  percent: number;
}) {
  const [requestedTime, setRequestedTime] = useState<number | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setRequestedTime(time), 160);
    return () => clearTimeout(timer);
  }, [time]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute bottom-full z-20 mb-2 w-40 max-w-full -translate-x-1/2 text-center"
      style={{
        left: `clamp(min(5rem, 50%), ${percent}%, calc(100% - min(5rem, 50%)))`,
      }}
    >
      {requestedTime !== null && (
        <PreviewVideo src={src} time={requestedTime} cursorTime={time} />
      )}
      <span className="inline-block rounded border border-white/15 bg-black/90 px-2 py-0.5 font-mono text-[11px] font-bold text-white shadow-md">
        {formatTime(time)}
      </span>
    </div>
  );
}

function PreviewVideo({
  src,
  time,
  cursorTime,
}: {
  src: string;
  time: number;
  cursorTime: number;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [initialTime] = useState(time);
  const [frameTime, setFrameTime] = useState<number | null>(null);
  const { hasError, setHasError } = useHlsEngine(videoRef, src, initialTime);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || video.readyState < 1 || !Number.isFinite(video.duration))
      return;
    video.currentTime = Math.min(time, Math.max(0, video.duration - 0.05));
  }, [time]);

  const ready = frameTime !== null && Math.abs(frameTime - cursorTime) < 0.75;

  return (
    <div
      className={
        hasError
          ? "hidden"
          : "relative mb-1 aspect-video overflow-hidden rounded-md border border-white/20 bg-zinc-950 shadow-lg"
      }
    >
      <video
        ref={videoRef}
        muted
        playsInline
        preload="metadata"
        className={`size-full object-contain ${ready ? "opacity-100" : "opacity-0"}`}
        onLoadedMetadata={(event) => {
          const video = event.currentTarget;
          if (Number.isFinite(video.duration)) {
            video.currentTime = Math.min(
              time,
              Math.max(0, video.duration - 0.05),
            );
          }
        }}
        onSeeking={() => setFrameTime(null)}
        onLoadedData={(event) => {
          if (!event.currentTarget.seeking)
            setFrameTime(event.currentTarget.currentTime);
        }}
        onSeeked={(event) => setFrameTime(event.currentTarget.currentTime)}
        onError={() => setHasError(true)}
      />
      {!ready && (
        <div className="absolute inset-0 grid place-items-center text-[10px] text-zinc-300">
          Đang tải ảnh…
        </div>
      )}
    </div>
  );
}
