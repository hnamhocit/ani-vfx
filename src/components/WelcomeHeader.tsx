"use client";

import { ArrowUpRight, History, Play } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { formatVietnameseTime } from "@/components/player/types";
import { useAnimeAppStore } from "@/store/useAnimeAppStore";
import { useUserStore } from "@/store/useUserStore";

export function WelcomeHeader() {
  const { user, isAuthenticated } = useUserStore();
  const getLatestEpisodeProgress = useUserStore(
    (s) => s.getLatestEpisodeProgress,
  );
  const history = useAnimeAppStore((s) => s.history);
  const hydrateFromStorage = useAnimeAppStore((s) => s.hydrateFromStorage);

  const [greeting, setGreeting] = useState<{ text: string; emoji: string }>({
    text: "Chào buổi tối",
    emoji: "🌙",
  });

  useEffect(() => {
    hydrateFromStorage();
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 11) {
      setGreeting({ text: "Chào buổi sáng", emoji: "☀️" });
    } else if (hour >= 11 && hour < 14) {
      setGreeting({ text: "Chào buổi trưa", emoji: "🌤️" });
    } else if (hour >= 14 && hour < 18) {
      setGreeting({ text: "Chào buổi chiều", emoji: "🌇" });
    } else {
      setGreeting({ text: "Chào buổi tối", emoji: "🌙" });
    }
  }, [hydrateFromStorage]);

  const displayName =
    user?.name || (user?.email ? user.email.split("@")[0] : null);

  const latestAnime = history[0];
  const latestProgress = latestAnime
    ? getLatestEpisodeProgress(latestAnime.id)
    : null;

  return (
    <div className="w-full flex flex-col md:flex-row md:items-center justify-between gap-3 px-1 py-1 select-none">
      <div className="space-y-1">
        <a
          href="https://hnamhocit.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs font-medium text-zinc-400 hover:text-purple-300 transition-colors group"
        >
          <span>Made by</span>
          <span className="font-bold text-purple-300 group-hover:text-white underline decoration-purple-400/50 underline-offset-2">
            Nguyen Hoang Nam
          </span>
          <ArrowUpRight className="w-3.5 h-3.5 text-purple-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </a>

        <h1 className="text-lg sm:text-xl md:text-2xl font-black text-white font-heading tracking-normal leading-tight">
          <span>{greeting.text}, </span>
          <span className="bg-gradient-to-r from-white via-purple-100 to-purple-300 bg-clip-text text-transparent">
            {isAuthenticated && displayName ? displayName : "Bạn hữu anime"}!
          </span>{" "}
          <span>{greeting.emoji}</span>
        </h1>
      </div>

      {latestAnime && (
        <div className="flex items-center gap-2.5 self-start md:self-auto">
          <Link
            href={
              latestProgress
                ? `/anime/${latestAnime.id}/watch?ep=${latestProgress.episode}`
                : `/anime/${latestAnime.id}`
            }
            className="group flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-[#131624] hover:bg-[#1a1e30] border border-purple-500/25 hover:border-purple-400/60 transition shadow-md max-w-[320px]"
          >
            <span className="w-8 h-8 rounded-xl bg-purple-600/25 text-purple-300 group-hover:bg-purple-600 group-hover:text-white flex items-center justify-center shrink-0 transition">
              <Play className="w-4 h-4 fill-current ml-0.5" />
            </span>

            <div className="min-w-0 text-left">
              <p className="text-[11px] text-zinc-400 font-semibold">
                {latestProgress
                  ? `Tiếp tục Tập ${latestProgress.episode} (${formatVietnameseTime(latestProgress.progress.currentTime)})`
                  : "Xem gần đây"}
              </p>
              <p className="text-xs sm:text-sm font-bold text-white truncate">
                {latestAnime.titleEnglish || latestAnime.title}
              </p>
            </div>
          </Link>
        </div>
      )}
    </div>
  );
}
