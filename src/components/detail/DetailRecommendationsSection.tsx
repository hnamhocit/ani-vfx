import { Flame } from "lucide-react";
import Link from "next/link";
import { useDetailStore } from "@/store/useDetailStore";

export function DetailRecommendationsSection() {
  const recommendations = useDetailStore((s) => s.recommendations);

  if (recommendations.length === 0) return null;

  return (
    <section className="space-y-4 sm:space-y-5 pt-4 border-t border-purple-500/10">
      <div>
        <h2 className="font-heading text-lg sm:text-2xl md:text-3xl font-black text-white flex items-center gap-2 sm:gap-3">
          <Flame className="w-5 h-5 sm:w-7 sm:h-7 text-amber-500 shrink-0" />
          <span>Anime tương tự đề xuất</span>
        </h2>
        <p className="text-xs sm:text-base text-zinc-400 sm:text-zinc-300 mt-1">
          Được cộng đồng MyAnimeList bình chọn nhiều nhất
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-5">
        {recommendations.slice(0, 12).map((rec, idx) => {
          const recPoster =
            rec.entry.images.webp?.large_image_url ||
            rec.entry.images.jpg?.large_image_url ||
            rec.entry.images.jpg?.image_url;
          return (
            <Link
              key={`${rec.entry.mal_id}-${idx}`}
              href={`/anime/${rec.entry.mal_id}`}
              className="group flex flex-col rounded-xl sm:rounded-2xl overflow-hidden bg-[#12141c] border border-purple-500/25 hover:border-purple-400 hover:ring-2 hover:ring-purple-500/40 sm:hover:-translate-y-2 shadow-xl shadow-black/80 transition-all duration-300"
            >
              <div className="relative aspect-[3/4] w-full bg-zinc-950 overflow-hidden">
                <img
                  src={recPoster}
                  alt={rec.entry.title}
                  referrerPolicy="no-referrer"
                  decoding="async"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://cdn.myanimelist.net/images/anime/1208/94745.jpg";
                  }}
                  className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
                  loading="lazy"
                />
                <div className="absolute bottom-2 right-2 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg sm:rounded-xl bg-black/90 text-[11px] sm:text-sm font-black text-amber-300 backdrop-blur-md border border-amber-500/30 shadow-md">
                  {rec.votes} votes
                </div>
              </div>
              <div className="p-2.5 sm:p-4 flex-1 flex flex-col justify-between">
                <p className="font-heading font-bold sm:font-black text-xs sm:text-base md:text-lg text-white group-hover:text-purple-300 line-clamp-2 transition-colors leading-snug">
                  {rec.entry.title}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
