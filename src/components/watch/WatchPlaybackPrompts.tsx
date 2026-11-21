import { Clock, FastForward, Play, RotateCcw, X } from "lucide-react";
import { formatTime } from "@/utils/date-time";

export function WatchResumePrompt({
  resumeTime,
  onResume,
  onDismiss,
}: {
  resumeTime: number;
  onResume: () => void;
  onDismiss: () => void;
}) {
  return (
    <div className="absolute top-3 left-3 right-3 sm:right-auto z-30 sm:max-w-sm p-3 rounded-2xl bg-black/85 backdrop-blur-md border border-purple-500/50 shadow-2xl flex items-center justify-between gap-3">
      <div className="space-y-0.5 min-w-0">
        <p className="text-xs font-bold text-white flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-purple-400 shrink-0" />
          <span className="truncate">Đã xem đến {formatTime(resumeTime)}</span>
        </p>
        <p className="text-[11px] text-zinc-400 truncate">
          Nhấn để tiếp tục đoạn đang xem
        </p>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          onClick={onResume}
          className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition flex items-center gap-1 cursor-pointer"
        >
          <FastForward className="w-3 h-3" />
          <span>Tua đến</span>
        </button>
        <button
          type="button"
          onClick={onDismiss}
          className="p-1.5 rounded-xl text-zinc-400 hover:text-white transition cursor-pointer"
          aria-label="Bỏ qua"
          title="Bỏ qua"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

export function WatchNextEpisodePrompt({
  seconds,
  displayTitle,
  currentEpisode,
  onPlayNext,
  onCancel,
  onReplay,
}: {
  seconds: number;
  displayTitle: string;
  currentEpisode: number;
  onPlayNext: () => void;
  onCancel: () => void;
  onReplay: () => void;
}) {
  return (
    <div className="absolute inset-0 z-40 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-2 sm:p-6 text-center gap-1 sm:gap-4 select-none">
      <div className="relative size-10 sm:size-20 rounded-full border-4 border-purple-500/30 flex items-center justify-center">
        <span className="text-xl sm:text-4xl font-black text-white font-heading">
          {seconds}
        </span>
        <div className="absolute inset-0 rounded-full border-4 border-emerald-400 border-t-transparent motion-safe:animate-spin" />
      </div>
      <div className="space-y-1 max-w-md">
        <h3 className="text-base sm:text-xl font-black text-white">
          Tập tiếp theo tự động phát sau {seconds}s...
        </h3>
        <p className="text-xs sm:text-sm text-purple-300 font-semibold truncate">
          {displayTitle} - Tập {currentEpisode + 1}
        </p>
      </div>
      <div className="flex items-center gap-2.5 flex-wrap justify-center ">
        <button
          type="button"
          onClick={onPlayNext}
          className="px-3 py-1.5 sm:px-5 sm:py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm shadow-lg transition cursor-pointer flex items-center gap-1.5"
        >
          <Play className="w-4 h-4 fill-white" />
          <span>Phát ngay</span>
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1.5 sm:px-4 sm:py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white font-semibold text-xs sm:text-sm transition cursor-pointer"
        >
          Hủy tự phát
        </button>
        <button
          type="button"
          onClick={onReplay}
          className="px-3 py-1.5 sm:px-4 sm:py-2.5 rounded-xl bg-[#1b1e32] hover:bg-[#242940] text-purple-300 hover:text-white font-semibold text-xs sm:text-sm transition cursor-pointer flex items-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Xem lại</span>
        </button>
      </div>
    </div>
  );
}
