import type { Metadata } from "next";
import { Suspense } from "react";
import { MOCK_ANIMES } from "@/services/mockData";
import { AnimeDetailClient } from "./AnimeDetailClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const numId = Number(id);
  const anime = MOCK_ANIMES.find((a) => a.mal_id === numId);
  const title = anime?.title_english || anime?.title || `Anime #${id}`;
  const desc =
    anime?.synopsis?.slice(0, 160) ||
    "Xem chi tiết anime, video trailer, danh sách tập và thông tin diễn viên lồng tiếng trên AniVFX.";
  const img =
    anime?.images.webp?.large_image_url ||
    anime?.images.jpg?.large_image_url ||
    "/og-image.png";

  return {
    title: `${title} - Chi tiết & Trailer`,
    description: desc,
    openGraph: {
      title: `${title} - Chi tiết & Trailer | AniVFX`,
      description: desc,
      images: [{ url: img, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | AniVFX`,
      description: desc,
      images: [img],
    },
  };
}

export function generateStaticParams() {
  return MOCK_ANIMES.map((a) => ({ id: a.mal_id.toString() }));
}

async function AnimeContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AnimeDetailClient id={Number(id)} />;
}

function DetailLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-[#0b0c10] text-zinc-100 flex flex-col font-sans">
      <div className="h-16 border-b border-purple-500/20 bg-[#0b0c10]" />
      <div className="flex-1 w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-14 py-8 space-y-8 animate-pulse">
        <div className="w-full aspect-[21/9] max-h-[380px] bg-zinc-900 rounded-3xl" />
        <div className="max-w-5xl mx-auto w-full aspect-video bg-zinc-900/80 rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="h-10 bg-zinc-800 rounded-xl w-2/3" />
            <div className="h-32 bg-zinc-800/60 rounded-xl" />
            <div className="h-48 bg-zinc-800/40 rounded-xl" />
          </div>
          <div className="space-y-4">
            <div className="h-64 bg-zinc-800/50 rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AnimePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<DetailLoadingSkeleton />}>
      <AnimeContent params={params} />
    </Suspense>
  );
}
