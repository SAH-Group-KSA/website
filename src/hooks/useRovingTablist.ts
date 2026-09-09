"use client";

import { useCallback, type KeyboardEvent } from "react";

type Orientation = "horizontal" | "vertical";
type ItemRole = "tab" | "radio";

/**
 * WAI-ARIA Tabs / radiogroup keyboard pattern: Arrow / Home / End move
 * selection + focus. Attach `onKeyDown` to the tablist / radiogroup.
 */
export function useRovingTablist(
  ids: string[],
  activeId: string,
  setActiveId: (id: string) => void,
  orientation: Orientation = "horizontal",
  itemRole: ItemRole = "tab",
) {
  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLElement>) => {
      if (!ids.length) return;

      const rtl =
        typeof document !== "undefined" &&
        document.documentElement.dir === "rtl";
      const prevKey =
        orientation === "horizontal"
          ? rtl
            ? "ArrowRight"
            : "ArrowLeft"
          : "ArrowUp";
      const nextKey =
        orientation === "horizontal"
          ? rtl
            ? "ArrowLeft"
            : "ArrowRight"
          : "ArrowDown";

      let nextIndex = -1;
      const current = Math.max(0, ids.indexOf(activeId));

      switch (event.key) {
        case prevKey:
          nextIndex = (current - 1 + ids.length) % ids.length;
          break;
        case nextKey:
          nextIndex = (current + 1) % ids.length;
          break;
        case "Home":
          nextIndex = 0;
          break;
        case "End":
          nextIndex = ids.length - 1;
          break;
        default:
          return;
      }

      event.preventDefault();
      const nextId = ids[nextIndex];
      if (!nextId) return;
      setActiveId(nextId);

      const items = event.currentTarget.querySelectorAll<HTMLElement>(
        `[role="${itemRole}"]`,
      );
      items[nextIndex]?.focus();
    },
    [ids, activeId, setActiveId, orientation, itemRole],
  );

  return { onKeyDown };
}
