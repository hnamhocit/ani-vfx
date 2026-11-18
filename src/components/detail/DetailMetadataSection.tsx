"use client";

import { Award, Calendar, Sparkles, Star } from "lucide-react";
import { useDetailStore } from "@/store/useDetailStore";

const STATUS_MAP: Record<string, string> = {
  FINISHED: "Đã hoàn thành",
  RELEASING: "Đang phát sóng",
  NOT_YET_RELEASED: "Sắp ra mắt",
  CANCELLED: "Đã hủy",
  HIATUS: "Tạm dừng",
};

const SEASON_MAP: Record<string, string> = {
  WINTER: "Mùa Đông",
  SPRING: "Mùa Xuân",
  SUMMER: "Mùa Hạ",
  FALL: "Mùa Thu",
};

export function DetailMetadataSection() {
  const anime = useDetailStore((s) => s.anime) as any;
  if (!anime) return null;

  const score = anime.averageScore ? +(anime.averageScore / 10).toFixed(2) : null;
  const status = STATUS_MAP[anime.status] || anime.status || "Chưa rõ";
  const format = anime.format === "TV_SHORT" ? "TV" : anime.format || "Chưa rõ";
  const source = anime.source
    ? anime.source
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (c: string) => c.toUpperCase())
    : "Chưa rõ";
  const seasonLabel = anime.season
    ? `${SEASON_MAP[anime.season] || anime.season} ${anime.seasonYear || ""}`.trim()
    : anime.seasonYear
      ? String(anime.seasonYear)
      : "Chưa rõ";
  const topRank = anime.rankings?.find(
    (r: any) => r.type === "RATED" && r.allTime,
  )?.rank;
  const popularRank = anime.rankings?.find(
    (r: any) => r.type === "POPULAR" && r.allTime,
  )?.rank;

  const nextEp = anime.nextAiringEpisode;
  const nextAiringText = nextEp?.airingAt
    ? new Date(nextEp.airingAt * 1000).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
    : null;

  return (
    <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
      {/* Left Card: Production & Airing Info */}
      <div className="lg:col-span-2 space-y-4 sm:space-y-6 bg-[#12141c]/90 border border-purple-500/20 p-4 sm:p-7 rounded-2xl sm:rounded-3xl shadow-xl">
        <h3 className="font-heading text-lg sm:text-2xl font-black text-white flex items-center gap-2 sm:gap-3">
          <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400 shrink-0" />
          <span>Thông tin sản xuất & Phát sóng</span>
        </h3>

        {nextEp && nextAiringText && (
          <div className="flex items-center gap-2.5 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 text-xs sm:text-sm font-semibold">
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 shrink-0" />
            <span>
              Tập <strong className="text-white">{nextEp.episode}</strong> dự
              kiến lên sóng vào{" "}
              <strong className="text-emerald-300">{nextAiringText}</strong>
            </span>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-5 text-xs sm:text-sm">
          <div>
            <span className="text-zinc-400 font-bold block uppercase tracking-wider text-[11px]">
              Định dạng
            </span>
            <span className="text-zinc-100 font-extrabold text-sm sm:text-base mt-1 block">
              {format}
            </span>
          </div>

          <div>
            <span className="text-zinc-400 font-bold block uppercase tracking-wider text-[11px]">
              Trạng thái
            </span>
            <span className="text-zinc-100 font-extrabold text-sm sm:text-base mt-1 block">
              {status}
            </span>
          </div>

          <div>
            <span className="text-zinc-400 font-bold block uppercase tracking-wider text-[11px]">
              Mùa phát sóng
            </span>
            <span className="text-zinc-100 font-extrabold text-sm sm:text-base mt-1 block">
              {seasonLabel}
            </span>
          </div>

          <div>
            <span className="text-zinc-400 font-bold block uppercase tracking-wider text-[11px]">
              Số tập
            </span>
            <span className="text-zinc-100 font-extrabold text-sm sm:text-base mt-1 block">
              {anime.episodes ? `${anime.episodes} tập` : "Đang cập nhật"}
            </span>
          </div>

          <div>
            <span className="text-zinc-400 font-bold block uppercase tracking-wider text-[11px]">
              Thời lượng
            </span>
            <span className="text-zinc-100 font-extrabold text-sm sm:text-base mt-1 block">
              {anime.duration ? `${anime.duration} phút/tập` : "Chưa rõ"}
            </span>
          </div>

          <div>
            <span className="text-zinc-400 font-bold block uppercase tracking-wider text-[11px]">
              Nguồn gốc
            </span>
            <span className="text-zinc-100 font-extrabold text-sm sm:text-base mt-1 block">
              {source}
            </span>
          </div>
        </div>

        <div className="pt-4 border-t border-zinc-800">
          <span className="text-zinc-400 font-bold block text-[11px] sm:text-xs uppercase tracking-wider">
            Studio sản xuất chính
          </span>
          <div className="flex gap-2 flex-wrap mt-2">
            {anime.studios?.nodes?.length > 0 ? (
              anime.studios.nodes.map((s: any) => (
                <span
                  key={s.id}
                  className="px-3 py-1 sm:px-4 sm:py-1.5 rounded-lg sm:rounded-xl bg-[#1a1d2e] border border-purple-500/30 text-purple-200 font-bold text-xs sm:text-sm"
                >
                  {s.name}
                </span>
              ))
            ) : (
              <span className="text-xs sm:text-sm text-zinc-500">Chưa rõ</span>
            )}
          </div>
        </div>
      </div>

      {/* Right Card: AniList Community Stats */}
      <div className="space-y-3 sm:space-y-4 bg-[#12141c]/90 border border-purple-500/20 p-4 sm:p-7 rounded-2xl sm:rounded-3xl shadow-xl">
        <h3 className="font-heading text-lg sm:text-2xl font-black text-white flex items-center gap-2 sm:gap-3">
          <Award className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400 shrink-0" />
          <span>Chỉ số AniList</span>
        </h3>

        <div className="text-xs sm:text-sm divide-y divide-zinc-800/80">
          <div className="flex justify-between items-center py-2.5">
            <span className="text-zinc-400 font-medium">Điểm trung bình:</span>
            <span className="text-amber-400 font-black text-base sm:text-xl flex items-center gap-1.5">
              <Star className="w-4 h-4 sm:w-5 sm:h-5 fill-amber-400" />
              {score ? `${score} / 10` : "N/A"}
            </span>
          </div>
          <div className="flex justify-between items-center py-2.5">
            <span className="text-zinc-400 font-medium">
              Xếp hạng đánh giá:
            </span>
            <span className="text-purple-300 font-extrabold text-sm sm:text-base">
              {topRank ? `#${topRank}` : "N/A"}
            </span>
          </div>
          <div className="flex justify-between items-center py-2.5">
            <span className="text-zinc-400 font-medium">
              Xếp hạng phổ biến:
            </span>
            <span className="text-zinc-100 font-extrabold text-sm sm:text-base">
              {popularRank ? `#${popularRank}` : "N/A"}
            </span>
          </div>
          <div className="flex justify-between items-center py-2.5">
            <span className="text-zinc-400 font-medium">
              Thành viên theo dõi:
            </span>
            <span className="text-zinc-100 font-extrabold text-sm sm:text-base">
              {anime.popularity ? anime.popularity.toLocaleString() : "N/A"}
            </span>
          </div>
          <div className="flex justify-between items-center py-2.5">
            <span className="text-zinc-400 font-medium">Yêu thích nhất:</span>
            <span className="text-zinc-100 font-extrabold text-sm sm:text-base">
              {anime.favourites ? anime.favourites.toLocaleString() : "N/A"}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
