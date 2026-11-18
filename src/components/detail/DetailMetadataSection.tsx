import { Award, Sparkles, Star } from "lucide-react";
import { useDetailStore } from "@/store/useDetailStore";

export function DetailMetadataSection() {
  const anime = useDetailStore((s) => s.anime);

  if (!anime) return null;

  return (
    <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
      <div className="lg:col-span-2 space-y-4 sm:space-y-6 bg-[#12141c]/90 border border-purple-500/20 p-4 sm:p-8 rounded-2xl sm:rounded-3xl shadow-xl">
        <h3 className="font-heading text-lg sm:text-2xl font-black text-white flex items-center gap-2 sm:gap-3">
          <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400 shrink-0" />
          <span>Thông tin chi tiết & Bối cảnh</span>
        </h3>

        {anime.background ? (
          <p className="text-xs sm:text-base md:text-lg text-zinc-200 leading-relaxed sm:leading-[1.8] font-sans">
            {anime.background}
          </p>
        ) : (
          <p className="text-xs sm:text-base text-zinc-400 italic">
            Chưa có thông tin bối cảnh lịch sử hoặc ghi chú sản xuất bổ sung.
          </p>
        )}

        <div className="pt-4 sm:pt-5 border-t border-zinc-800 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <span className="text-zinc-400 font-bold block text-xs sm:text-sm uppercase tracking-wider">
              Studio sản xuất chính:
            </span>
            <div className="flex gap-2 flex-wrap mt-2">
              {anime.studios && anime.studios.length > 0 ? (
                anime.studios.map((s) => (
                  <span
                    key={s.mal_id}
                    className="px-3 py-1 sm:px-4 sm:py-1.5 rounded-lg sm:rounded-xl bg-[#1a1d2e] border border-purple-500/30 text-purple-200 font-bold text-xs sm:text-base"
                  >
                    {s.name}
                  </span>
                ))
              ) : (
                <span className="text-xs sm:text-base text-zinc-500">
                  Chưa rõ
                </span>
              )}
            </div>
          </div>

          <div>
            <span className="text-zinc-400 font-bold block text-xs sm:text-sm uppercase tracking-wider">
              Nguồn gốc tác phẩm:
            </span>
            <span className="text-zinc-100 font-extrabold text-sm sm:text-lg mt-1.5 block">
              {anime.source || "Chưa rõ"}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-3 sm:space-y-5 bg-[#12141c]/90 border border-purple-500/20 p-4 sm:p-8 rounded-2xl sm:rounded-3xl shadow-xl">
        <h3 className="font-heading text-lg sm:text-2xl font-black text-white flex items-center gap-2 sm:gap-3">
          <Award className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400 shrink-0" />
          <span>Chỉ số MyAnimeList</span>
        </h3>

        <div className="text-xs sm:text-base divide-y divide-zinc-800/80">
          <div className="flex justify-between items-center py-2.5">
            <span className="text-zinc-400 font-medium">Điểm đánh giá:</span>
            <span className="text-amber-400 font-black text-base sm:text-xl flex items-center gap-1.5">
              <Star className="w-4 h-4 sm:w-5 sm:h-5 fill-amber-400" />
              {anime.score ? `${anime.score} / 10` : "N/A"}
            </span>
          </div>
          <div className="flex justify-between items-center py-2.5">
            <span className="text-zinc-400 font-medium">Lượt bình chọn:</span>
            <span className="text-zinc-100 font-extrabold text-sm sm:text-lg">
              {anime.scored_by ? anime.scored_by.toLocaleString() : "N/A"}
            </span>
          </div>
          <div className="flex justify-between items-center py-2.5">
            <span className="text-zinc-400 font-medium">
              Xếp hạng toàn cầu:
            </span>
            <span className="text-purple-300 font-extrabold text-sm sm:text-lg">
              #{anime.rank || "N/A"}
            </span>
          </div>
          <div className="flex justify-between items-center py-2.5">
            <span className="text-zinc-400 font-medium">Mức độ phổ biến:</span>
            <span className="text-zinc-100 font-extrabold text-sm sm:text-lg">
              #{anime.popularity || "N/A"}
            </span>
          </div>
          <div className="flex justify-between items-center py-2.5">
            <span className="text-zinc-400 font-medium">
              Thành viên theo dõi:
            </span>
            <span className="text-zinc-100 font-extrabold text-sm sm:text-lg">
              {anime.members ? anime.members.toLocaleString() : "N/A"}
            </span>
          </div>
          <div className="flex justify-between items-center py-2.5">
            <span className="text-zinc-400 font-medium">Yêu thích nhất:</span>
            <span className="text-zinc-100 font-extrabold text-sm sm:text-lg">
              {anime.favorites ? anime.favorites.toLocaleString() : "N/A"}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
