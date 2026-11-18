"use client";

import { Check, Settings } from "lucide-react";
import type { QualityOption } from "./types";

interface PlayerQualityMenuProps {
  isOpen: boolean;
  onToggle: () => void;
  qualityLevels: QualityOption[];
  selectedQuality: number;
  activeAutoHeight: number | null;
  onSelectQuality: (index: number) => void;
}

export function PlayerQualityMenu({
  isOpen,
  onToggle,
  qualityLevels,
  selectedQuality,
  activeAutoHeight,
  onSelectQuality,
}: PlayerQualityMenuProps) {
  const buttonLabel =
    selectedQuality === -1
      ? "Auto"
      : qualityLevels.find((q) => q.index === selectedQuality)?.label || "HD";

  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[11px] sm:text-xs font-bold text-zinc-100 transition cursor-pointer"
        title="Chất lượng video"
      >
        <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        <span className="hidden sm:inline">{buttonLabel}</span>
      </button>

      {isOpen && (
        <div className="absolute bottom-full right-0 mb-2 w-44 rounded-xl bg-[#121420]/95 backdrop-blur-md border border-purple-500/30 shadow-2xl py-1.5 z-50 text-xs">
          <div className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 border-b border-zinc-800">
            Chất lượng phát
          </div>
          <button
            type="button"
            onClick={() => onSelectQuality(-1)}
            className="w-full px-3 py-2 flex items-center justify-between hover:bg-white/10 text-left font-semibold text-zinc-100 cursor-pointer"
          >
            <span>
              Auto{activeAutoHeight ? ` (${activeAutoHeight}p)` : ""}
            </span>
            {selectedQuality === -1 && (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            )}
          </button>
          {qualityLevels.map((lvl) => (
            <button
              key={lvl.index}
              type="button"
              onClick={() => onSelectQuality(lvl.index)}
              className="w-full px-3 py-2 flex items-center justify-between hover:bg-white/10 text-left font-semibold text-zinc-100 cursor-pointer"
            >
              <span>{lvl.label}</span>
              {selectedQuality === lvl.index && (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
