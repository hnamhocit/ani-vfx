import { Sparkles } from "lucide-react";
import { useState } from "react";
import { useDetailStore } from "@/store/useDetailStore";

interface PersonAvatarProps {
  name: string;
  imageUrl?: string | null;
  roleLabel: string;
  fallbackTextColor?: string;
  fallbackGradient?: string;
  fallbackBorder?: string;
  className?: string;
}

function PersonAvatar({
  name,
  imageUrl,
  roleLabel,
  fallbackTextColor = "text-purple-200",
  fallbackGradient = "from-purple-950/80 via-zinc-900 to-indigo-950/80",
  fallbackBorder = "border-purple-500/30",
  className = "w-11 h-14 sm:w-16 sm:h-22",
}: PersonAvatarProps) {
  const [hasError, setHasError] = useState(!imageUrl);

  if (!imageUrl || hasError) {
    const initials =
      name
        .split(/[\s,]+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase())
        .join("") || "NV";

    return (
      <div
        className={`${className} rounded-xl sm:rounded-2xl bg-gradient-to-br ${fallbackGradient} border ${fallbackBorder} flex flex-col items-center justify-center ${fallbackTextColor} font-bold shrink-0 shadow-md select-none p-1.5 text-center`}
        title={name}
      >
        <span className="text-xs sm:text-base font-black tracking-wider">
          {initials}
        </span>
        <span className="text-[10px] sm:text-xs text-zinc-400 font-medium mt-0.5">
          {roleLabel}
        </span>
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={name}
      referrerPolicy="no-referrer"
      decoding="async"
      onError={() => setHasError(true)}
      className={`${className} rounded-xl sm:rounded-2xl object-cover bg-zinc-800 shrink-0 border border-zinc-700/80 shadow-md`}
      loading="lazy"
    />
  );
}

export function DetailCharactersSection() {
  const characters = useDetailStore((s) => s.characters);

  if (characters.length === 0) return null;

  return (
    <section className="space-y-4 sm:space-y-5">
      <div>
        <h2 className="font-heading text-lg sm:text-2xl md:text-3xl font-black text-white flex items-center gap-2 sm:gap-3">
          <Sparkles className="w-5 h-5 sm:w-7 sm:h-7 text-[#845ef7] shrink-0" />
          <span>Nhân vật & Diễn viên lồng tiếng</span>
        </h2>
        <p className="text-xs sm:text-base text-zinc-400 sm:text-zinc-300 mt-1">
          Các nhân vật nổi bật cùng Seiyuu tiếng Nhật
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-5">
        {characters.slice(0, 12).map((char, idx) => {
          const japaneseVA =
            char.voice_actors.find((va) => va.language === "Japanese") ||
            char.voice_actors[0];

          const charImg =
            char.character.images.webp?.image_url ||
            char.character.images.jpg?.image_url;

          const vaImg = japaneseVA?.person.images.jpg?.image_url;

          return (
            <div
              key={`${char.character.mal_id}-${idx}`}
              className="group flex items-center justify-between p-3 sm:p-5 rounded-xl sm:rounded-2xl bg-[#12141c]/95 border border-purple-500/20 hover:border-purple-500/60 transition-all shadow-md hover:shadow-xl hover:shadow-purple-600/20"
            >
              <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 flex-1 pr-2 sm:pr-3">
                <PersonAvatar
                  name={char.character.name}
                  imageUrl={charImg}
                  roleLabel="Nhân vật"
                />
                <div className="min-w-0 flex-1">
                  <p
                    className="text-xs sm:text-sm md:text-base font-bold text-white line-clamp-2 leading-snug break-words"
                    title={char.character.name}
                  >
                    {char.character.name}
                  </p>
                  <span className="inline-block text-[10px] sm:text-xs font-semibold text-purple-300 bg-purple-950/70 border border-purple-500/30 px-1.5 py-0.5 sm:px-2 rounded-md mt-1">
                    {char.role === "Main" ? "Chính" : char.role}
                  </span>
                </div>
              </div>

              {japaneseVA && (
                <div className="flex items-center gap-2 sm:gap-3 text-right pl-2 sm:pl-3 min-w-0 flex-1 justify-end border-l border-zinc-800">
                  <div className="min-w-0 flex-1">
                    <p
                      className="text-xs sm:text-sm md:text-base font-bold text-zinc-100 line-clamp-2 leading-snug break-words"
                      title={japaneseVA.person.name}
                    >
                      {japaneseVA.person.name}
                    </p>
                    <span className="text-[10px] sm:text-xs font-semibold text-indigo-400 block mt-0.5 sm:mt-1">
                      {japaneseVA.language}
                    </span>
                  </div>
                  <PersonAvatar
                    name={japaneseVA.person.name}
                    imageUrl={vaImg}
                    roleLabel="Seiyuu"
                    fallbackTextColor="text-indigo-300"
                    fallbackGradient="from-indigo-950/80 via-zinc-900 to-purple-950/80"
                    fallbackBorder="border-indigo-500/30"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
