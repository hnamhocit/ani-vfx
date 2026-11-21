"use client";

import { Library, Menu, Search, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useState } from "react";
import { useAnimeAppStore } from "@/store/useAnimeAppStore";
import {
  DesktopCategoryNav,
  DesktopCategoryNavFallback,
  MobileCategoryNav,
} from "./navbar/CategoryNavigation";
import { NavbarAccount } from "./navbar/NavbarAccount";

export function Navbar() {
  const pathname = usePathname();
  const watchlist = useAnimeAppStore((s) => s.watchlist);
  const history = useAnimeAppStore((s) => s.history);
  const openSearchModal = useAnimeAppStore((s) => s.openSearchModal);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isLibraryActive = pathname === "/library";
  const libraryCount = watchlist.length + history.length;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-[#0b0c10]/85 backdrop-blur-xl select-none">
      <div className="max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-3">
        <Link
          href="/"
          className="flex items-center gap-2 sm:gap-2.5 group shrink-0"
        >
          <img
            src="/icon.svg"
            alt="AniVFX Logo"
            className="w-7 h-7 sm:w-8 sm:h-8 object-contain group-hover:scale-105 transition-transform shrink-0"
          />
          <span className="font-heading font-extrabold text-base sm:text-xl tracking-tight text-white">
            Ani<span className="text-purple-400">VFX</span>
          </span>
        </Link>

        <Suspense fallback={<DesktopCategoryNavFallback />}>
          <DesktopCategoryNav />
        </Suspense>

        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <button
            type="button"
            onClick={openSearchModal}
            className="flex items-center gap-2 p-2 sm:p-2.5 xl:px-3.5 xl:py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-sm font-medium text-zinc-300 hover:text-white transition-all shrink-0 cursor-pointer active:scale-95"
            title="Tìm kiếm anime (Ctrl+K)"
            aria-label="Tìm kiếm anime"
          >
            <Search className="w-4 h-4 text-purple-400 shrink-0" />
            <span className="hidden xl:inline text-zinc-400">Tìm anime...</span>
            <kbd className="hidden 2xl:inline text-[11px] px-1.5 py-0.5 rounded bg-black/40 text-zinc-400 border border-white/10">
              ⌘K
            </kbd>
          </button>

          <Link
            href="/library"
            className={`relative flex items-center gap-1.5 px-2.5 py-2 sm:px-3 sm:py-2 rounded-xl border text-xs sm:text-sm font-semibold transition-all shrink-0 ${
              isLibraryActive
                ? "bg-purple-600/20 text-white border-purple-400/50"
                : "bg-white/[0.04] hover:bg-white/[0.09] text-zinc-200 border-white/[0.08]"
            }`}
            title="Thư viện cá nhân"
          >
            <Library className="w-4 h-4 text-purple-400 shrink-0" />
            <span className="hidden sm:inline">Thư viện</span>
            {libraryCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-purple-500/30 text-purple-200 border border-purple-400/30">
                {libraryCount}
              </span>
            )}
          </Link>

          <div className="h-5 w-px bg-white/10 mx-0.5 hidden sm:block" />

          <NavbarAccount
            watchlistCount={watchlist.length}
            historyCount={history.length}
          />

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 sm:p-2 rounded-xl hover:bg-white/[0.08] text-zinc-200 hover:text-white shrink-0 cursor-pointer"
            aria-label="Menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/[0.08] bg-[#0b0c10] px-4 py-3 space-y-2.5">
          <Suspense fallback={<div className="h-10" />}>
            <MobileCategoryNav onClose={() => setMobileMenuOpen(false)} />
          </Suspense>
        </div>
      )}
    </header>
  );
}
