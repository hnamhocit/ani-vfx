"use client";

import { ChevronLeft, ChevronRight, Layers } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { AnimeSeasonItem } from "@/types/anilist";

interface SeasonGridProps {
  seasonList: AnimeSeasonItem[];
  currentAnimeId: number;
  mode?: "detail" | "watch";
}

const RELATION_LABELS: Record<string, string> = {
  PREQUEL: "Phần trước",
  SEQUEL: "Phần tiếp theo",
  PARENT: "Phần hiện tại",
  SIDE_STORY: "Ngoại truyện",
  SPIN_OFF: "Spin-off",
};

export function SeasonGrid({
  seasonList,
  currentAnimeId,
  mode = "detail",
}: SeasonGridProps) {
  const pageSize = mode === "watch" ? 6 : 8;
  const totalPages = Math.max(1, Math.ceil(seasonList.length / pageSize));

  const currentItemIndex = useMemo(
    () =>
      seasonList.findIndex(
        (s) => Boolean(s.isCurrent) || s.id === currentAnimeId,
      ),
    [seasonList, currentAnimeId],
  );

  const initialPage =
    currentItemIndex >= 0 ? Math.floor(currentItemIndex / pageSize) + 1 : 1;

  const [page, setPage] = useState(initialPage);

  useEffect(() => {
    setPage(initialPage);
  }, [initialPage]);

  if (seasonList.length <= 1) return null;

  const safePage = Math.min(Math.max(1, page), totalPages);
  const paginatedSeasons = seasonList.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );

  const gridColsClass =
    mode === "watch"
      ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"
      : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";

  return (
    <section className="space-y-4 p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-[#111320] border border-purple-500/20 shadow-xl select-none">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-2 rounded-xl bg-purple-950/80 border border-purple-500/40 text-purple-400 shrink-0">
            <Layers className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="font-heading text-base sm:text-lg md:text-xl font-black text-white truncate">
              Các phần phim & Mùa liên quan ({seasonList.length})
            </h3>
            <p className="text-[11px] sm:text-xs text-zinc-400 mt-0.5 truncate">
              Chuyển đổi nhanh giữa các phần phim, movie và ngoại truyện
            </p>
          </div>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage <= 1}
              className="p-1.5 sm:p-2 rounded-xl bg-[#181a28] hover:bg-[#23263a] border border-purple-500/25 text-zinc-200 disabled:opacity-35 transition cursor-pointer"
              aria-label="Trang trước"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs sm:text-sm font-bold text-zinc-300 px-1.5 tabular-nums">
              Trang {safePage} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage >= totalPages}
              className="p-1.5 sm:p-2 rounded-xl bg-[#181a28] hover:bg-[#23263a] border border-purple-500/25 text-zinc-200 disabled:opacity-35 transition cursor-pointer"
              aria-label="Trang sau"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <div className={`grid ${gridColsClass} gap-3 sm:gap-3.5 pt-1`}>
        {paginatedSeasons.map((season) => {
          const isCurrent =
            Boolean(season.isCurrent) || season.id === currentAnimeId;
          const isUnreleased = Boolean(season.unreleased);
          const relationLabel =
            RELATION_LABELS[season.relationType] || season.relationType;
          const metaSuffix = [season.mediaFormat, season.year]
            .filter(Boolean)
            .join(" • ");

          if (isUnreleased && !isCurrent) {
            return (
              <div
                key={season.id}
                className="flex flex-col justify-between gap-2.5 p-3.5 rounded-2xl border bg-zinc-900/40 border-zinc-800 text-zinc-500 opacity-60 cursor-not-allowed min-h-[104px] w-full"
                title="Season này chưa ra mắt"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-400 leading-tight">
                    {relationLabel}
                  </span>
                  <span className="text-[10px] font-extrabold text-amber-400/80 bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-500/30 shrink-0 whitespace-nowrap">
                    Chưa ra mắt
                  </span>
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-zinc-400 line-clamp-2 leading-snug">
                    {season.title}
                  </p>
                  {metaSuffix && (
                    <span className="text-[11px] text-zinc-500 mt-1 block">
                      {metaSuffix}
                    </span>
                  )}
                </div>
              </div>
            );
          }

          const targetHref = isCurrent
            ? "#"
            : mode === "watch"
              ? `/anime/${season.id}/watch?ep=1`
              : `/anime/${season.id}`;

          return (
            <Link
              key={season.id}
              href={targetHref}
              className={`flex flex-col justify-between gap-2.5 p-3.5 rounded-2xl border transition-all min-h-[104px] w-full ${isCurrent
                  ? "bg-purple-950/80 border-purple-400 ring-2 ring-purple-400/50 text-white shadow-lg shadow-purple-600/30"
                  : "bg-[#181a28] hover:bg-[#222538] border-purple-500/20 text-zinc-300 hover:text-white hover:border-purple-400/60"
                }`}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 leading-tight">
                  {relationLabel}
                </span>
                {isCurrent ? (
                  <span className="text-[10px] font-extrabold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/40 shrink-0 whitespace-nowrap">
                    Đang xem
                  </span>
                ) : metaSuffix ? (
                  <span className="text-[11px] font-medium text-zinc-400 shrink-0">
                    {metaSuffix}
                  </span>
                ) : null}
              </div>
              <p className="text-xs sm:text-sm font-bold text-white line-clamp-2 leading-snug">
                {season.title}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
