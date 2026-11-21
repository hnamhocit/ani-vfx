import { Volume2, VolumeX } from "lucide-react";
import type { CSSProperties } from "react";
import styles from "./PlayerVolumeControl.module.css";

export function PlayerVolumeControl({
  volume,
  isMuted,
  onChange,
  onToggleMute,
}: {
  volume: number;
  isMuted: boolean;
  onChange: (volume: number) => void;
  onToggleMute: () => void;
}) {
  const percent = isMuted ? 0 : Math.round(volume * 100);
  const label = isMuted ? "Bật tiếng" : "Tắt tiếng";

  return (
    <div className="flex shrink-0 items-center gap-1 sm:gap-2">
      <button
        type="button"
        onClick={onToggleMute}
        className="cursor-pointer rounded-lg p-1.5 text-white transition hover:bg-white/10"
        aria-label={label}
        title={label}
      >
        {isMuted ? (
          <VolumeX className="size-4 text-zinc-400 sm:size-5" />
        ) : (
          <Volume2 className="size-4 sm:size-5" />
        )}
      </button>

      <input
        type="range"
        min={0}
        max={100}
        step={1}
        value={percent}
        onChange={(event) => onChange(event.currentTarget.valueAsNumber / 100)}
        aria-label="Âm lượng"
        aria-valuetext={isMuted ? "Đã tắt tiếng" : `${percent}%`}
        title={`Âm lượng ${percent}%`}
        className={`${styles.slider} w-14 min-[360px]:w-20 sm:w-24`}
        style={{ "--volume-fill": `${percent}%` } as CSSProperties}
      />
    </div>
  );
}
