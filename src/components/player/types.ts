export interface CustomVideoPlayerProps {
  src?: string;
  embedUrl?: string | null;
  youtubeId?: string | null;
  isTrailer?: boolean;
  title?: string;
  poster?: string;
  initialTime?: number;
  hasPrevEpisode?: boolean;
  hasNextEpisode?: boolean;
  onPrevEpisode?: () => void;
  onNextEpisode?: () => void;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  onEnded?: () => void;
  nextEpisodeCountdown?: number | null;
  onPlayNextNow?: () => void;
  onCancelAutoNext?: () => void;
  resumeTime?: number;
  onResumePlay?: () => void;
  onDismissResume?: () => void;
  onErrorRetry?: () => void;
}

export interface QualityOption {
  index: number;
  label: string;
  height: number;
}

export function formatTime(seconds: number): string {
  if (!seconds || Number.isNaN(seconds) || !Number.isFinite(seconds)) {
    return "00:00";
  }
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) {
    return `${h}:${m < 10 ? "0" : ""}${m}:${s < 10 ? "0" : ""}${s}`;
  }
  return `${m < 10 ? "0" : ""}${m}:${s < 10 ? "0" : ""}${s}`;
}

export function formatVietnameseTime(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${mins}p:${secs < 10 ? "0" : ""}${secs}s`;
}

export function formatRelativeDay(timestamp: number): string {
  const now = new Date();
  const target = new Date(timestamp);
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfTarget = new Date(target.getFullYear(), target.getMonth(), target.getDate()).getTime();
  const diffDays = Math.round((startOfToday - startOfTarget) / 86400000);

  if (diffDays <= 0) return "Hôm nay";
  if (diffDays === 1) return "Hôm qua";
  return `${diffDays} ngày trước`;
}
