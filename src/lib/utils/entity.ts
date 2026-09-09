import type { Entity, EntityColors } from "@/content/types";
import { getEntityUiColor } from "@/lib/brand-themes";

export function resolveEntityColor(
  entityColors: EntityColors | Record<string, string>,
  id: string,
): string {
  return (
    (entityColors as Record<string, string>)[id] ??
    (entityColors as Record<string, string>).group ??
    getEntityUiColor(id)
  );
}

export function resolveEntityLabel(entities: Entity[], id: string, groupLabel = "SAH Group"): string {
  if (id === "group") return groupLabel;
  return entities.find((e) => e.id === id)?.name ?? groupLabel;
}

export function resolveEntityLogo(entities: Entity[], id: string): string | undefined {
  return entities.find((e) => e.id === id)?.logo;
}
