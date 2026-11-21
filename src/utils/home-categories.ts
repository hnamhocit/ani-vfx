export type HomeCategory = "all" | "now" | "popular" | "upcoming";

export function parseHomeCategory(value: string | null): HomeCategory {
  if (value === "now" || value === "popular" || value === "upcoming")
    return value;
  return "all";
}

export function homeCategoryId(category: HomeCategory) {
  return `category-${category}`;
}

export function homeCategoryHref(category: HomeCategory) {
  return category === "all"
    ? `/#${homeCategoryId(category)}`
    : `/?category=${category}#${homeCategoryId(category)}`;
}
