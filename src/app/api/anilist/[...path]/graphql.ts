const ANILIST_ENDPOINT = "https://graphql.anilist.co";

export const MEDIA_CARD_FIELDS = `
  id
  title { romaji english native }
  coverImage { extraLarge large color }
  bannerImage
  trailer { id site thumbnail }
  format
  source
  episodes
  duration
  status
  averageScore
  meanScore
  popularity
  favourites
  description(asHtml: false)
  seasonYear
  season
  isAdult
  nextAiringEpisode { episode airingAt }
  startDate { year month day }
  endDate { year month day }
  genres
  studios(isMain: true) { nodes { id name } }
  rankings { rank type allTime context }
`;

export const RELATION_NODE_FIELDS = `
  id
  title { romaji english native }
  type
  format
  status
  seasonYear
  startDate { year month day }
`;

export async function queryAniList<T>(
  query: string,
  variables: Record<string, unknown> = {},
): Promise<T | null> {
  const res = await fetch(ANILIST_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ query, variables }),
    next: { revalidate: 300 },
  });

  if (!res.ok) return null;
  const json = await res.json();
  if (json.errors && !json.data) return null;
  return json.data as T;
}

export async function fetchMediaById(id: number, extraFields = "") {
  const query = `
    query ($id: Int) {
      Media(id: $id, type: ANIME) {
        ${MEDIA_CARD_FIELDS}
        ${extraFields}
      }
    }
  `;
  const data = await queryAniList<{ Media: unknown | null }>(query, { id });
  return data?.Media ?? null;
}
