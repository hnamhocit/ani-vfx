"use client";

import {
  Bookmark,
  CalendarDays,
  ChevronDown,
  Compass,
  Flame,
  History,
  Loader2,
  LogOut,
  Menu,
  Search,
  Shield,
  TrendingUp,
  User,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { useAnimeApp } from "@/context/AnimeAppContext";
import { useUserStore } from "@/store/useUserStore";

const NAV_ITEMS = [
  {
    id: "all" as const,
    label: "Khám phá",
    icon: Compass,
    activeColor: "text-purple-300",
  },
  {
    id: "now" as const,
    label: "Mùa này",
    icon: Flame,
    activeColor: "text-amber-400 fill-amber-400/20",
  },
  {
    id: "popular" as const,
    label: "Thịnh hành",
    icon: TrendingUp,
    activeColor: "text-indigo-300",
  },
  {
    id: "upcoming" as const,
    label: "Sắp chiếu",
    icon: CalendarDays,
    activeColor: "text-emerald-400",
  },
];

interface DesktopCategoryNavProps {
  activeCategory?: "all" | "now" | "popular" | "upcoming";
  onSelectCategory?: (category: "now" | "popular" | "upcoming") => void;
}

function DesktopCategoryNav({
  activeCategory,
  onSelectCategory,
}: DesktopCategoryNavProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlCategory = searchParams?.get("category") as
    | "now"
    | "popular"
    | "upcoming"
    | null;

  const currentCategory: "all" | "now" | "popular" | "upcoming" =
    pathname === "/" ? activeCategory || urlCategory || "all" : "all";

  const handleNavClick = (cat: "all" | "now" | "popular" | "upcoming") => {
    if (cat === "all") {
      if (pathname === "/") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        router.push("/");
      }
    } else {
      router.push(`/?category=${cat}`);
      onSelectCategory?.(cat);
    }
  };

  return (
    <nav className="hidden lg:flex items-center gap-1.5 shrink-0">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = currentCategory === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => handleNavClick(item.id)}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm transition-all cursor-pointer ${
              isActive
                ? "bg-gradient-to-r from-purple-600/30 to-indigo-600/30 text-white border border-purple-500/60 shadow-lg shadow-purple-600/20 font-bold backdrop-blur-md"
                : "text-zinc-400 hover:text-zinc-100 hover:bg-white/5 border border-transparent font-medium"
            }`}
          >
            <Icon
              className={`w-4 h-4 ${
                isActive ? item.activeColor : "text-zinc-500"
              }`}
            />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

function DesktopCategoryNavFallback() {
  return (
    <nav className="hidden lg:flex items-center gap-1.5 shrink-0">
      {NAV_ITEMS.map((item, idx) => {
        const Icon = item.icon;
        const isActive = idx === 0;
        return (
          <div
            key={item.id}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm transition-all cursor-pointer ${
              isActive
                ? "bg-gradient-to-r from-purple-600/30 to-indigo-600/30 text-white border border-purple-500/60 shadow-lg shadow-purple-600/20 font-bold backdrop-blur-md"
                : "text-zinc-400 hover:text-zinc-100 hover:bg-white/5 border border-transparent font-medium"
            }`}
          >
            <Icon
              className={`w-4 h-4 ${
                isActive ? item.activeColor : "text-zinc-500"
              }`}
            />
            <span>{item.label}</span>
          </div>
        );
      })}
    </nav>
  );
}

function MobileCategoryNav({
  activeCategory,
  onSelectCategory,
  onClose,
}: {
  activeCategory?: "all" | "now" | "popular" | "upcoming";
  onSelectCategory?: (category: "now" | "popular" | "upcoming") => void;
  onClose: () => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlCategory = searchParams?.get("category") as
    | "now"
    | "popular"
    | "upcoming"
    | null;

  const currentCategory: "all" | "now" | "popular" | "upcoming" =
    pathname === "/" ? activeCategory || urlCategory || "all" : "all";

  const handleNavClick = (cat: "all" | "now" | "popular" | "upcoming") => {
    if (cat === "all") {
      if (pathname === "/") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        router.push("/");
      }
    } else {
      router.push(`/?category=${cat}`);
      onSelectCategory?.(cat);
    }
    onClose();
  };

  return (
    <div className="space-y-1.5 pt-1">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = currentCategory === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => handleNavClick(item.id)}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm transition-all cursor-pointer text-left ${
              isActive
                ? "bg-gradient-to-r from-purple-600/30 to-indigo-600/30 text-white border border-purple-500/60 shadow-lg shadow-purple-600/20 font-bold backdrop-blur-md"
                : "text-zinc-400 hover:text-white hover:bg-[#1a1d2e] border border-transparent font-medium"
            }`}
          >
            <Icon
              className={`w-4 h-4 ${
                isActive ? item.activeColor : "text-zinc-500"
              }`}
            />
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function MobileCategoryNavFallback() {
  return (
    <div className="space-y-1.5 pt-1">
      {NAV_ITEMS.map((item, idx) => {
        const Icon = item.icon;
        const isActive = idx === 0;
        return (
          <div
            key={item.id}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm ${
              isActive
                ? "bg-gradient-to-r from-purple-600/30 to-indigo-600/30 text-white border border-purple-500/60"
                : "text-zinc-400"
            }`}
          >
            <Icon
              className={`w-4 h-4 ${
                isActive ? item.activeColor : "text-zinc-500"
              }`}
            />
            <span>{item.label}</span>
          </div>
        );
      })}
    </div>
  );
}

export interface NavbarProps {
  onSearchFocus?: () => void;
  onSelectCategory?: (category: "now" | "popular" | "upcoming") => void;
  activeCategory?: "all" | "now" | "popular" | "upcoming";
}

export function Navbar({
  onSearchFocus,
  onSelectCategory,
  activeCategory,
}: NavbarProps) {
  const { watchlist, history, openDrawer, openSearchModal } = useAnimeApp();
  const {
    user,
    isAuthenticated,
    logout,
    checkAuth,
    login,
    isLoading: isAuthLoading,
  } = useUserStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-purple-500/20 bg-[#0b0c10]/90 backdrop-blur-md select-none">
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-14 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
          <img
            src="/icon.svg"
            alt="AniVFX Logo"
            className="w-9 h-9 object-contain drop-shadow-md group-hover:scale-105 transition-transform shrink-0"
          />
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-heading font-black text-lg sm:text-xl tracking-normal bg-gradient-to-r from-white via-zinc-100 to-purple-300 bg-clip-text text-transparent">
                AniVFX
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#7950f2]/20 text-purple-300 border border-purple-500/30">
                MAL v4
              </span>
            </div>
            <span className="text-[10px] text-zinc-400 -mt-1 hidden sm:block font-medium">
              Discovery & Streaming
            </span>
          </div>
        </Link>

        {/* Center: Desktop Navigation Links with Icons & High-Contrast Active Style */}
        <Suspense fallback={<DesktopCategoryNavFallback />}>
          <DesktopCategoryNav
            activeCategory={activeCategory}
            onSelectCategory={onSelectCategory}
          />
        </Suspense>

        {/* Right: Actions Bar (STRICTLY flex-nowrap to prevent ugly wrapping) */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-nowrap shrink-0">
          {/* Quick Search Button (Triggers Search Modal) */}
          <button
            type="button"
            onClick={() =>
              onSearchFocus ? onSearchFocus() : openSearchModal()
            }
            className="flex items-center gap-2 px-3 sm:px-3.5 py-2 rounded-xl bg-[#1a1d2e] hover:bg-[#242940] border border-purple-500/30 hover:border-purple-500/60 text-xs sm:text-sm font-semibold text-zinc-300 hover:text-white transition-all shadow-inner shrink-0 cursor-pointer active:scale-95"
            title="Tìm kiếm anime (Ctrl+K)"
          >
            <Search className="w-4 h-4 text-purple-400" />
            <span className="hidden md:inline">Tìm kiếm...</span>
            <kbd className="hidden xl:inline text-[10px] px-1.5 py-0.5 rounded bg-[#0b0c10] text-zinc-400 border border-purple-500/25">
              ⌘K
            </kbd>
          </button>

          {/* Watchlist Icon Button with Tooltip & Badge */}
          <button
            type="button"
            onClick={() => openDrawer("watchlist")}
            className="relative p-2.5 rounded-xl bg-[#1a1d2e] hover:bg-[#242940] border border-purple-500/25 hover:border-purple-500/60 text-zinc-200 transition-all shadow-sm shrink-0 cursor-pointer active:scale-95"
            title="Danh sách theo dõi của tôi"
            aria-label="Danh sách theo dõi của tôi"
          >
            <Bookmark className="w-4.5 h-4.5 text-[#9775fa] shrink-0" />
            {watchlist.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold rounded-full bg-[#7950f2] text-white shadow-sm ring-2 ring-[#0b0c10]">
                {watchlist.length}
              </span>
            )}
          </button>

          {/* History Icon Button with Tooltip & Badge */}
          <button
            type="button"
            onClick={() => openDrawer("history")}
            className="relative p-2.5 rounded-xl bg-[#1a1d2e] hover:bg-[#242940] border border-purple-500/25 hover:border-purple-500/60 text-zinc-200 transition-all shadow-sm shrink-0 cursor-pointer active:scale-95"
            title="Lịch sử xem phim"
            aria-label="Lịch sử xem phim"
          >
            <History className="w-4.5 h-4.5 text-amber-400 shrink-0" />
            {history.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold rounded-full bg-amber-400 text-black shadow-sm ring-2 ring-[#0b0c10]">
                {history.length}
              </span>
            )}
          </button>

          {/* Login / Profile Button */}
          {isAuthenticated && user ? (
            <div className="relative pl-1 shrink-0" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#1f233a] hover:bg-[#282d4a] border border-purple-500/40 text-xs font-bold text-purple-200 transition-all cursor-pointer shadow-sm active:scale-95"
              >
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name || "User"}
                    className="w-5 h-5 rounded-full object-cover"
                  />
                ) : (
                  <span className="w-5 h-5 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 text-white flex items-center justify-center text-[10px] font-black">
                    {(user.name || user.email || "U")[0].toUpperCase()}
                  </span>
                )}
                <span className="max-w-[80px] sm:max-w-[120px] truncate text-white">
                  {user.name || user.email.split("@")[0]}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
              </button>

              {/* Dropdown Menu */}
              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#141624] border border-purple-500/30 shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-3">
                  <div className="px-2 py-1.5 border-b border-zinc-800">
                    <p className="text-sm font-bold text-white truncate">
                      {user.name || "Thành viên AniVFX"}
                    </p>
                    <p className="text-xs text-zinc-400 truncate">
                      {user.email}
                    </p>
                    {user.roles && user.roles.length > 0 && (
                      <div className="flex items-center gap-1 mt-1.5">
                        <Shield className="w-3 h-3 text-purple-400" />
                        <span className="text-[10px] font-semibold text-purple-300 bg-purple-950/80 px-1.5 py-0.5 rounded border border-purple-500/30">
                          {user.roles.join(", ")}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <button
                      type="button"
                      onClick={() => {
                        openDrawer("watchlist");
                        setUserDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white hover:bg-[#1f2238] transition text-left cursor-pointer"
                    >
                      <Bookmark className="w-4 h-4 text-purple-400" />
                      <span>Danh sách của tôi ({watchlist.length})</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        openDrawer("history");
                        setUserDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white hover:bg-[#1f2238] transition text-left cursor-pointer"
                    >
                      <History className="w-4 h-4 text-amber-400" />
                      <span>Lịch sử xem phim ({history.length})</span>
                    </button>
                  </div>

                  <div className="pt-2 border-t border-zinc-800">
                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        setUserDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-bold text-rose-300 hover:bg-rose-950/40 transition text-left cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => login()}
              disabled={isAuthLoading}
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-[#7950f2] to-[#9775fa] hover:from-[#845ef7] hover:to-[#a380fc] text-white font-bold text-xs sm:text-sm shadow-md shadow-purple-600/30 hover:shadow-purple-600/50 transition-all shrink-0 cursor-pointer active:scale-95 disabled:opacity-60"
              title="Đăng nhập với VNTEZ IAM"
            >
              {isAuthLoading ? (
                <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin shrink-0" />
              ) : (
                <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              )}
              <span>{isAuthLoading ? "Đang kết nối..." : "Đăng nhập"}</span>
            </button>
          )}

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl bg-[#1a1d2e] border border-purple-500/20 text-zinc-300 hover:text-white shrink-0 cursor-pointer"
            aria-label="Menu"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-purple-500/20 bg-[#0b0c10] px-4 py-3 space-y-2 animate-in slide-in-from-top-2">
          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              if (onSearchFocus) onSearchFocus();
              else openSearchModal();
            }}
            className="w-full flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-bold bg-[#1a1d2e] text-purple-300 border border-purple-500/30"
          >
            <Search className="w-4 h-4" />
            <span>Tìm kiếm anime...</span>
          </button>

          <Suspense fallback={<MobileCategoryNavFallback />}>
            <MobileCategoryNav
              activeCategory={activeCategory}
              onSelectCategory={onSelectCategory}
              onClose={() => setMobileMenuOpen(false)}
            />
          </Suspense>
        </div>
      )}
    </header>
  );
}
