"use client";

import {
  Maximize,
  Minimize,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  SkipBack,
  SkipForward,
} from "lucide-react";
import { formatTime } from "@/utils/date-time";
import { PlayerQualityMenu } from "./PlayerQualityMenu";
import { PlayerScrubBar } from "./PlayerScrubBar";
import { PlayerVolumeControl } from "./PlayerVolumeControl";
import type { QualityOption } from "./types";

interface PlayerControlsOverlayProps {
  src: string;
  visible: boolean;
  title: string;
  activeQualityLabel: string;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  buffered: number;
  isDragging: boolean;
  dragTime: number;
  isMuted: boolean;
  volume: number;
  playbackRate: number;
  isFullscreen: boolean;
  hasPrevEpisode?: boolean;
  hasNextEpisode?: boolean;
  qualityLevels: QualityOption[];
  selectedQuality: number;
  activeAutoHeight: number | null;
  isQualityMenuOpen: boolean;
  onTogglePlay: () => void;
  onSkipBy: (delta: number) => void;
  onPrevEpisode?: () => void;
  onNextEpisode?: () => void;
  onPreviewHover: (hovered: boolean) => void;
  onDragStart: (time: number) => void;
  onDragMove: (time: number) => void;
  onDragEnd: (time: number) => void;
  onDragCancel: () => void;
  onToggleMute: () => void;
  onVolumeChange: (volume: number) => void;
  onCyclePlaybackRate: () => void;
  onToggleQualityMenu: () => void;
  onSelectQuality: (index: number) => void;
  onToggleFullscreen: () => void;
}

export function PlayerControlsOverlay({
  src,
  visible,
  title,
  activeQualityLabel,
  isPlaying,
  currentTime,
  duration,
  buffered,
  isDragging,
  dragTime,
  isMuted,
  volume,
  playbackRate,
  isFullscreen,
  hasPrevEpisode,
  hasNextEpisode,
  qualityLevels,
  selectedQuality,
  activeAutoHeight,
  isQualityMenuOpen,
  onTogglePlay,
  onSkipBy,
  onPrevEpisode,
  onNextEpisode,
  onPreviewHover,
  onDragStart,
  onDragMove,
  onDragEnd,
  onDragCancel,
  onToggleMute,
  onVolumeChange,
  onCyclePlaybackRate,
  onToggleQualityMenu,
  onSelectQuality,
  onToggleFullscreen,
}: PlayerControlsOverlayProps) {
  const displayedTime = isDragging ? dragTime : currentTime;

  return (
    <div
      className={`absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/75 transition-opacity duration-200 flex flex-col justify-between ${
        visible
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none"
      }`}
    >
      {/* Top Bar */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="px-3 sm:px-5 pt-2 sm:pt-4 pb-1 sm:pb-4 flex items-center justify-between gap-3"
      >
        <p className="text-xs sm:text-sm md:text-base font-bold text-white truncate drop-shadow">
          {title}
        </p>
        <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-white/10 text-zinc-200 border border-white/15 shrink-0">
          {activeQualityLabel}
        </span>
      </div>

      {/* Center Transport Buttons */}
      <div className="flex items-center justify-center gap-6 sm:gap-10">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSkipBy(-10);
          }}
          className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black/65 hover:bg-black/85 text-white border border-white/20 flex flex-col items-center justify-center transition active:scale-90 cursor-pointer"
          aria-label="Tua lùi 10 giây"
        >
          <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="text-[9px] font-bold leading-none mt-0.5">10s</span>
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onTogglePlay();
          }}
          className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#7950f2] hover:bg-[#845ef7] text-white border border-purple-300/40 shadow-2xl shadow-purple-600/50 flex items-center justify-center transition active:scale-90 cursor-pointer"
          aria-label={isPlaying ? "Tạm dừng" : "Phát"}
        >
          {isPlaying ? (
            <Pause className="w-6 h-6 sm:w-7 sm:h-7 fill-white" />
          ) : (
            <Play className="w-6 h-6 sm:w-7 sm:h-7 fill-white ml-0.5" />
          )}
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSkipBy(10);
          }}
          className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black/65 hover:bg-black/85 text-white border border-white/20 flex flex-col items-center justify-center transition active:scale-90 cursor-pointer"
          aria-label="Tua tới 10 giây"
        >
          <RotateCw className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="text-[9px] font-bold leading-none mt-0.5">10s</span>
        </button>
      </div>

      {/* Bottom Controls */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="px-2 sm:px-5 pb-1.5 sm:pb-4 pt-1 sm:pt-3 space-y-0.5 sm:space-y-2"
      >
        <div className="sm:hidden font-mono text-[10px] text-zinc-300 tabular-nums">
          {formatTime(displayedTime)} / {formatTime(duration)}
        </div>

        <PlayerScrubBar
          src={src}
          currentTime={currentTime}
          duration={duration}
          buffered={buffered}
          isDragging={isDragging}
          dragTime={dragTime}
          onPreviewHover={onPreviewHover}
          onDragStart={onDragStart}
          onDragMove={onDragMove}
          onDragEnd={onDragEnd}
          onDragCancel={onDragCancel}
        />

        <div className="flex items-center justify-between gap-2 text-xs sm:text-sm text-zinc-200">
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {hasPrevEpisode && onPrevEpisode && (
              <button
                type="button"
                onClick={onPrevEpisode}
                className="p-1.5 rounded-lg hover:bg-white/10 text-white transition cursor-pointer"
                title="Tập trước"
                aria-label="Tập trước"
              >
                <SkipBack className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
              </button>
            )}

            <button
              type="button"
              onClick={onTogglePlay}
              className="p-1.5 rounded-lg hover:bg-white/10 text-white transition cursor-pointer"
              aria-label={isPlaying ? "Tạm dừng" : "Phát"}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
              ) : (
                <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
              )}
            </button>

            {hasNextEpisode && onNextEpisode && (
              <button
                type="button"
                onClick={onNextEpisode}
                className="p-1.5 rounded-lg hover:bg-white/10 text-white transition cursor-pointer"
                title="Tập tiếp theo"
                aria-label="Tập tiếp theo"
              >
                <SkipForward className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
              </button>
            )}

            <PlayerVolumeControl
              volume={volume}
              isMuted={isMuted}
              onToggleMute={onToggleMute}
              onChange={onVolumeChange}
            />

            <span className="hidden sm:inline font-mono text-xs text-zinc-300 tabular-nums whitespace-nowrap">
              {formatTime(displayedTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="relative flex items-center gap-1.5 sm:gap-2.5">
            <button
              type="button"
              onClick={onCyclePlaybackRate}
              className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[11px] sm:text-xs font-bold text-zinc-100 transition cursor-pointer"
              title="Tốc độ phát"
            >
              {playbackRate}x
            </button>

            <PlayerQualityMenu
              isOpen={isQualityMenuOpen}
              onToggle={onToggleQualityMenu}
              qualityLevels={qualityLevels}
              selectedQuality={selectedQuality}
              activeAutoHeight={activeAutoHeight}
              onSelectQuality={onSelectQuality}
            />

            <button
              type="button"
              onClick={onToggleFullscreen}
              className="p-1.5 rounded-lg hover:bg-white/10 text-white transition cursor-pointer"
              aria-label="Toàn màn hình"
            >
              {isFullscreen ? (
                <Minimize className="w-4 h-4 sm:w-5 sm:h-5" />
              ) : (
                <Maximize className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
