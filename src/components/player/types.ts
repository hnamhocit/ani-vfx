import type { ReactNode, RefObject } from "react";

export interface CustomVideoPlayerProps {
  src?: string;
  embedUrl?: string | null;
  youtubeId?: string | null;
  title?: string;
  poster?: string;
  videoElementRef?: RefObject<HTMLVideoElement | null>;
  autoPlay?: boolean;
  startTime?: number;
  fullscreenRef?: RefObject<HTMLElement | null>;
  hasPrevEpisode?: boolean;
  hasNextEpisode?: boolean;
  onPrevEpisode?: () => void;
  onNextEpisode?: () => void;
  onTimeUpdate?: (
    currentTime: number,
    duration: number,
    flush?: boolean,
  ) => void;
  onEnded?: () => void;
  checkpoint?: PlaybackCheckpoint;
  errorFallback?: ReactNode;
}

export interface QualityOption {
  index: number;
  label: string;
  height: number;
}

export interface PlaybackCheckpoint {
  time: number;
  duration: number;
  wasPlaying: boolean;
}
