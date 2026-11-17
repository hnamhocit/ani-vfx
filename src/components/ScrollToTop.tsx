"use client";

import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!isVisible) return null;

  return (
    <button
      type="button"
      onClick={scrollToTop}
      className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-50 w-12 h-12 rounded-2xl bg-[#141624]/90 hover:bg-[#1f233a] border border-purple-500/40 hover:border-purple-400 text-white flex items-center justify-center shadow-2xl shadow-purple-600/40 backdrop-blur-md hover:scale-110 active:scale-95 transition-all cursor-pointer group animate-in fade-in zoom-in-95 duration-200"
      title="Cuộn lên đầu trang"
      aria-label="Cuộn lên đầu trang"
    >
      <ArrowUp className="w-5 h-5 text-purple-300 group-hover:text-white group-hover:-translate-y-0.5 transition-transform" />
    </button>
  );
}
