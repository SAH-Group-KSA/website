"use client";

import { useScrollUI } from "@/hooks/useScrollUI";

export function ScrollProgress() {
  const { progress } = useScrollUI();

  return (
    <div aria-hidden="true" className="scroll-progress">
      <span style={{ width: `${progress}%` }} />
    </div>
  );
}
