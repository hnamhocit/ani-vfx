"use client";

import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Film,
  LoaderCircle,
  Play,
  Server,
} from "lucide-react";
import { useUserStore } from "@/store/useUserStore";
import { useWatchStore } from "@/store/useWatchStore";
import {
  type AnimeReleaseInfo,
  getReleasedEpisodeCount,
  isAnimeUpcoming,
} from "@/utils/anime";

import type { useWatchSource } from "./useWatchSource";

interface WatchControlBarAnime extends AnimeReleaseInfo {
  trailer?: {
    id?: string | null;
    site?: string | null;
  } | null;
}

const focusClass =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300";
const buttonClass = `inline-flex min-h-11 cursor-pointer sm:min-h-10 items-center justify-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40 sm:text-sm ${focusClass}`;
const utilityClass = `${buttonClass} border border-white/10 bg-white/[0.035] text-zinc-300 hover:bg-white/10 hover:text-white aria-pressed:border-violet-400/40 aria-pressed:bg-violet-500/15 aria-pressed:text-violet-100`;

const playerModes = [
  { id: "hls", label: "HLS" },
  { id: "iframe", label: "Embed" },
] as const;

export function WatchControlBar({
  source,
}: {
  source: ReturnType<typeof useWatchSource>;
}) {
  const anime = useWatchStore((s) => s.anime) as WatchControlBarAnime | null;
  const episodes = useWatchStore((s) => s.episodes);
  const currentEpisode = useWatchStore((s) => s.currentEpisode);
  const streamLoading = useWatchStore((s) => s.streamLoading);
  const streamServers = useWatchStore((s) => s.streamServers);
  const activeServer = useWatchStore((s) => s.activeServer);
  const playerMode = useWatchStore((s) => s.playerMode);
  const isTrailerMode = useWatchStore((s) => s.isTrailerMode);

  const selectEpisode = useWatchStore((s) => s.selectEpisode);

  const autoPlayNextEpisode = useUserStore((s) => s.autoPlayNextEpisode);
  const setAutoPlayNextEpisode = useUserStore((s) => s.setAutoPlayNextEpisode);

  if (!anime) return null;

  const isUpcoming = isAnimeUpcoming(anime, episodes.length);
  const totalEpisodes = isUpcoming
    ? 0
    : (getReleasedEpisodeCount(anime) ?? episodes.length);
  const hasTrailer = Boolean(
    anime.trailer?.site === "youtube" && anime.trailer?.id,
  );

  return (
    <div className="@container rounded-2xl border border-white/10 bg-[#12141e] px-3 py-2.5 shadow-sm shadow-black/25 sm:px-4">
      {isUpcoming ? (
        <div className="flex flex-wrap items-center gap-2.5">
          <p className="flex items-center gap-2 text-xs font-semibold text-amber-200 sm:text-sm">
            <Clock
              aria-hidden="true"
              className="size-4 shrink-0 text-amber-400"
            />
            Phần phim chưa phát sóng chính thức
          </p>
          {hasTrailer && (
            <button
              type="button"
              aria-pressed={isTrailerMode}
              onClick={source.enableTrailerMode}
              className={utilityClass}
            >
              <Film aria-hidden="true" className="size-4" />
              Xem trailer
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-2.5 @min-[52rem]:flex-row @min-[52rem]:items-center @min-[52rem]:justify-between">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <span className="inline-flex shrink-0 items-center gap-1.5 text-xs font-semibold text-zinc-400">
              <Server aria-hidden="true" className="size-4 text-zinc-500" />
              Máy chủ
            </span>

            {streamServers.length > 0 ? (
              streamServers.map((server) => (
                <button
                  key={server.id}
                  type="button"
                  aria-pressed={
                    !isTrailerMode && activeServer?.id === server.id
                  }
                  onClick={() => source.selectServer(server)}
                  className={`${buttonClass} max-w-full border border-white/10 bg-white/[0.035] text-zinc-300 hover:bg-white/10 aria-pressed:border-emerald-400/30 aria-pressed:bg-emerald-400/10 aria-pressed:text-emerald-200`}
                >
                  <Play
                    aria-hidden="true"
                    className="size-3.5 shrink-0 fill-current"
                  />
                  <span className="truncate">{server.serverName}</span>
                </button>
              ))
            ) : (
              <output className="inline-flex min-h-10 items-center gap-2 text-xs font-medium text-zinc-400">
                {streamLoading && (
                  <LoaderCircle
                    aria-hidden="true"
                    className="size-4 text-violet-300 motion-safe:animate-spin"
                  />
                )}
                {streamLoading ? "Đang tìm nguồn phát…" : "Chưa có máy chủ"}
              </output>
            )}

            {activeServer?.m3u8Url &&
              activeServer.embedUrl &&
              !isTrailerMode && (
                <fieldset
                  aria-label="Chế độ phát"
                  className="flex shrink-0 items-center rounded-lg border border-white/10 bg-[#090b13] p-0.5"
                >
                  {playerModes.map(({ id, label }) => (
                    <button
                      key={id}
                      type="button"
                      aria-pressed={playerMode === id}
                      onClick={() => source.setPlayerMode(id)}
                      className={`min-h-10 cursor-pointer sm:min-h-9 rounded-md px-2.5 text-xs font-semibold text-zinc-400 transition-colors hover:text-white aria-pressed:bg-violet-500/20 aria-pressed:text-violet-100 ${focusClass}`}
                    >
                      {label}
                    </button>
                  ))}
                </fieldset>
              )}

            {hasTrailer && (
              <button
                type="button"
                aria-pressed={isTrailerMode}
                onClick={source.enableTrailerMode}
                className={utilityClass}
              >
                <Film aria-hidden="true" className="size-4" />
                Trailer
              </button>
            )}
          </div>

          <div className="flex min-w-0 flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-white/10 pt-2.5 @min-[52rem]:shrink-0 @min-[52rem]:border-t-0 @min-[52rem]:border-l @min-[52rem]:pt-0 @min-[52rem]:pl-3">
            <label className="inline-flex min-h-11 cursor-pointer sm:min-h-10 items-center gap-2 text-xs font-medium text-zinc-300">
              <input
                type="checkbox"
                checked={autoPlayNextEpisode}
                onChange={(event) => {
                  setAutoPlayNextEpisode(event.currentTarget.checked);
                  if (!event.currentTarget.checked)
                    useWatchStore.getState().setNextEpisodeCountdown(null);
                }}
                className="peer sr-only"
              />
              <span
                aria-hidden="true"
                className="relative h-5 w-9 shrink-0 rounded-full bg-zinc-700 transition-colors after:absolute after:top-0.5 after:left-0.5 after:size-4 after:rounded-full after:bg-white after:transition-transform peer-checked:bg-violet-600 peer-checked:after:translate-x-4 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-violet-300"
              />
              Tự phát tập tiếp theo
            </label>

            <fieldset
              aria-label="Chuyển tập"
              className="flex shrink-0 items-center gap-1.5"
            >
              <button
                type="button"
                disabled={currentEpisode <= 1}
                onClick={() => selectEpisode(currentEpisode - 1)}
                className={utilityClass}
              >
                <ChevronLeft aria-hidden="true" className="size-4" />
                Tập trước
              </button>
              <button
                type="button"
                disabled={currentEpisode >= totalEpisodes}
                onClick={() => selectEpisode(currentEpisode + 1)}
                className={`${buttonClass} border border-violet-400/30 bg-violet-500/15 text-violet-100 enabled:hover:bg-violet-500/30`}
              >
                Tập tiếp
                <ChevronRight aria-hidden="true" className="size-4" />
              </button>
            </fieldset>
          </div>
        </div>
      )}
    </div>
  );
}
