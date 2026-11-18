"use client";

import { Search } from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimeRow } from "@/components/AnimeRow";
import { Footer } from "@/components/Footer";
import { HeroSection } from "@/components/HeroSection";
import { Navbar } from "@/components/Navbar";
import { WelcomeHeader } from "@/components/WelcomeHeader";
import { useAnimeApp } from "@/context/AnimeAppContext";
import { anilistApi } from "@/services/anilist";

export default function HomePage() {
  const { openSearchModal } = useAnimeApp();

  const [seasonNow, setSeasonNow] = useState<any[]>([]);
  const [popularAnime, setPopularAnime] = useState<any[]>([]);
  const [upcomingAnime, setUpcomingAnime] = useState<any[]>([]);

  const [isLoadingHero, setIsLoadingHero] = useState(true);
  const [isLoadingSeason, setIsLoadingSeason] = useState(true);
  const [isLoadingPopular, setIsLoadingPopular] = useState(true);
  const [isLoadingUpcoming, setIsLoadingUpcoming] = useState(true);

  const [seasonError, setSeasonError] = useState<string | null>(null);
  const [popularError, setPopularError] = useState<string | null>(null);
  const [upcomingError, setUpcomingError] = useState<string | null>(null);

  const seasonRowRef = useRef<HTMLDivElement | null>(null);
  const popularRowRef = useRef<HTMLDivElement | null>(null);
  const upcomingRowRef = useRef<HTMLDivElement | null>(null);

  const loadAllData = useCallback(async () => {
    setIsLoadingSeason(true);
    setIsLoadingHero(true);
    setIsLoadingPopular(true);
    setIsLoadingUpcoming(true);
    setSeasonError(null);
    setPopularError(null);
    setUpcomingError(null);

    const [seasonRes, popularRes, upcomingRes] = await Promise.allSettled([
      anilistApi.getSeasonNow(1),
      anilistApi.getTopAnime({ filter: "bypopularity", limit: 20 }),
      anilistApi.getTopAnime({ filter: "upcoming", limit: 20 }),
    ]);

    if (seasonRes.status === "fulfilled") {
      setSeasonNow(seasonRes.value.data || []);
    } else {
      setSeasonError("Không thể tải danh sách phim mùa này.");
    }
    setIsLoadingSeason(false);
    setIsLoadingHero(false);

    if (popularRes.status === "fulfilled") {
      setPopularAnime(popularRes.value.data || []);
    } else {
      setPopularError("Không thể tải danh sách phim thịnh hành.");
    }
    setIsLoadingPopular(false);

    if (upcomingRes.status === "fulfilled") {
      setUpcomingAnime(upcomingRes.value.data || []);
    } else {
      setUpcomingError("Không thể tải danh sách phim sắp ra mắt.");
    }
    setIsLoadingUpcoming(false);
  }, []);

  const loadSeasonNow = useCallback(() => {
    setIsLoadingSeason(true);
    setIsLoadingHero(true);
    setSeasonError(null);
    anilistApi.getSeasonNow(1)
      .then((res) => { setSeasonNow(res.data || []); })
      .catch(() => { setSeasonError("Không thể tải danh sách phim mùa này."); })
      .finally(() => { setIsLoadingSeason(false); setIsLoadingHero(false); });
  }, []);

  const loadPopular = useCallback(() => {
    setIsLoadingPopular(true);
    setPopularError(null);
    anilistApi.getTopAnime({ filter: "bypopularity", limit: 20 })
      .then((res) => { setPopularAnime(res.data || []); })
      .catch(() => { setPopularError("Không thể tải danh sách phim thịnh hành."); })
      .finally(() => { setIsLoadingPopular(false); });
  }, []);

  const loadUpcoming = useCallback(() => {
    setIsLoadingUpcoming(true);
    setUpcomingError(null);
    anilistApi.getTopAnime({ filter: "upcoming", limit: 20 })
      .then((res) => { setUpcomingAnime(res.data || []); })
      .catch(() => { setUpcomingError("Không thể tải danh sách phim sắp ra mắt."); })
      .finally(() => { setIsLoadingUpcoming(false); });
  }, []);

  useEffect(() => { loadAllData(); }, [loadAllData]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const cat = new URLSearchParams(window.location.search).get("category");
    const delay = 350;
    if (cat === "now") setTimeout(() => seasonRowRef.current?.scrollIntoView({ behavior: "smooth" }), delay);
    else if (cat === "popular") setTimeout(() => popularRowRef.current?.scrollIntoView({ behavior: "smooth" }), delay);
    else if (cat === "upcoming") setTimeout(() => upcomingRowRef.current?.scrollIntoView({ behavior: "smooth" }), delay);
  }, []);

  const handleSelectCategory = (cat: "now" | "popular" | "upcoming") => {
    if (cat === "now") seasonRowRef.current?.scrollIntoView({ behavior: "smooth" });
    else if (cat === "popular") popularRowRef.current?.scrollIntoView({ behavior: "smooth" });
    else if (cat === "upcoming") upcomingRowRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#0b0c10] text-zinc-100 flex flex-col">
      <Navbar onSearchFocus={openSearchModal} onSelectCategory={handleSelectCategory} />

      <main className="flex-1 max-w-7xl 2xl:max-w-[1540px] mx-auto w-full px-3.5 sm:px-6 md:px-8 pt-4 sm:pt-6 pb-12 space-y-5 sm:space-y-8">
        <WelcomeHeader />

        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          aria-label="Anime nổi bật"
        >
          <HeroSection
            featuredList={seasonNow.length > 0 ? seasonNow.slice(0, 5) : []}
            isLoading={isLoadingHero}
          />
        </motion.section>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, delay: 0.05, ease: "easeOut" }}
          className="space-y-8 pt-2"
        >
          <div ref={seasonRowRef}>
            <AnimeRow
              title="Đang phát sóng mùa này"
              subtitle="Những bộ anime hot nhất hiện đang chiếu và lên sóng định kỳ"
              animes={seasonNow}
              isLoading={isLoadingSeason}
              error={seasonError}
              onRetry={loadSeasonNow}
            />
          </div>

          <div ref={popularRowRef}>
            <AnimeRow
              title="Top thịnh hành"
              subtitle="Các siêu phẩm được yêu thích và có cộng đồng theo dõi đông đảo nhất"
              animes={popularAnime}
              isLoading={isLoadingPopular}
              error={popularError}
              onRetry={loadPopular}
            />
          </div>

          <div ref={upcomingRowRef}>
            <AnimeRow
              title="Sắp ra mắt"
              subtitle="Danh sách các bộ phim anime chuẩn bị khởi chiếu trong tương lai"
              animes={upcomingAnime}
              isLoading={isLoadingUpcoming}
              error={upcomingError}
              onRetry={loadUpcoming}
            />
          </div>
        </motion.div>

        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, delay: 0.1, ease: "easeOut" }}
          className="relative overflow-hidden rounded-2xl bg-[#111320] border border-zinc-800/90 p-6 sm:p-8"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-1.5 max-w-xl">
              <h2 className="font-heading text-xl sm:text-2xl font-bold text-white">Tìm kiếm anime</h2>
              <p className="text-sm sm:text-base text-zinc-400">
                Tra cứu danh sách phim, nhân vật, mùa chiếu và trailer trực tiếp từ AniList.
              </p>
            </div>
            <button
              onClick={openSearchModal}
              className="flex items-center gap-3 px-6 py-3 rounded-xl bg-[#7950f2] hover:bg-[#845ef7] text-white font-bold text-sm sm:text-base shadow-lg shadow-purple-600/30 transition-all cursor-pointer shrink-0 active:scale-95"
            >
              <Search className="w-4 h-4" />
              <span>Mở tìm kiếm</span>
              <kbd className="text-xs px-2 py-0.5 rounded-md bg-black/40 text-purple-200 border border-white/20">⌘K</kbd>
            </button>
          </div>
        </motion.section>
      </main>

      <Footer />
    </div>
  );
}
