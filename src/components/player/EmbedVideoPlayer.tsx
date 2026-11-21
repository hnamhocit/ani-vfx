import { useState } from "react";
import { PlayerLoading } from "./PlayerLoading";

export function EmbedVideoPlayer({
  src,
  title,
}: {
  src: string;
  title: string;
}) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="relative h-full w-full bg-black">
      <iframe
        src={src}
        title={title}
        onLoad={() => setLoaded(true)}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        allowFullScreen
        className="h-full w-full border-0"
      />
      {!loaded && <PlayerLoading>Đang mở trình phát…</PlayerLoading>}
    </div>
  );
}
