interface EpisodeProgressBarProps {
  percentage: number;
  watched?: boolean;
  className?: string;
}

export function EpisodeProgressBar({
  percentage,
  watched = false,
  className = "w-full mt-1.5",
}: EpisodeProgressBarProps) {
  if (percentage <= 0) return null;

  return (
    <div
      className={`bg-zinc-800 h-1 rounded-full overflow-hidden ${className}`}
    >
      <div
        className={`h-full transition-all ${watched ? "bg-emerald-500" : "bg-purple-500"
          }`}
        style={{
          width: `${Math.min(100, percentage)}%`,
        }}
      />
    </div>
  );
}
