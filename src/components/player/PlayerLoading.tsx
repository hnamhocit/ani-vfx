import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";

export function PlayerLoading({ children }: { children: ReactNode }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
      <output className="flex items-center gap-2.5 rounded-xl border border-white/15 bg-black/80 px-4 py-3 text-xs font-semibold text-white sm:text-sm">
        <Loader2
          aria-hidden="true"
          className="size-5 text-purple-300 motion-safe:animate-spin"
        />
        {children}
      </output>
    </div>
  );
}
