const ANILIST_ENDPOINT = "https://graphql.anilist.co";

export interface AnimeMeta {
  romaji: string | null;
  english: string | null;
  native: string | null;
  episodes: number | null;
  format: string | null;
  seasonYear: number | null;
}

export async function fetchAnimeMeta(
  anilistId: number,
): Promise<AnimeMeta | null> {
  const query = `
    query ($id: Int) {
      Media(id: $id, type: ANIME) {
        title { romaji english native }
        episodes
        format
        seasonYear
      }
    }
  `;

  try {
    const res = await fetch(ANILIST_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables: { id: anilistId } }),
      next: { revalidate: 3600 },
    });

    if (!res.ok) return null;
    const json = await res.json();
    const media = json.data?.Media;
    if (!media) return null;

    return {
      romaji: media.title?.romaji ?? null,
      english: media.title?.english ?? null,
      native: media.title?.native ?? null,
      episodes: media.episodes ?? null,
      format: media.format ?? null,
      seasonYear: media.seasonYear ?? null,
    };
  } catch {
    return null;
  }
}
