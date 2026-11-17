import type { Metadata } from "next";
import { Suspense } from "react";
import { MOCK_ANIMES } from "@/services/mockData";
import { AnimeWatchClient } from "./AnimeWatchClient";

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
  const { id } = await params;
  const sp = await searchParams;
  const ep = typeof sp.ep === "string" ? parseInt(sp.ep, 10) : 1;
  const numId = Number(id);
  const anime = MOCK_ANIMES.find((a) => a.mal_id === numId);
  const title = anime?.title_english || anime?.title || `Anime #${id}`;
  const desc = `Xem ${title} Tập ${ep} Vietsub Full HD với tốc độ cao, trình phát video thông minh trên AniVFX.`;
  const img =
    anime?.images.webp?.large_image_url ||
    anime?.images.jpg?.large_image_url ||
    "/og-image.png";

  return {
    title: `${title} Tập ${ep} Vietsub Full HD`,
    description: desc,
    openGraph: {
      title: `Xem ${title} Tập ${ep} Vietsub | AniVFX`,
      description: desc,
      images: [{ url: img, alt: `${title} Tập ${ep}` }],
    },
    twitter: {
      card: "summary_large_image",
      title: `Xem ${title} Tập ${ep} Vietsub | AniVFX`,
      description: desc,
      images: [img],
    },
  };
}

async function WatchContent({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const ep = typeof sp.ep === "string" ? parseInt(sp.ep, 10) : 1;
  return <AnimeWatchClient id={Number(id)} initialEpisode={ep || 1} />;
}

export default function WatchPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0b0c10] text-zinc-100 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent" />
        </div>
      }
    >
      <WatchContent params={params} searchParams={searchParams} />
    </Suspense>
  );
}
