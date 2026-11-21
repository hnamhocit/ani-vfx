"use client";

import type React from "react";
import { useCallback, useRef, useState } from "react";
import { formatTime } from "@/utils/date-time";

interface PlayerScrubBarProps {
  currentTime: number;
  duration: number;
  buffered: number;
  isDragging: boolean;
  dragTime: number;
  onDragStart: (time: number) => void;
  onDragMove: (time: number) => void;
  onDragEnd: (time: number) => void;
  onDragCancel: () => void;
}

export function PlayerScrubBar({
  currentTime,
  duration,
  buffered,
  isDragging,
  dragTime,
  onDragStart,
  onDragMove,
  onDragEnd,
  onDragCancel,
}: PlayerScrubBarProps) {
  const barRef = useRef<HTMLDivElement | null>(null);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverPercent, setHoverPercent] = useState(0);

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
    const { time } = getScrubInfo(e.clientX);
    onDragStart(time);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const { time, percent } = getScrubInfo(e.clientX);
    setHoverTime(time);
    setHoverPercent(percent);
    if (isDragging) {
      onDragMove(time);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (!isDragging) return;
    const { time } = getScrubInfo(e.clientX);
    onDragEnd(time);
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
        setHoverTime(null);
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
      onPointerLeave={() => {
        if (!isDragging) setHoverTime(null);
      }}
      className="group/scrub relative flex items-center h-5 cursor-pointer touch-none"
    >
      {hoverTime !== null && duration > 0 && (
        <div
          className="absolute -top-7 -translate-x-1/2 px-2 py-0.5 rounded bg-black/90 text-white font-mono text-[11px] font-bold border border-white/15 pointer-events-none shadow-md"
          style={{ left: `${Math.min(Math.max(hoverPercent, 4), 96)}%` }}
        >
          {formatTime(hoverTime)}
        </div>
      )}

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
