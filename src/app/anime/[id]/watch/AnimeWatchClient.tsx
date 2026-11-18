"use client";

import { AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo } from "react";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { SeasonGrid } from "@/components/SeasonGrid";
import { WatchBreadcrumb } from "@/components/watch/WatchBreadcrumb";
import { WatchControlBar } from "@/components/watch/WatchControlBar";
import { WatchEpisodeSelector } from "@/components/watch/WatchEpisodeSelector";
import { WatchInfoHeader } from "@/components/watch/WatchInfoHeader";
import { WatchPlayerSection } from "@/components/watch/WatchPlayerSection";
import { WatchSidebar } from "@/components/watch/WatchSidebar";
import { WatchSynopsisCard } from "@/components/watch/WatchSynopsisCard";
import { useAnimeApp } from "@/context/AnimeAppContext";
import { buildAnimeSeasons } from "@/utils/seasons";
import { useUserStore } from "@/store/useUserStore";
import { useWatchStore } from "@/store/useWatchStore";

interface AnimeWatchClientProps {
  id: number;
  initialEpisode?: number;
}

export function AnimeWatchClient({ id, initialEpisode = 1 }: AnimeWatchClientProps) {
  const { addToHistory } = useAnimeApp();
  const { getProgress } = useUserStore();

  const anime = useWatchStore((s) => s.anime);
  const episodes = useWatchStore((s) => s.episodes);
  const relations = useWatchStore((s) => s.relations);
  const isLoading = useWatchStore((s) => s.isLoading);
  const error = useWatchStore((s) => s.error);
  const currentEpisode = useWatchStore((s) => s.currentEpisode);

  const fetchWatchData = useWatchStore((s) => s.fetchWatchData);
  const fetchStream = useWatchStore((s) => s.fetchStream);

  useEffect(() => {
    fetchWatchData(id, initialEpisode, addToHistory);
  }, [id, initialEpisode, addToHistory, fetchWatchData]);

  useEffect(() => {
    if (!anime) return;
    fetchStream(getProgress);
  }, [anime, currentEpisode, episodes.length, fetchStream, getProgress]);

  const seasonList = useMemo(() => {
    if (!relations) return [];
    return buildAnimeSeasons(relations);
  }, [relations]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#07080c] text-zinc-100 flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center gap-4 py-20">
          <Loader2 className="w-12 h-12 text-[#7950f2] animate-spin" />
          <p className="text-zinc-400 font-semibold text-base">Đang tải dữ liệu phim và máy chủ stream...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !anime) {
    return (
      <div className="min-h-screen bg-[#07080c] text-zinc-100 flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center gap-4 py-20 px-4 text-center">
          <AlertCircle className="w-16 h-16 text-rose-500" />
          <h2 className="text-2xl font-black text-white">{error || "Không có kết nối mạng."}</h2>
          <Link href="/" className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition">
            Quay lại trang chủ
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07080c] text-zinc-100 flex flex-col font-sans">
      <Navbar />
      <WatchBreadcrumb />
      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 xl:gap-8 items-start">
          <div className="lg:col-span-8 space-y-5 sm:space-y-6">
            <WatchPlayerSection />
            <WatchControlBar />
            <WatchInfoHeader />
            <SeasonGrid seasonList={seasonList} currentAnimeId={id} mode="watch" />
            <WatchEpisodeSelector />
            <WatchSynopsisCard />
          </div>
          <WatchSidebar />
        </div>
      </main>
      <Footer />
    </div>
  );
}
