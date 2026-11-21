import { afterEach, expect, test } from "bun:test";
import { NextRequest } from "next/server";
import { getEpisodes } from "../src/app/api/anilist/[...path]/media-episodes";
import { getRelations } from "../src/app/api/anilist/[...path]/media-relations";
import { GET as getStream } from "../src/app/api/stream/route";
import { listAnimeEpisodes } from "../src/utils/episodes";
import { buildAnimeSeasons } from "../src/utils/seasons";

const originalFetch = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = originalFetch;
});

function graph(fetchData) {
  globalThis.fetch = async (_url, options) =>
    Response.json({
      data: fetchData(JSON.parse(options.body)),
    });
}

const release = (id, english, year, episodes, month = 1) => ({
  id,
  title: { english },
  type: "ANIME",
  format: "TV",
  status: "FINISHED",
  episodes,
  startDate: { year, month, day: 1 },
  coverImage: { large: `https://example.test/cover-${id}.jpg` },
});

test("declared split counts win over inherited streaming listings", async () => {
  const records = new Map([
    [99147, release(99147, "Attack on Titan Season 3", 2018, 12)],
    [104578, release(104578, "Attack on Titan Season 3 Part 2", 2019, 10)],
  ]);
  const streamingEpisodes = Array.from({ length: 25 }, (_, index) => ({
    title: `Episode ${index + 1} - Season 1`,
  }));
  graph(({ variables }) => ({
    Media: { ...records.get(variables.id), streamingEpisodes },
  }));
  for (const [id, count] of [
    [99147, 12],
    [104578, 10],
  ]) {
    const { data, pagination } = await (await getEpisodes(id)).json();
    expect(data.map(({ id }) => id)).toEqual(
      Array.from({ length: count }, (_, index) => index + 1),
    );
    expect(data[0].title).toBe("Tập 1");
    expect(pagination.items.total).toBe(count);
    expect(
      listAnimeEpisodes(
        records.get(id),
        Array.from({ length: 25 }, (_, i) => ({ id: i + 1 })),
      ),
    ).toHaveLength(count);
  }
});

test("scheduled runs are capped to aired units and missing counts use only unique contiguous numbers", async () => {
  graph(({ variables }) => ({
    Media: {
      status: "RELEASING",
      episodes: variables.id === 1 ? 24 : null,
      nextAiringEpisode: variables.id === 1 ? { episode: 5 } : null,
      streamingEpisodes: [
        { title: "Episode 1 – First" },
        { title: "Episode 1 – Alternate stream" },
        { title: "Episode 2 – Second" },
        { title: "Episode 3.5 – Recap" },
        { title: "Episode 30 – Other season" },
      ],
    },
  }));
  expect((await (await getEpisodes(1)).json()).data).toHaveLength(4);
  expect((await (await getEpisodes(2)).json()).data).toHaveLength(2);
});

test("franchise traversal reaches distant releases without duplicated or alternative editions", async () => {
  const nodes = [
    release(1, "Example Season 1", 2020, 12),
    release(20, "Example Season 2", 2021, 10, 4),
    release(3, "Example Season 2 Part 2", 2021, 8, 10),
    release(4, "Example Season 3", 2022, 20),
    release(5, "Example Season 4", 2023, 18),
  ];
  const alternative = release(6, "Example Movie Compilation", 2021, 1);
  const laterPrequel = {
    ...release(7, "Example Prequel OVA", 2024, 2),
    format: "OVA",
  };
  const rows = nodes.map((node, index) => ({
    ...node,
    relations: {
      edges: [
        ...(nodes[index - 1]
          ? [{ relationType: "PREQUEL", node: nodes[index - 1] }]
          : []),
        ...(nodes[index + 1]
          ? [{ relationType: "SEQUEL", node: nodes[index + 1] }]
          : []),
        { relationType: "COMPILATION", node: alternative },
        ...(index === 0
          ? [{ relationType: "PREQUEL", node: laterPrequel }]
          : []),
      ],
    },
  }));
  rows.push({ ...laterPrequel, relations: { edges: [] } });
  graph(({ variables }) => ({
    Page: { media: rows.filter((item) => variables.ids.includes(item.id)) },
  }));
  const { data } = await (await getRelations(1)).json();
  const seasons = buildAnimeSeasons(data);
  expect(seasons.map(({ id }) => id)).toEqual([1, 20, 3, 4, 5, 7]);
  expect(seasons[2]).toMatchObject({
    year: 2021,
    episodes: 8,
    coverImage: "https://example.test/cover-3.jpg",
  });
  expect(seasons[4].relationType).toBe("SEQUEL");
});

test("combined provider releases map only the verified part window", async () => {
  const first = release(11, "Example Season 3", 2018, 12);
  const second = release(12, "Example Season 3 Part 2", 2019, 10);
  const refs = new Map([
    [
      11,
      {
        ...first,
        relations: { edges: [{ relationType: "SEQUEL", node: second }] },
      },
    ],
    [
      12,
      {
        ...second,
        relations: { edges: [{ relationType: "PREQUEL", node: first }] },
      },
    ],
  ]);
  let available = 22;
  globalThis.fetch = async (input, options) => {
    const url = String(input);
    if (url.includes("graphql.anilist.co")) {
      const { variables } = JSON.parse(options.body);
      return Response.json({ data: { Media: refs.get(variables.id) } });
    }
    if (url.includes("tim-kiem")) {
      return Response.json({
        data: { items: [{ slug: "wrong-season" }, { slug: "combined" }] },
      });
    }
    const wrong = url.endsWith("wrong-season");
    return Response.json({
      movie: {
        origin_name: wrong ? "Example" : "Example (Season 3)",
        year: 2018,
        episode_total: wrong ? 25 : 22,
      },
      episodes: [
        {
          server_name: "Test",
          server_data: Array.from(
            { length: wrong ? 25 : available },
            (_, index) => ({
              name: `Tập ${index + 1}`,
              slug: `tap-${index + 1}`,
              link_embed: "",
              link_m3u8: `https://example.test/${wrong ? "wrong" : "combined"}/episode-${index + 1}.m3u8`,
            }),
          ),
        },
      ],
    });
  };
  const resolve = async (id, episode) =>
    (
      await getStream(
        new NextRequest(
          `http://localhost/api/stream?anilistId=${id}&episode=${episode}`,
        ),
      )
    ).json();

  expect((await resolve(11, 12)).servers[0].m3u8Url).toEndWith(
    "/combined/episode-12.m3u8",
  );
  expect((await resolve(11, 13)).success).toBe(false);
  expect((await resolve(12, 1)).servers[0].m3u8Url).toEndWith(
    "/combined/episode-13.m3u8",
  );
  expect((await resolve(12, 10)).servers[0].m3u8Url).toEndWith(
    "/combined/episode-22.m3u8",
  );
  available = 21;
  expect((await resolve(12, 1)).success).toBe(false);
});
