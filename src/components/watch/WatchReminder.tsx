import { Coffee } from "lucide-react";

export function WatchReminder({ minutes }: { minutes: number }) {
  return (
    <div className="pointer-events-none absolute inset-x-2 top-2 z-50 flex justify-center sm:inset-x-4 sm:top-4">
      <div
        role="status"
        className="flex max-w-md items-center gap-2.5 rounded-xl border border-amber-300/35 bg-zinc-950/95 px-3 py-2 text-xs text-white shadow-lg sm:text-sm"
      >
        <Coffee aria-hidden="true" className="size-4 shrink-0 text-amber-300" />
        <p>Bạn đã xem {minutes} phút hôm nay. Nhớ cho mắt nghỉ một chút nhé.</p>
      </div>
    </div>
  );
}
