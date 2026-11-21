import {
  Bookmark,
  ChevronDown,
  History,
  Loader2,
  LogOut,
  Shield,
  User,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useUserStore } from "@/store/useUserStore";

export function NavbarAccount({
  watchlistCount,
  historyCount,
}: {
  watchlistCount: number;
  historyCount: number;
}) {
  const {
    user,
    isAuthenticated,
    logout,
    checkAuth,
    login,
    isLoading: isAuthLoading,
  } = useUserStore();
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

  return isAuthenticated && user ? (
    <div className="relative shrink-0" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setUserDropdownOpen(!userDropdownOpen)}
        className="flex items-center gap-1.5 sm:gap-2 p-1 sm:pl-2 sm:pr-2.5 sm:py-1.5 rounded-full sm:rounded-xl bg-white/[0.06] hover:bg-white/[0.11] border border-white/10 text-xs sm:text-sm font-semibold text-white transition-all cursor-pointer active:scale-95"
        aria-label="Tài khoản"
        aria-expanded={userDropdownOpen}
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
            <p className="text-xs text-zinc-400 truncate">{user.email}</p>
            {user.roles && user.roles.length > 0 && (
              <div className="flex items-center gap-1 mt-1.5">
                <Shield className="w-3 h-3 text-purple-400" />
                <span className="text-[10px] font-semibold text-purple-300 bg-purple-500/15 px-1.5 py-0.5 rounded">
                  {user.roles.join(", ")}
                </span>
              </div>
            )}
          </div>

          <Link
            href="/library?tab=watchlist"
            onClick={() => setUserDropdownOpen(false)}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium text-zinc-200 hover:text-white hover:bg-white/[0.07] transition text-left"
          >
            <Bookmark className="w-4 h-4 text-purple-400" />
            <span>Danh sách của tôi ({watchlistCount})</span>
          </Link>

          <Link
            href="/library?tab=history"
            onClick={() => setUserDropdownOpen(false)}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium text-zinc-200 hover:text-white hover:bg-white/[0.07] transition text-left"
          >
            <History className="w-4 h-4 text-amber-400" />
            <span>Lịch sử xem ({historyCount})</span>
          </Link>

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
  );
}
