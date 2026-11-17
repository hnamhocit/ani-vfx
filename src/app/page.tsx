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
import { jikanApi } from "@/services/jikan";
import { MOCK_ANIMES } from "@/services/mockData";
import type { Anime } from "@/types/anime";

export default function HomePage() {
  const { openSearchModal } = useAnimeApp();
  // Optimistic initial state for instant 0ms first render without skeleton freeze
  const [seasonNow, setSeasonNow] = useState<Anime[]>(() =>
    MOCK_ANIMES.slice(0, 12),
  );
  const [popularAnime, setPopularAnime] = useState<Anime[]>(() =>
    MOCK_ANIMES.slice(6, 18),
  );
  const [upcomingAnime, setUpcomingAnime] = useState<Anime[]>(() =>
    MOCK_ANIMES.slice(14, 26),
  );

  const [isLoadingHero, setIsLoadingHero] = useState(false);
  const [isLoadingSeason, setIsLoadingSeason] = useState(false);
  const [isLoadingPopular, setIsLoadingPopular] = useState(false);
  const [isLoadingUpcoming, setIsLoadingUpcoming] = useState(false);

  const [seasonError, setSeasonError] = useState<string | null>(null);
  const [popularError, setPopularError] = useState<string | null>(null);
  const [upcomingError, setUpcomingError] = useState<string | null>(null);

  const seasonRowRef = useRef<HTMLDivElement | null>(null);
  const popularRowRef = useRef<HTMLDivElement | null>(null);
  const upcomingRowRef = useRef<HTMLDivElement | null>(null);

  // Load all 3 sections concurrently using Promise.allSettled to minimize network round-trips
  const loadAllData = useCallback(async () => {
    setIsLoadingSeason(true);
    setIsLoadingHero(true);
    setIsLoadingPopular(true);
    setIsLoadingUpcoming(true);
    setSeasonError(null);
    setPopularError(null);
    setUpcomingError(null);

    const [seasonRes, popularRes, upcomingRes] = await Promise.allSettled([
      jikanApi.getSeasonNow(1),
      jikanApi.getTopAnime({ filter: "bypopularity", limit: 20 }),
      jikanApi.getTopAnime({ filter: "upcoming", limit: 20 }),
    ]);

    if (seasonRes.status === "fulfilled") {
      setSeasonNow(seasonRes.value.data || []);
    } else {
      console.error("Failed to load season now:", seasonRes.reason);
      setSeasonError("Không thể tải danh sách phim mùa này.");
    }
    setIsLoadingSeason(false);
    setIsLoadingHero(false);

    if (popularRes.status === "fulfilled") {
      setPopularAnime(popularRes.value.data || []);
    } else {
      console.error("Failed to load popular:", popularRes.reason);
      setPopularError("Không thể tải danh sách phim thịnh hành.");
    }
    setIsLoadingPopular(false);

    if (upcomingRes.status === "fulfilled") {
      setUpcomingAnime(upcomingRes.value.data || []);
    } else {
      console.error("Failed to load upcoming:", upcomingRes.reason);
      setUpcomingError("Không thể tải danh sách phim sắp ra mắt.");
    }
    setIsLoadingUpcoming(false);
  }, []);

  // Individual loaders for error retry buttons
  const loadSeasonNow = useCallback(() => {
    setIsLoadingSeason(true);
    setIsLoadingHero(true);
    setSeasonError(null);
    jikanApi
      .getSeasonNow(1)
      .then((res) => {
        setSeasonNow(res.data || []);
        setIsLoadingSeason(false);
        setIsLoadingHero(false);
      })
      .catch((err) => {
        console.error("Failed to load season now:", err);
        setSeasonError("Không thể tải danh sách phim mùa này.");
        setIsLoadingSeason(false);
        setIsLoadingHero(false);
      });
  }, []);

  const loadPopular = useCallback(() => {
    setIsLoadingPopular(true);
    setPopularError(null);
    jikanApi
      .getTopAnime({ filter: "bypopularity", limit: 20 })
      .then((res) => {
        setPopularAnime(res.data || []);
        setIsLoadingPopular(false);
      })
      .catch((err) => {
        console.error("Failed to load popular:", err);
        setPopularError("Không thể tải danh sách phim thịnh hành.");
        setIsLoadingPopular(false);
      });
  }, []);

  const loadUpcoming = useCallback(() => {
    setIsLoadingUpcoming(true);
    setUpcomingError(null);
    jikanApi
      .getTopAnime({ filter: "upcoming", limit: 20 })
      .then((res) => {
        setUpcomingAnime(res.data || []);
        setIsLoadingUpcoming(false);
      })
      .catch((err) => {
        console.error("Failed to load upcoming:", err);
        setUpcomingError("Không thể tải danh sách phim sắp ra mắt.");
        setIsLoadingUpcoming(false);
      });
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Auto-scroll to selected category if specified in URL query
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const cat = params.get("category");
    if (cat === "now") {
      setTimeout(
        () => seasonRowRef.current?.scrollIntoView({ behavior: "smooth" }),
        350,
      );
    } else if (cat === "popular") {
      setTimeout(
        () => popularRowRef.current?.scrollIntoView({ behavior: "smooth" }),
        350,
      );
    } else if (cat === "upcoming") {
      setTimeout(
        () => upcomingRowRef.current?.scrollIntoView({ behavior: "smooth" }),
        350,
      );
    }
  }, []);

  const handleSelectCategory = (cat: "now" | "popular" | "upcoming") => {
    if (cat === "now") {
      seasonRowRef.current?.scrollIntoView({ behavior: "smooth" });
    } else if (cat === "popular") {
      popularRowRef.current?.scrollIntoView({ behavior: "smooth" });
    } else if (cat === "upcoming") {
      upcomingRowRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0c10] text-zinc-100 flex flex-col">
      {/* Sticky Glass Navbar */}
      <Navbar
        onSearchFocus={openSearchModal}
        onSelectCategory={handleSelectCategory}
      />

      <main className="flex-1 max-w-7xl 2xl:max-w-[1540px] mx-auto w-full px-3.5 sm:px-6 md:px-8 pt-4 sm:pt-6 pb-12 space-y-5 sm:space-y-8">
        {/* Top Welcome & Creator Header Bar (Above Hero Banner) */}
        <WelcomeHeader />

        {/* 1. Featured Hero Section (with fast, subtle entrance animation) */}
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

        {/* 2. Curated Rows */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, delay: 0.05, ease: "easeOut" }}
          className="space-y-8 pt-2"
        >
          {/* Row 1: Đang phát sóng mùa này (/seasons/now) */}
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

          {/* Row 2: Top thịnh hành (/top/anime?filter=bypopularity) */}
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

          {/* Row 3: Sắp ra mắt (/top/anime?filter=upcoming) */}
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

        {/* 3. Quick Search Action Bar (Opens Search Modal) */}
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, delay: 0.1, ease: "easeOut" }}
          className="relative overflow-hidden rounded-2xl bg-[#111320] border border-zinc-800/90 p-6 sm:p-8"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-1.5 max-w-xl">
              <h2 className="font-heading text-xl sm:text-2xl font-bold text-white">
                Tìm kiếm anime
              </h2>
              <p className="text-sm sm:text-base text-zinc-400">
                Tra cứu danh sách phim, nhân vật, mùa chiếu và trailer trực tiếp
                từ MyAnimeList.
              </p>
            </div>

            <button
              onClick={openSearchModal}
              className="flex items-center gap-3 px-6 py-3 rounded-xl bg-[#7950f2] hover:bg-[#845ef7] text-white font-bold text-sm sm:text-base shadow-lg shadow-purple-600/30 transition-all cursor-pointer shrink-0 active:scale-95"
            >
              <Search className="w-4 h-4" />
              <span>Mở tìm kiếm</span>
              <kbd className="text-xs px-2 py-0.5 rounded-md bg-black/40 text-purple-200 border border-white/20">
                ⌘K
              </kbd>
            </button>
          </div>
        </motion.section>
      </main>

      {/* Professional Streaming Footer */}
      <Footer />
    </div>
  );
}
