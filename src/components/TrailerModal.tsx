"use client";

import { ExternalLink, Film, Video, X } from "lucide-react";
import { useCallback, useEffect, useRef } from "react";
import { useAnimeApp } from "@/context/AnimeAppContext";

function getSafeYoutubeEmbedUrl(
  youtubeId?: string | null,
  rawEmbedUrl?: string | null,
  autoplay = true,
): string | null {
  let id = youtubeId;
  if (!id && rawEmbedUrl) {
    const match = rawEmbedUrl.match(
      /(?:embed\/|v=|vi\/|youtu\.be\/|\/v\/|^)([a-zA-Z0-9_-]{11})/,
    );
    if (match) id = match[1];
  }

  if (id) {
    return `https://www.youtube-nocookie.com/embed/${id}?autoplay=${
      autoplay ? 1 : 0
    }&enablejsapi=1&rel=0&modestbranding=1`;
  }

  if (!rawEmbedUrl) return null;

  try {
    const parsed = new URL(rawEmbedUrl);
    if (autoplay) parsed.searchParams.set("autoplay", "1");
    parsed.searchParams.set("enablejsapi", "1");
    return parsed.toString();
  } catch {
    return rawEmbedUrl;
  }
}

export function TrailerModal() {
  const { trailerModal, closeTrailerModal } = useAnimeApp();
  const { isOpen, title, youtubeId, embedUrl } = trailerModal;
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Pause playback when switching browser tabs
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isOpen && iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: "command", func: "pauseVideo", args: "" }),
          "*",
        );
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [isOpen]);

  const handleClose = useCallback(() => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: "command", func: "stopVideo", args: "" }),
        "*",
      );
    }
    closeTrailerModal();
  }, [closeTrailerModal]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  // Resolve best embed URL (clean, reliable, no-cookie, error-153 proof)
  const videoSrc = getSafeYoutubeEmbedUrl(youtubeId, embedUrl, true);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="trailer-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 bg-black/85 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-4xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800/80 bg-zinc-900/60">
          <div className="flex items-center gap-2.5 truncate">
            <span className="p-1.5 rounded-lg bg-red-600/15 text-red-500">
              <Video className="w-5 h-5" />
            </span>
            <h3
              id="trailer-modal-title"
              className="text-base sm:text-lg font-semibold text-zinc-100 truncate"
            >
              Trailer: {title}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            {youtubeId && (
              <a
                href={`https://www.youtube.com/watch?v=${youtubeId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 transition-colors"
                title="Mở xem trên YouTube"
              >
                <span>YouTube</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
            <button
              onClick={handleClose}
              className="p-1.5 text-zinc-400 hover:text-zinc-100 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
              aria-label="Đóng trailer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video Player */}
        <div className="relative w-full aspect-video bg-black flex items-center justify-center">
          {videoSrc ? (
            <iframe
              ref={iframeRef}
              src={videoSrc}
              title={`Trailer ${title}`}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-8 text-zinc-400">
              <Film className="w-16 h-16 mb-3 text-zinc-600 animate-pulse" />
              <p className="text-lg font-medium text-zinc-300">
                Không có trailer khả dụng
              </p>
              <p className="text-sm text-zinc-500 mt-1">
                Anime này hiện chưa có video giới thiệu chính thức từ YouTube.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
