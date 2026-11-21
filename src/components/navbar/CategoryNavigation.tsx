import { CalendarDays, Compass, Flame, TrendingUp } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { homeCategoryHref, parseHomeCategory } from "@/utils/home-categories";

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

function useCurrentCategory() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  return pathname === "/"
    ? parseHomeCategory(searchParams.get("category"))
    : null;
}

export function DesktopCategoryNav() {
  const currentCategory = useCurrentCategory();

  return (
    <nav className="hidden md:flex items-center gap-1 bg-white/[0.03] p-1 rounded-xl border border-white/[0.07] shrink-0">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = currentCategory === item.id;
        return (
          <Link
            key={item.id}
            href={homeCategoryHref(item.id)}
            aria-current={isActive ? "page" : undefined}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all cursor-pointer whitespace-nowrap ${
              isActive
                ? "bg-white/10 text-white font-semibold shadow-sm"
                : "text-zinc-300 hover:text-white hover:bg-white/[0.05] font-medium"
            }`}
          >
            <Icon
              className={`w-4 h-4 shrink-0 ${
                isActive ? item.activeColor : "text-zinc-400"
              }`}
            />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function DesktopCategoryNavFallback() {
  return (
    <nav className="hidden md:flex items-center gap-1 bg-white/[0.03] p-1 rounded-xl border border-white/[0.07] shrink-0">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.id}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm whitespace-nowrap text-zinc-300 font-medium"
          >
            <Icon className="w-4 h-4 shrink-0 text-zinc-400" />
            <span>{item.label}</span>
          </div>
        );
      })}
    </nav>
  );
}

export function MobileCategoryNav({ onClose }: { onClose: () => void }) {
  const currentCategory = useCurrentCategory();

  return (
    <div className="grid grid-cols-2 gap-1.5 pt-1">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = currentCategory === item.id;
        return (
          <Link
            key={item.id}
            href={homeCategoryHref(item.id)}
            aria-current={isActive ? "page" : undefined}
            onClick={onClose}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm transition-all cursor-pointer text-left ${
              isActive
                ? "bg-white/10 text-white border border-white/15 font-semibold"
                : "text-zinc-300 hover:text-white hover:bg-white/[0.05] border border-transparent font-medium"
            }`}
          >
            <Icon
              className={`w-4 h-4 shrink-0 ${
                isActive ? item.activeColor : "text-zinc-400"
              }`}
            />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
