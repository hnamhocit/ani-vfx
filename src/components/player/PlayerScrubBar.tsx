"use client";

import type React from "react";
import { useCallback, useRef, useState } from "react";
import { formatTime } from "@/utils/date-time";

import { PlayerSeekPreview } from "./PlayerSeekPreview";

interface PlayerScrubBarProps {
  src: string;
  currentTime: number;
  duration: number;
  buffered: number;
  isDragging: boolean;
  dragTime: number;
  onPreviewHover: (hovered: boolean) => void;
  onDragStart: (time: number) => void;
  onDragMove: (time: number) => void;
  onDragEnd: (time: number) => void;
  onDragCancel: () => void;
}

export function PlayerScrubBar({
  src,
  currentTime,
  duration,
  buffered,
  isDragging,
  dragTime,
  onPreviewHover,
  onDragStart,
  onDragMove,
  onDragEnd,
  onDragCancel,
}: PlayerScrubBarProps) {
  const barRef = useRef<HTMLDivElement | null>(null);
  const [hover, setHover] = useState<{ time: number; percent: number } | null>(
    null,
  );

  const getScrubInfo = useCallback(
    (clientX: number) => {
      const bar = barRef.current;
      if (!bar || !duration) return { time: 0, percent: 0 };
      const rect = bar.getBoundingClientRect();
      const ratio = Math.min(
        Math.max(0, (clientX - rect.left) / rect.width),
        1,
      );
      return { time: ratio * duration, percent: ratio * 100 };
    },
    [duration],
  );

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (!duration) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const preview = getScrubInfo(e.clientX);
    setHover(preview);
    onDragStart(preview.time);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (
      e.pointerType !== "mouse" &&
      !e.currentTarget.hasPointerCapture(e.pointerId)
    )
      return;
    const preview = getScrubInfo(e.clientX);
    setHover(preview);
    if (isDragging) onDragMove(preview.time);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (!isDragging) return;
    const { time } = getScrubInfo(e.clientX);
    onDragEnd(time);
    if (e.pointerType !== "mouse") setHover(null);
  };

  const displayedTime = isDragging ? dragTime : currentTime;
  const progressPercent = duration > 0 ? (displayedTime / duration) * 100 : 0;
  const bufferedPercent = duration > 0 ? (buffered / duration) * 100 : 0;

  return (
    <div
      ref={barRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={() => {
        setHover(null);
        onDragCancel();
      }}
      role="slider"
      aria-label="Vị trí phát video"
      aria-valuemin={0}
      aria-valuemax={duration}
      aria-valuenow={Math.min(displayedTime, duration)}
      aria-valuetext={formatTime(displayedTime)}
      aria-disabled={!duration}
      tabIndex={duration ? 0 : -1}
      onKeyDown={(event) => {
        if (!duration) return;
        const direction = {
          ArrowLeft: -1,
          ArrowDown: -1,
          ArrowRight: 1,
          ArrowUp: 1,
        } as const;
        let time: number;
        if (event.key === "Home") time = 0;
        else if (event.key === "End") time = duration;
        else if (
          event.key === "ArrowLeft" ||
          event.key === "ArrowDown" ||
          event.key === "ArrowRight" ||
          event.key === "ArrowUp"
        ) {
          time = Math.min(
            duration,
            Math.max(0, currentTime + 5 * direction[event.key]),
          );
        } else return;
        event.preventDefault();
        onDragEnd(time);
      }}
      onPointerEnter={(event) => {
        if (duration && event.pointerType === "mouse") onPreviewHover(true);
      }}
      onPointerLeave={() => {
        onPreviewHover(false);
        if (!isDragging) setHover(null);
      }}
      className="group/scrub relative flex items-center h-5 cursor-pointer touch-none"
    >
      {hover && duration > 0 && <PlayerSeekPreview src={src} {...hover} />}

      <div className="relative w-full h-1 group-hover/scrub:h-1.5 transition-all rounded-full bg-white/25 overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 bg-white/35"
          style={{ width: `${Math.min(100, bufferedPercent)}%` }}
        />
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#7950f2] to-emerald-400"
          style={{ width: `${Math.min(100, progressPercent)}%` }}
        />
      </div>

      <div
        className={`absolute -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-white ring-2 ring-[#7950f2] shadow-lg transition-transform pointer-events-none ${
          isDragging ? "scale-125" : "scale-90 group-hover/scrub:scale-110"
        }`}
        style={{ left: `${Math.min(100, Math.max(0, progressPercent))}%` }}
      />
    </div>
  );
}
