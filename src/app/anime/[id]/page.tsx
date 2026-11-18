import type { Metadata } from "next";
import { Suspense } from "react";
import { AnimeDetailClient } from "./AnimeDetailClient";

const ANILIST_ENDPOINT = "https://graphql.anilist.co";

async function fetchAnimeMeta(id: number) {
  try {
    const res = await fetch(ANILIST_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `query ($id: Int) { Media(id: $id, type: ANIME) { id title { romaji english native } description(asHtml: false) coverImage { extraLarge large } } }`,
        variables: { id },
      }),
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data?.Media ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const numId = Number(id);
  const media = await fetchAnimeMeta(numId);

  const title = media?.title?.english || media?.title?.romaji || `Anime #${id}`;
  const desc = media?.description?.replace(/<[^>]+>/g, "")?.slice(0, 160) || "Xem chi tiết anime, video trailer, danh sách tập và thông tin diễn viên lồng tiếng.";
  const img = media?.coverImage?.extraLarge || media?.coverImage?.large || "/og-image.png";

  return {
    title: `${title} - Chi tiết & Trailer`,
    description: desc,
    openGraph: { title: `${title} - Chi tiết & Trailer | AniVFX`, description: desc, images: [{ url: img, alt: title }] },
    twitter: { card: "summary_large_image", title: `${title} | AniVFX`, description: desc, images: [img] },
  };
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

export default function AnimePage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<DetailLoadingSkeleton />}>
      <AnimeContent params={params} />
    </Suspense>
  );
}
