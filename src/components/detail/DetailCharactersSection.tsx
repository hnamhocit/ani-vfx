"use client";

import { Mic, Sparkles } from "lucide-react";
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
  className = "w-14 h-20 sm:w-16 sm:h-24",
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
        className={`${className} rounded-xl bg-gradient-to-br ${fallbackGradient} border ${fallbackBorder} flex flex-col items-center justify-center ${fallbackTextColor} font-bold shrink-0 shadow-md select-none p-1.5 text-center`}
        title={name}
      >
        <span className="text-sm sm:text-base font-black tracking-wider">
          {initials}
        </span>
        <span className="text-[10px] text-zinc-400 font-medium mt-0.5">
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
      className={`${className} rounded-xl object-cover bg-zinc-800 shrink-0 border border-white/10 shadow-md group-hover:scale-105 transition-transform duration-300`}
      loading="lazy"
    />
  );
}

interface CharacterEdge {
  role: string;
  node: {
    id: number;
    name?: { full?: string };
    image?: { large?: string | null };
  };
  voiceActors?: Array<{
    id: number;
    name?: { full?: string };
    languageV2?: string;
    image?: { large?: string | null };
  }>;
}

export function DetailCharactersSection() {
  const characters = useDetailStore((s) => s.characters) as {
    edges?: CharacterEdge[];
  } | null;

  const edges = characters?.edges || [];

  if (edges.length === 0) return null;

  return (
    <section className="space-y-4 sm:space-y-5">
      <div>
        <h2 className="font-heading text-lg sm:text-2xl md:text-3xl font-black text-white flex items-center gap-2 sm:gap-3">
          <Sparkles className="w-5 h-5 sm:w-7 sm:h-7 text-[#845ef7] shrink-0" />
          <span>Nhân vật & Diễn viên lồng tiếng</span>
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1">
          Dàn nhân vật nổi bật cùng Seiyuu lồng tiếng gốc
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5 sm:gap-4">
        {edges.slice(0, 12).map((edge, idx) => {
          const charNode = edge.node;
          const charName = charNode.name?.full || "Unknown";
          const charImg = charNode.image?.large;
          const isMain = edge.role === "MAIN";
          const roleLabel = isMain
            ? "Nhân vật chính"
            : edge.role === "SUPPORTING"
              ? "Nhân vật phụ"
              : edge.role;

          const japaneseVA =
            edge.voiceActors?.find((va) => va.languageV2 === "Japanese") ||
            edge.voiceActors?.[0];
          const vaName = japaneseVA?.name?.full || "";
          const vaImg = japaneseVA?.image?.large;
          const vaLang = japaneseVA?.languageV2 || "Japanese";

          return (
            <div
              key={`${charNode.id}-${idx}`}
              className="group relative flex items-center justify-between gap-2 p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-[#131622] via-[#151826] to-[#121420] border border-purple-500/20 hover:border-purple-400/60 transition-all shadow-md hover:shadow-xl hover:shadow-purple-600/15"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <PersonAvatar
                  name={charName}
                  imageUrl={charImg}
                  roleLabel="Nhân vật"
                />
                <div className="min-w-0 flex-1 space-y-1.5">
                  <p
                    className="text-sm sm:text-base font-extrabold text-white line-clamp-2 leading-snug group-hover:text-purple-200 transition-colors"
                    title={charName}
                  >
                    {charName}
                  </p>
                  <span
                    className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded-md border ${isMain
                        ? "bg-emerald-950/70 text-emerald-300 border-emerald-500/35"
                        : "bg-purple-950/70 text-purple-300 border-purple-500/30"
                      }`}
                  >
                    {roleLabel}
                  </span>
                </div>
              </div>

              {japaneseVA ? (
                <>
                  <div className="flex flex-col items-center justify-center shrink-0 px-0.5">
                    <span className="w-6 h-6 rounded-full bg-indigo-950/90 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                      <Mic className="w-3 h-3" />
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-right min-w-0 flex-1 justify-end">
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <p
                        className="text-sm sm:text-base font-bold text-zinc-100 line-clamp-2 leading-snug group-hover:text-indigo-200 transition-colors"
                        title={vaName}
                      >
                        {vaName}
                      </p>
                      <span className="inline-block text-[11px] font-semibold text-indigo-300 bg-indigo-950/60 border border-indigo-500/25 px-2 py-0.5 rounded-md">
                        {vaLang}
                      </span>
                    </div>
                    <PersonAvatar
                      name={vaName}
                      imageUrl={vaImg}
                      roleLabel="Seiyuu"
                      fallbackTextColor="text-indigo-300"
                      fallbackGradient="from-indigo-950/80 via-zinc-900 to-purple-950/80"
                      fallbackBorder="border-indigo-500/30"
                    />
                  </div>
                </>
              ) : (
                <div className="shrink-0 pl-2">
                  <span className="text-[11px] font-medium text-zinc-500 italic">
                    Chưa rõ Seiyuu
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
