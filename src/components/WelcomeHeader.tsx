"use client";

import { useEffect, useState } from "react";
import { useUserStore } from "@/store/useUserStore";

export function WelcomeHeader() {
  const { user, isAuthenticated } = useUserStore();
  const [greeting, setGreeting] = useState<{ text: string; emoji: string }>({
    text: "Chào buổi tối",
    emoji: "🌙",
  });

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 11) {
      setGreeting({ text: "Chào buổi sáng", emoji: "☀️" });
    } else if (hour >= 11 && hour < 14) {
      setGreeting({ text: "Chào buổi trưa", emoji: "🌤️" });
    } else if (hour >= 14 && hour < 18) {
      setGreeting({ text: "Chào buổi chiều", emoji: "🌇" });
    } else {
      setGreeting({ text: "Chào buổi tối", emoji: "🌙" });
    }
  }, []);

  const displayName =
    user?.name || (user?.email ? user.email.split("@")[0] : null);

  return (
    <div className="w-full flex flex-col justify-center gap-1 px-1 py-1 select-none">
      {/* Dòng 1 nhỏ: Tên người tạo & link */}
      <div>
        <a
          href="https://hnamhocit.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-purple-300 transition-colors group"
          title="Khám phá portfolio của Nguyen Hoang Nam"
        >
          <span>Made by</span>
          <span className="font-bold text-purple-300 group-hover:text-white underline decoration-purple-400/50 underline-offset-2">
            Nguyen Hoang Nam
          </span>
          <span className="text-[10px] text-purple-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">
            ↗
          </span>
        </a>
      </div>

      {/* Dòng 2: Lời chào + Tên user + Emoji */}
      <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-black text-white font-heading tracking-normal leading-tight">
        <span>{greeting.text}, </span>
        <span className="bg-gradient-to-r from-white via-purple-100 to-purple-300 bg-clip-text text-transparent">
          {isAuthenticated && displayName ? displayName : "Bạn hữu anime"}!
        </span>{" "}
        <span>{greeting.emoji}</span>
      </h1>
    </div>
  );
}
