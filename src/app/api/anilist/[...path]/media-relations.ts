import { NextResponse } from "next/server";
import { queryAniList, RELATION_NODE_FIELDS } from "./graphql";

export async function getRelations(rootId: number) {
  const ALLOWED_RELS = new Set([
    "PREQUEL",
    "SEQUEL",
    "PARENT",
    "SIDE_STORY",
    "SPIN_OFF",
  ]);

  const visited = new Map<number, any>();
  const collectedEdges: Array<{ relationType: string; node: any }> = [];
  let frontier: number[] = [rootId];

  for (let depth = 0; depth < 3 && frontier.length > 0; depth++) {
    const batchQuery = `
      query ($ids: [Int]) {
        Page(page: 1, perPage: 50) {
          media(id_in: $ids, type: ANIME) {
            ${RELATION_NODE_FIELDS}
            relations {
              edges {
                relationType
                node {
                  ${RELATION_NODE_FIELDS}
                }
              }
            }
          }
        }
      }
    `;

    const batchData = await queryAniList<{
      Page?: { media?: any[] };
    }>(batchQuery, { ids: frontier });

    const mediaList = batchData?.Page?.media || [];
    const nextFrontier: number[] = [];

    for (const m of mediaList) {
      if (!visited.has(m.id)) {
        visited.set(m.id, m);
      }

      for (const edge of m.relations?.edges || []) {
        const relType = edge.relationType;
        const target = edge.node;
        if (!target || target.type !== "ANIME" || !ALLOWED_RELS.has(relType)) {
          continue;
        }

        if (!visited.has(target.id)) {
          visited.set(target.id, target);
          if (
            relType === "PREQUEL" ||
            relType === "SEQUEL" ||
            relType === "PARENT"
          ) {
            nextFrontier.push(target.id);
          }
        }

        if (target.id !== rootId) {
          collectedEdges.push({
            relationType: relType,
            node: target,
          });
        }
      }
    }

    frontier = Array.from(new Set(nextFrontier));
  }

  const rootMedia = visited.get(rootId);
  if (!rootMedia) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const uniqueMap = new Map<number, { relationType: string; node: any }>();
  for (const item of collectedEdges) {
    if (!uniqueMap.has(item.node.id)) {
      uniqueMap.set(item.node.id, item);
    }
  }

  const sortedEdges = Array.from(uniqueMap.values()).sort((a, b) => {
    const yearA = a.node.seasonYear ?? a.node.startDate?.year ?? 9999;
    const yearB = b.node.seasonYear ?? b.node.startDate?.year ?? 9999;
    if (yearA !== yearB) return yearA - yearB;
    return a.node.id - b.node.id;
  });

  return NextResponse.json({
    data: {
      id: rootMedia.id,
      title: rootMedia.title,
      format: rootMedia.format,
      seasonYear: rootMedia.seasonYear,
      relations: { edges: sortedEdges },
    },
  });
}
