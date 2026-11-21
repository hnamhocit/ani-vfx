import { NextResponse } from "next/server";
import type { AniListMediaForSeasons } from "@/types/anilist";
import { orderFranchise } from "./franchise-order";
import { queryAniList, RELATION_NODE_FIELDS } from "./graphql";

const MAX_MEDIA = 64;
const BATCH_SIZE = 25;
const RELATIONS_QUERY = `
  query ($ids: [Int]) {
    Page(page: 1, perPage: 25) {
      media(id_in: $ids, type: ANIME) {
        ${RELATION_NODE_FIELDS}
        relations { edges { relationType node { ${RELATION_NODE_FIELDS} } } }
      }
    }
  }
`;

export async function getRelations(rootId: number) {
  const media = new Map<number, AniListMediaForSeasons>();
  const scheduled = new Set([rootId]);
  const pending = [rootId];
  const timeout = AbortSignal.timeout(6500);

  while (pending.length > 0 && !timeout.aborted) {
    const ids = pending.splice(0, BATCH_SIZE);
    const result = await queryAniList<{
      Page?: { media?: AniListMediaForSeasons[] };
    }>(RELATIONS_QUERY, { ids }, timeout).catch((error: unknown) => {
      console.warn("[anilist.relations] Graph request failed", {
        rootId,
        ids,
        reason: error instanceof Error ? error.name : "Unknown error",
      });
      return null;
    });
    const batch = result?.Page?.media ?? [];
    const missing = ids.filter((id) => !batch.some((node) => node.id === id));
    if (missing.length)
      console.warn("[anilist.relations] Partial graph", { rootId, missing });

    if (!media.size && !batch.length) {
      return NextResponse.json(
        { error: "Relation metadata unavailable" },
        { status: result ? 404 : 502 },
      );
    }

    for (const item of batch) {
      media.set(item.id, item);
      for (const { relationType, node } of item.relations?.edges ?? []) {
        if (
          node.type !== "ANIME" ||
          scheduled.has(node.id) ||
          (relationType !== "PREQUEL" &&
            relationType !== "SEQUEL" &&
            relationType !== "PARENT")
        )
          continue;
        if (scheduled.size >= MAX_MEDIA) continue;
        scheduled.add(node.id);
        pending.push(node.id);
      }
    }
  }

  if (scheduled.size === MAX_MEDIA) {
    console.warn("[anilist.relations] Graph traversal limit reached", {
      rootId,
      limit: MAX_MEDIA,
    });
  }
  const root = media.get(rootId);
  if (!root) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { watchOrder, edges } = orderFranchise(rootId, media.values());
  return NextResponse.json({
    data: { ...root, watchOrder, relations: { edges } },
  });
}
