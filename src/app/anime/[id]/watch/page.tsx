import type { Metadata } from "next";
import { Suspense } from "react";
import { parsePositiveInteger } from "@/utils/anime";
import { resolveAnimeRoute } from "../../anime-metadata";
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
  const ep = parsePositiveInteger(sp.ep) ?? 1;
  const { id: animeId, title, image } = await resolveAnimeRoute(id);
  const desc = `Xem ${title} Tập ${ep} Vietsub Full HD với tốc độ cao, trình phát video thông minh.`;

  return {
    alternates: { canonical: `/anime/${animeId}/watch?ep=${ep}` },
    title: `${title} Tập ${ep} Vietsub Full HD`,
    description: desc,
    openGraph: {
      title: `Xem ${title} Tập ${ep} Vietsub | AniVFX`,
      description: desc,
      images: [{ url: image, alt: `${title} Tập ${ep}` }],
    },
    twitter: {
      card: "summary_large_image",
      title: `Xem ${title} Tập ${ep} Vietsub | AniVFX`,
      description: desc,
      images: [image],
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
  const ep = parsePositiveInteger(sp.ep) ?? 1;
  const anime = await resolveAnimeRoute(id);
  return <AnimeWatchClient id={anime.id} initialEpisode={ep} />;
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
