"use client";

import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { homeCategoryHref } from "@/utils/home-categories";

export function Footer() {
  return (
    <footer className="w-full bg-[#08090e] border-t border-purple-500/15 text-zinc-400 font-sans mt-16 select-none">
      <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-14 py-8 sm:py-10 space-y-6">
        {/* Main Row: Brand & Quick Navigation */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-zinc-800/80">
          {/* Brand & Brief Tagline */}
          <div className="space-y-2 max-w-xl">
            <Link href="/" className="inline-flex items-center gap-2.5 group">
              <img
                src="/icon.svg"
                alt="AniVFX Logo"
                className="w-8 h-8 object-contain drop-shadow-md group-hover:scale-105 transition-transform shrink-0"
              />
              <span className="font-heading font-black text-xl text-white tracking-normal">
                Ani<span className="text-[#9775fa]">VFX</span>
              </span>
            </Link>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Khám phá dữ liệu anime phong phú, theo dõi lịch phát sóng và trải
              nghiệm xem phim nhanh chóng với dữ liệu từ AniList.
            </p>
          </div>

          {/* Quick Links & Back to Top */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-xs sm:text-sm font-medium">
            <Link
              href="/"
              className="text-zinc-300 hover:text-purple-300 transition-colors"
            >
              Trang chủ
            </Link>
            <Link
              href={homeCategoryHref("now")}
              className="text-zinc-300 hover:text-purple-300 transition-colors"
            >
              Đang phát sóng
            </Link>
            <Link
              href={homeCategoryHref("popular")}
              className="text-zinc-300 hover:text-purple-300 transition-colors"
            >
              Top thịnh hành
            </Link>
            <Link
              href={homeCategoryHref("upcoming")}
              className="text-zinc-300 hover:text-purple-300 transition-colors"
            >
              Sắp ra mắt
            </Link>
            <a
              href="https://anilist.co"
              target="_blank"
              rel="noreferrer"
              className="text-zinc-400 hover:text-purple-300 transition-colors inline-flex items-center gap-1"
            >
              <span>AniList</span>
              <ExternalLink className="w-3 h-3 text-zinc-500" />
            </a>
          </div>
        </div>

        {/* Bottom Sub-Row: Copyright & Legal Disclaimer */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 text-[11px] sm:text-xs text-zinc-500 leading-relaxed">
          <p>
            © 2026 <span className="text-zinc-300 font-bold">AniVFX</span> • Dữ
            liệu & hình ảnh thuộc quyền sở hữu của các tác giả và AniList.
          </p>
          <p>
            Website phi thương mại phục vụ mục đích học tập & giải trí cá nhân.
            Không lưu trữ tệp video trên máy chủ.
          </p>
        </div>
      </div>
    </footer>
  );
}
