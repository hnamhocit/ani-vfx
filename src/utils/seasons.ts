import type {
  AniListMediaForSeasons,
  AniListRelationType,
  AnimeSeasonItem,
} from '@/types/anilist';

/** Các relation type được coi là một phần của franchise timeline */
const FRANCHISE_RELATION_TYPES: ReadonlySet<AniListRelationType> = new Set([
  'SEQUEL',
  'PREQUEL',
  'SIDE_STORY',
  'SPIN_OFF',
  'PARENT',
]);

/** Thứ tự ưu tiên khi chọn tiêu đề hiển thị */
function resolveTitle(title: { romaji?: string | null; english?: string | null; native?: string | null }): string {
  return title.romaji || title.english || title.native || 'Unknown Title';
}

/** So sánh để sort timeline: PREQUEL → PARENT/SIDE_STORY/SPIN_OFF → SEQUEL, cùng loại thì sort theo year */
function compareSeasonItems(a: AnimeSeasonItem, b: AnimeSeasonItem): number {
  const yearA = a.year ?? 9999;
  const yearB = b.year ?? 9999;
  if (yearA !== yearB) return yearA - yearB;
  return a.id - b.id;
}

export function buildAnimeSeasons(media: AniListMediaForSeasons): AnimeSeasonItem[] {
  const items: AnimeSeasonItem[] = [
    {
      id: media.id,
      title: resolveTitle(media.title),
      relationType: 'PARENT',
      mediaFormat: media.format,
      isCurrent: true,
      unreleased: false,
      year: media.seasonYear ?? null,
    },
  ];

  const edges = media.relations?.edges ?? [];

  for (const edge of edges) {
    const node = edge.node;
    const relationType = edge.relationType;

    if (!relationType || !FRANCHISE_RELATION_TYPES.has(relationType)) continue;
    if (node.type && node.type !== 'ANIME') continue;
    if (node.id === media.id) continue;

    items.push({
      id: node.id,
      title: resolveTitle(node.title),
      relationType,
      mediaFormat: node.format,
      isCurrent: false,
      unreleased: node.status === 'NOT_YET_RELEASED',
      year: node.seasonYear ?? node.startDate?.year ?? null,
    });
  }

  items.sort(compareSeasonItems);
  return items;
}
