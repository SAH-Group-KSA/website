"use client";

import { useScrollUI } from "@/hooks/useScrollUI";

export function ScrollProgress() {
  const progress = useScrollUI((state) => state.progress);

  return (
    <div aria-hidden="true" className="scroll-progress">
      <span style={{ transform: `scaleX(${progress / 100})` }} />
    </div>
  );
}
