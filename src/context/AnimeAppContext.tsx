"use client";

import type React from "react";
import { useEffect } from "react";
import { useAnimeAppStore } from "@/store/useAnimeAppStore";

export function AnimeAppProvider({ children }: { children: React.ReactNode }) {
  const hydrateFromStorage = useAnimeAppStore((s) => s.hydrateFromStorage);
  const toggleSearchModal = useAnimeAppStore((s) => s.toggleSearchModal);

  useEffect(() => {
    hydrateFromStorage();
  }, [hydrateFromStorage]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        toggleSearchModal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleSearchModal]);

  return <>{children}</>;
}

export function useAnimeApp() {
  return useAnimeAppStore();
}
