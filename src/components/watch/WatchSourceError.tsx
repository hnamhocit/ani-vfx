import { RefreshCw } from "lucide-react";
import type { StreamServer } from "@/types/stream";

export function WatchSourceError({
  alternatives,
  onRetry,
  onSelectServer,
  onEmbed,
}: {
  alternatives: StreamServer[];
  onRetry: () => void;
  onSelectServer: (server: StreamServer) => void;
  onEmbed?: () => void;
}) {
  const secondaryClass =
    "cursor-pointer rounded-lg border border-white/15 px-3 py-1.5 hover:bg-white/10";

  return (
    <div
      role="alert"
      className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-2 overflow-y-auto bg-zinc-950 p-2 text-center text-xs text-zinc-200 sm:p-6 sm:text-sm"
    >
      <p className="font-bold">Không thể phát video từ máy chủ này</p>
      <div className="flex flex-wrap justify-center gap-2">
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-purple-600 px-3 py-2 font-bold text-white hover:bg-purple-500"
        >
          <RefreshCw aria-hidden="true" className="size-4" />
          Thử lại nguồn phát
        </button>
        {onEmbed && (
          <button type="button" onClick={onEmbed} className={secondaryClass}>
            Mở Embed
          </button>
        )}
      </div>
      {alternatives.length > 0 && (
        <div className="flex max-h-20 flex-wrap justify-center gap-2 overflow-y-auto">
          {alternatives.map((server) => (
            <button
              key={server.id}
              type="button"
              onClick={() => onSelectServer(server)}
              className={secondaryClass}
            >
              {server.serverName}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
