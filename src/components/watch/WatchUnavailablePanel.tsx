import { ExternalLink, RefreshCw, Tv } from "lucide-react";

interface ExternalStreamingLink {
  site?: string | null;
  url?: string | null;
  type?: string | null;
}

function officialLinks(entries: ExternalStreamingLink[]) {
  const links = new Map<string, { site: string; href: string }>();
  for (const entry of entries) {
    if (!entry || entry.type !== "STREAMING" || !entry.site || !entry.url)
      continue;
    try {
      const url = new URL(entry.url);
      if (url.protocol === "https:" && !links.has(entry.site)) {
        links.set(entry.site, { site: entry.site, href: url.href });
      }
    } catch {
      // Invalid catalogue URL.
    }
  }
  return [...links.values()];
}

export function WatchUnavailablePanel({
  error,
  links,
  onRetry,
}: {
  error: string | null;
  links: ExternalStreamingLink[];
  onRetry: () => void;
}) {
  const providers = officialLinks(links);

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2 overflow-hidden bg-zinc-950 px-3 py-2 text-center sm:gap-3 sm:p-6">
      <Tv aria-hidden="true" className="hidden size-9 text-zinc-500 sm:block" />
      <div>
        <h3 className="text-sm font-bold text-white sm:text-lg">
          Chưa có nguồn phát cho tập này
        </h3>
        {error && (
          <p className="mt-0.5 line-clamp-2 text-xs text-zinc-400 sm:text-sm">
            {error}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-purple-600 px-3 py-2 text-xs font-semibold text-white hover:bg-purple-500"
      >
        <RefreshCw aria-hidden="true" className="size-3.5" />
        Thử lại
      </button>
      {providers.length > 0 && (
        <div
          aria-label="Nguồn xem chính thức"
          className="flex max-w-full items-center gap-1.5 overflow-x-auto pb-1"
        >
          {providers.map(({ site, href }) => (
            <a
              key={site}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-white/10 px-2 py-1.5 text-xs font-medium text-zinc-300 hover:bg-white/10 hover:text-white"
            >
              {site}
              <ExternalLink aria-hidden="true" className="size-3" />
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
