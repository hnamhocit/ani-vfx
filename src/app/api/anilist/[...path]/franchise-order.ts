import type {
  AniListMediaForSeasons,
  AniListRelationNode,
  AniListRelationType,
} from "@/types/anilist";
import {
  compareKnownReleaseDates,
  compareReleases,
  FRANCHISE_RELATIONS,
} from "@/utils/franchise";

export function orderFranchise(
  rootId: number,
  media: Iterable<AniListMediaForSeasons>,
) {
  const records = [...media];
  const nodes = new Map<number, AniListRelationNode>();
  for (const item of records) {
    const { relations: _relations, ...node } = item;
    nodes.set(item.id, node);
  }
  const labels = new Map<number, AniListRelationType>();
  const following = new Map<number, Set<number>>();
  const preceding = new Map<number, Set<number>>();

  function link(before: number, after: number) {
    const first = nodes.get(before);
    const second = nodes.get(after);
    if (first && second && compareKnownReleaseDates(first, second) > 0) return;

    const next = following.get(before) ?? new Set<number>();
    next.add(after);
    following.set(before, next);
    const previous = preceding.get(after) ?? new Set<number>();
    previous.add(before);
    preceding.set(after, previous);
  }

  for (const item of records) {
    for (const { relationType, node } of item.relations?.edges ?? []) {
      if (
        !relationType ||
        !FRANCHISE_RELATIONS.has(relationType) ||
        node.type === "MANGA" ||
        item.id === node.id
      )
        continue;
      if (!nodes.has(node.id)) nodes.set(node.id, node);
      if (!labels.has(node.id) || item.id === rootId)
        labels.set(node.id, relationType);
      if (relationType === "SEQUEL") link(item.id, node.id);
      if (relationType === "PREQUEL") link(node.id, item.id);
    }
  }

  function reachable(edges: Map<number, Set<number>>) {
    const visited = new Set<number>();
    const pending = [...(edges.get(rootId) ?? [])];
    while (pending.length > 0) {
      const id = pending.pop() as number;
      if (visited.has(id)) continue;
      visited.add(id);
      pending.push(...(edges.get(id) ?? []));
    }
    return visited;
  }

  const beforeRoot = reachable(preceding);
  const afterRoot = reachable(following);
  const pending = [...nodes.values()].sort(compareReleases);
  const remaining = new Set(nodes.keys());
  const ordered = [];
  while (pending.length > 0) {
    // If upstream introduces a cycle, keep deterministic release order for the blocked nodes.
    const index = pending.findIndex(
      (node) =>
        ![...(preceding.get(node.id) ?? [])].some((id) => remaining.has(id)),
    );
    if (index < 0) {
      console.warn("[anilist.relations] Cyclic watch order", {
        rootId,
        blockedIds: pending.map((node) => node.id),
      });
      ordered.push(...pending);
      break;
    }
    const [node] = pending.splice(index, 1);
    ordered.push(node);
    remaining.delete(node.id);
  }

  return {
    watchOrder: ordered.map((node) => node.id),
    edges: ordered
      .filter((node) => node.id !== rootId)
      .map((node) => ({
        node,
        relationType:
          beforeRoot.has(node.id) !== afterRoot.has(node.id)
            ? beforeRoot.has(node.id)
              ? ("PREQUEL" as const)
              : ("SEQUEL" as const)
            : (labels.get(node.id) ?? ("PARENT" as const)),
      })),
  };
}
