import { Award, Clock, Star } from "lucide-react";

export function DetailHeroPoster({
  poster,
  displayTitle,
  score,
  topRank,
}: {
  poster: string;
  displayTitle: string;
  score: number | null;
  topRank?: number;
}) {
  return (
    <div className="w-40 sm:w-52 md:w-60 lg:w-64 shrink-0">
      <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl shadow-black border-2 border-[#1c2033] ring-1 ring-purple-500/30 bg-zinc-900 group">
        {poster ? (
          <img
            src={poster}
            alt={displayTitle}
            referrerPolicy="no-referrer"
            decoding="async"
            fetchPriority="high"
            loading="eager"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center text-zinc-400">
            <Clock className="w-8 h-8 text-amber-400 mb-2" />
            <span className="text-xs font-bold">Chưa có ảnh bìa</span>
          </div>
        )}

        {score && (
          <div className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-400 text-black font-black text-xs sm:text-sm shadow-lg">
            <Star className="w-3.5 h-3.5 fill-black text-black" />
            <span>{score}</span>
          </div>
        )}

        {topRank && (
          <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1 px-2.5 py-1 rounded-xl bg-black/85 backdrop-blur-md text-amber-300 text-xs font-extrabold border border-amber-500/30">
            <Award className="w-3.5 h-3.5" />
            <span>Top #{topRank}</span>
          </div>
        )}
      </div>
    </div>
  );
}
