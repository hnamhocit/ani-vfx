"use client";

import { AlertCircle, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo } from "react";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { SeasonGrid } from "@/components/SeasonGrid";
import { DetailCharactersSection } from "@/components/detail/DetailCharactersSection";
import { DetailEpisodesSection } from "@/components/detail/DetailEpisodesSection";
import { DetailHeroSection } from "@/components/detail/DetailHeroSection";
import { DetailMetadataSection } from "@/components/detail/DetailMetadataSection";
import { DetailRecommendationsSection } from "@/components/detail/DetailRecommendationsSection";
import { DetailUpcomingScreen } from "@/components/detail/DetailUpcomingScreen";
import { useAnimeApp } from "@/context/AnimeAppContext";
import { buildAnimeSeasons } from "@/utils/seasons";
import { useDetailStore } from "@/store/useDetailStore";

interface AnimeDetailClientProps {
  id: number;
}

export function AnimeDetailClient({ id }: AnimeDetailClientProps) {
  const router = useRouter();
  const { addToHistory } = useAnimeApp();

  const anime = useDetailStore((s) => s.anime) as any;
  const episodes = useDetailStore((s) => s.episodes);
  const relations = useDetailStore((s) => s.relations);
  const episodePage = useDetailStore((s) => s.episodePage);
  const isLoading = useDetailStore((s) => s.isLoading);
  const error = useDetailStore((s) => s.error);

  const fetchDetailData = useDetailStore((s) => s.fetchDetailData);
  const fetchEpisodes = useDetailStore((s) => s.fetchEpisodes);

  useEffect(() => {
    fetchDetailData(id, addToHistory);
  }, [id, addToHistory, fetchDetailData]);

  useEffect(() => {
    fetchEpisodes(id, episodePage);
  }, [id, episodePage, fetchEpisodes]);

  const seasonList = useMemo(() => {
    if (!relations) return [];
    return buildAnimeSeasons(relations);
  }, [relations]);

  const handleNavbarSearch = useCallback(() => {
    router.push("/#search");
  }, [router]);

  const handleNavbarCategory = useCallback(
    (cat: "now" | "popular" | "upcoming") => {
      router.push(`/?category=${cat}`);
    },
    [router],
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0b0c10] text-zinc-100 flex flex-col">
        <Navbar onSearchFocus={handleNavbarSearch} onSelectCategory={handleNavbarCategory} />
        <main className="flex-1 max-w-7xl 2xl:max-w-[1540px] mx-auto w-full px-4 sm:px-6 md:px-8 py-8 space-y-8 animate-pulse">
          <div className="w-full aspect-[16/7] max-h-[380px] bg-zinc-900 rounded-3xl" />
          <div className="max-w-5xl mx-auto w-full aspect-video bg-zinc-900/80 rounded-2xl" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <div className="h-10 bg-zinc-800 rounded-xl w-2/3" />
              <div className="h-32 bg-zinc-800/60 rounded-xl" />
              <div className="h-48 bg-zinc-800/40 rounded-xl" />
            </div>
            <div className="space-y-4">
              <div className="h-64 bg-zinc-800/50 rounded-2xl" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !anime) {
    return (
      <div className="min-h-screen bg-[#0b0c10] text-zinc-100 flex flex-col">
        <Navbar onSearchFocus={handleNavbarSearch} onSelectCategory={handleNavbarCategory} />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md w-full p-8 rounded-3xl bg-zinc-900/70 border border-zinc-800 text-center space-y-5 shadow-2xl backdrop-blur-xl">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-red-950/40 border border-red-500/30 flex items-center justify-center text-red-400">
              <AlertCircle className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-2">Không tìm thấy thông tin</h2>
              <p className="text-sm text-zinc-400 leading-relaxed">
                {error || "Không có kết nối mạng hoặc anime không tồn tại."}
              </p>
            </div>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-purple-600/30"
            >
              <ChevronLeft className="w-4 h-4" />
              Quay lại Khám phá
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const isUpcoming =
    anime.status === "NOT_YET_RELEASED" ||
    (episodes.length === 0 && (!anime.episodes || anime.episodes === 0));

  if (isUpcoming) {
    return (
      <DetailUpcomingScreen
        onSearchFocus={handleNavbarSearch}
        onSelectCategory={handleNavbarCategory}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0c10] text-zinc-100 flex flex-col font-sans">
      <Navbar onSearchFocus={handleNavbarSearch} onSelectCategory={handleNavbarCategory} />
      <main className="flex-1 w-full pb-16 space-y-12">
        <DetailHeroSection />
        <div className="max-w-7xl 2xl:max-w-[1540px] mx-auto w-full px-4 sm:px-6 md:px-8 space-y-12">
          <SeasonGrid seasonList={seasonList} currentAnimeId={id} mode="detail" />
          <DetailEpisodesSection />
          <DetailCharactersSection />
          <DetailMetadataSection />
          <DetailRecommendationsSection />
        </div>
      </main>
      <Footer />
    </div>
  );
}
