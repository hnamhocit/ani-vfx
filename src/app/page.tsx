"use client";

import { Search } from "lucide-react";
import { motion } from "motion/react";
import { useEffect } from "react";
import { AnimeRow } from "@/components/AnimeRow";
import { Footer } from "@/components/Footer";
import { HeroSection } from "@/components/HeroSection";
import { useHomeAnimeList } from "@/components/home/useHomeAnimeList";
import { Navbar } from "@/components/Navbar";
import { WelcomeHeader } from "@/components/WelcomeHeader";
import { anilistApi } from "@/services/anilist";
import { useAnimeAppStore } from "@/store/useAnimeAppStore";
import { homeCategoryId, parseHomeCategory } from "@/utils/home-categories";

const fetchSeasonNow = () => anilistApi.getSeasonNow(1);
const fetchPopular = () =>
  anilistApi.getTopAnime({ filter: "bypopularity", limit: 20 });
const fetchUpcoming = () =>
  anilistApi.getTopAnime({ filter: "upcoming", limit: 20 });

export default function HomePage() {
  const openSearchModal = useAnimeAppStore((s) => s.openSearchModal);
  const season = useHomeAnimeList(
    fetchSeasonNow,
    "Không thể tải danh sách phim mùa này.",
  );
  const popular = useHomeAnimeList(
    fetchPopular,
    "Không thể tải danh sách phim thịnh hành.",
  );
  const upcoming = useHomeAnimeList(
    fetchUpcoming,
    "Không thể tải danh sách phim sắp ra mắt.",
  );

  useEffect(() => {
    if (window.location.hash) return;
    const category = parseHomeCategory(
      new URLSearchParams(window.location.search).get("category"),
    );
    if (category !== "all") {
      document.getElementById(homeCategoryId(category))?.scrollIntoView();
    }
  }, []);

  return (
    <div
      id={homeCategoryId("all")}
      className="min-h-screen bg-[#0b0c10] text-zinc-100 flex flex-col"
    >
      <Navbar />

      <main className="flex-1 max-w-7xl 2xl:max-w-[1540px] mx-auto w-full px-3.5 sm:px-6 md:px-8 pt-4 sm:pt-6 pb-12 space-y-5 sm:space-y-8">
        <WelcomeHeader />

        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          aria-label="Anime nổi bật"
        >
          <HeroSection
            featuredList={season.items.slice(0, 5)}
            isLoading={season.isLoading}
          />
        </motion.section>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, delay: 0.05, ease: "easeOut" }}
          className="space-y-8 pt-2"
        >
          <div id={homeCategoryId("now")} className="scroll-mt-20">
            <AnimeRow
              title="Đang phát sóng mùa này"
              subtitle="Những bộ anime hot nhất hiện đang chiếu và lên sóng định kỳ"
              animes={season.items}
              isLoading={season.isLoading}
              error={season.error}
              onRetry={season.reload}
            />
          </div>

          <div id={homeCategoryId("popular")} className="scroll-mt-20">
            <AnimeRow
              title="Top thịnh hành"
              subtitle="Các siêu phẩm được yêu thích và có cộng đồng theo dõi đông đảo nhất"
              animes={popular.items}
              isLoading={popular.isLoading}
              error={popular.error}
              onRetry={popular.reload}
            />
          </div>

          <div id={homeCategoryId("upcoming")} className="scroll-mt-20">
            <AnimeRow
              title="Sắp ra mắt"
              subtitle="Danh sách các bộ phim anime chuẩn bị khởi chiếu trong tương lai"
              animes={upcoming.items}
              isLoading={upcoming.isLoading}
              error={upcoming.error}
              onRetry={upcoming.reload}
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
              <h2 className="font-heading text-xl sm:text-2xl font-bold text-white">
                Tìm kiếm anime
              </h2>
              <p className="text-sm sm:text-base text-zinc-400">
                Tra cứu danh sách phim, nhân vật, mùa chiếu và trailer trực tiếp
                từ AniList.
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

      <Footer />
    </div>
  );
}
