const anime = {
  id: 1,
  type: "ANIME",
  format: "TV",
  status: "FINISHED",
  title: { romaji: "Fixture Anime" },
  episodes: 3,
  trailer: { site: "youtube", id: "invalid-test-trailer" },
  externalLinks: [
    {
      site: "Official catalogue",
      type: "STREAMING",
      url: "https://example.test/series",
    },
  ],
  characters: { edges: [] },
  recommendations: { nodes: [] },
  relations: { edges: [] },
};

const realFetch = globalThis.fetch;
globalThis.fetch = (input, options) => {
  if (String(input) !== "https://graphql.anilist.co") {
    return realFetch(input, options);
  }
  const { query } = JSON.parse(options.body);
  return Promise.resolve(
    Response.json({
      data: query.includes("Page(")
        ? { Page: { media: [anime] } }
        : { Media: anime },
    }),
  );
};
