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
    activeColor: "text-purple-400",
  },
  {
    id: "now" as const,
    label: "Mùa này",
    icon: Flame,
    activeColor: "text-amber-400",
  },
  {
    id: "popular" as const,
    label: "Thịnh hành",
    icon: TrendingUp,
    activeColor: "text-indigo-400",
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
    <nav className="hidden md:flex items-center gap-1 bg-white/[0.03] p-1 rounded-xl border border-white/[0.07] shrink-0">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = currentCategory === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => handleNavClick(item.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all cursor-pointer whitespace-nowrap ${isActive
                ? "bg-white/10 text-white font-semibold shadow-sm"
                : "text-zinc-300 hover:text-white hover:bg-white/[0.05] font-medium"
              }`}
          >
            <Icon
              className={`w-4 h-4 shrink-0 ${isActive ? item.activeColor : "text-zinc-400"
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
    <nav className="hidden md:flex items-center gap-1 bg-white/[0.03] p-1 rounded-xl border border-white/[0.07] shrink-0">
      {NAV_ITEMS.map((item, idx) => {
        const Icon = item.icon;
        const isActive = idx === 0;
        return (
          <div
            key={item.id}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm whitespace-nowrap ${isActive
                ? "bg-white/10 text-white font-semibold"
                : "text-zinc-300 font-medium"
              }`}
          >
            <Icon
              className={`w-4 h-4 shrink-0 ${isActive ? item.activeColor : "text-zinc-400"
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
    <div className="grid grid-cols-2 gap-1.5 pt-1">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = currentCategory === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => handleNavClick(item.id)}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm transition-all cursor-pointer text-left ${isActive
                ? "bg-white/10 text-white border border-white/15 font-semibold"
                : "text-zinc-300 hover:text-white hover:bg-white/[0.05] border border-transparent font-medium"
              }`}
          >
            <Icon
              className={`w-4 h-4 shrink-0 ${isActive ? item.activeColor : "text-zinc-400"
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
    <div className="grid grid-cols-2 gap-1.5 pt-1">
      {NAV_ITEMS.map((item, idx) => {
        const Icon = item.icon;
        const isActive = idx === 0;
        return (
          <div
            key={item.id}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm ${isActive ? "bg-white/10 text-white font-semibold" : "text-zinc-300"
              }`}
          >
            <Icon
              className={`w-4 h-4 shrink-0 ${isActive ? item.activeColor : "text-zinc-400"
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
          <DesktopCategoryNav
            activeCategory={activeCategory}
            onSelectCategory={onSelectCategory}
          />
        </Suspense>

        <div className="flex items-center gap-1 sm:gap-2 min-w-0">
          <button
            type="button"
            onClick={() =>
              onSearchFocus ? onSearchFocus() : openSearchModal()
            }
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

          <button
            type="button"
            onClick={() => openDrawer("watchlist")}
            className="relative p-2 sm:p-2.5 rounded-xl hover:bg-white/[0.08] text-zinc-300 hover:text-white transition-all shrink-0 cursor-pointer active:scale-95"
            title="Danh sách theo dõi"
            aria-label="Danh sách theo dõi"
          >
            <Bookmark className="w-[18px] h-[18px] text-purple-400 shrink-0" />
            {watchlist.length > 0 && (
              <span className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 flex items-center justify-center min-w-[15px] h-[15px] sm:min-w-[16px] sm:h-[16px] px-1 text-[10px] font-bold rounded-full bg-purple-500 text-white ring-2 ring-[#0b0c10]">
                {watchlist.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => openDrawer("history")}
            className="relative p-2 sm:p-2.5 rounded-xl hover:bg-white/[0.08] text-zinc-300 hover:text-white transition-all shrink-0 cursor-pointer active:scale-95"
            title="Lịch sử xem"
            aria-label="Lịch sử xem"
          >
            <History className="w-[18px] h-[18px] text-amber-400 shrink-0" />
            {history.length > 0 && (
              <span className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 flex items-center justify-center min-w-[15px] h-[15px] sm:min-w-[16px] sm:h-[16px] px-1 text-[10px] font-bold rounded-full bg-amber-400 text-zinc-950 ring-2 ring-[#0b0c10]">
                {history.length}
              </span>
            )}
          </button>

          <div className="h-5 w-px bg-white/10 mx-0.5 hidden sm:block" />

          {isAuthenticated && user ? (
            <div className="relative shrink-0" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-1.5 sm:gap-2 p-1 sm:pl-2 sm:pr-2.5 sm:py-1.5 rounded-full sm:rounded-xl bg-white/[0.06] hover:bg-white/[0.11] border border-white/10 text-xs sm:text-sm font-semibold text-white transition-all cursor-pointer active:scale-95"
                aria-label="Tài khoản"
              >
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name || "User"}
                    className="w-6 h-6 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <span className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                    {(user.name || user.email || "U")[0].toUpperCase()}
                  </span>
                )}
                <span className="hidden sm:inline max-w-[90px] xl:max-w-[130px] truncate">
                  {user.name || user.email.split("@")[0]}
                </span>
                <ChevronDown className="hidden sm:block w-3.5 h-3.5 text-zinc-400 shrink-0" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-60 max-w-[calc(100vw-1.5rem)] rounded-2xl bg-[#13151f] border border-white/10 shadow-2xl p-2 z-50 space-y-1.5">
                  <div className="px-2.5 py-2 border-b border-white/[0.08]">
                    <p className="text-sm font-semibold text-white truncate">
                      {user.name || "Thành viên AniVFX"}
                    </p>
                    <p className="text-xs text-zinc-400 truncate">
                      {user.email}
                    </p>
                    {user.roles && user.roles.length > 0 && (
                      <div className="flex items-center gap-1 mt-1.5">
                        <Shield className="w-3 h-3 text-purple-400" />
                        <span className="text-[10px] font-semibold text-purple-300 bg-purple-500/15 px-1.5 py-0.5 rounded">
                          {user.roles.join(", ")}
                        </span>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      openDrawer("watchlist");
                      setUserDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium text-zinc-200 hover:text-white hover:bg-white/[0.07] transition text-left cursor-pointer"
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
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium text-zinc-200 hover:text-white hover:bg-white/[0.07] transition text-left cursor-pointer"
                  >
                    <History className="w-4 h-4 text-amber-400" />
                    <span>Lịch sử xem ({history.length})</span>
                  </button>

                  <div className="pt-1 border-t border-white/[0.08]">
                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        setUserDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition text-left cursor-pointer"
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
              className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs sm:text-sm shadow-sm transition-all shrink-0 cursor-pointer active:scale-95 disabled:opacity-60 whitespace-nowrap"
              title="Đăng nhập với VNTEZ IAM"
            >
              {isAuthLoading ? (
                <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin shrink-0" />
              ) : (
                <User className="hidden sm:block w-4 h-4 shrink-0" />
              )}
              <span>{isAuthLoading ? "..." : "Đăng nhập"}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 sm:p-2 rounded-xl hover:bg-white/[0.08] text-zinc-200 hover:text-white shrink-0 cursor-pointer"
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

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/[0.08] bg-[#0b0c10] px-4 py-3 space-y-2.5">
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
