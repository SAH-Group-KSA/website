"use client";

import { useEffect, useRef, useState } from "react";
import type { SiteContent } from "@/content/types";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { duration } from "@/motion/transitions";

type Metric = SiteContent["impact"]["metrics"][number];

function MetricCard({ metric }: { metric: Metric }) {
  const ref = useRef<HTMLElement>(null);
  const [value, setValue] = useState(0);
  const reduced = usePrefersReducedMotion();
  const display = reduced ? metric.value : value;

  useEffect(() => {
    if (reduced) return;

    const node = ref.current;
    if (!node) return;

    let frame = 0;
    const run = () => {
      const start = performance.now();
      const animDuration = duration.counter * 1000;
      const tick = (now: number) => {
        const progress = Math.min((now - start) / animDuration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setValue(Math.floor(metric.value * eased));
        if (progress < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    };

    if (!("IntersectionObserver" in window)) {
      run();
      return;
    }

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        obs.disconnect();
        run();
      },
      { threshold: 0.55 },
    );
    obs.observe(node);
    return () => {
      obs.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [metric.value, reduced]);

  return (
    <article ref={ref} className="metric-card">
      <strong
        className="counter"
        data-suffix={metric.suffix}
        data-target={metric.value}
      >
        {display.toLocaleString("en-US")}
        {metric.suffix}
      </strong>
      <span>{metric.label}</span>
    </article>
  );
}

type Props = {
  metricsEyebrow: string;
  note: string;
  metrics: Metric[];
};

/** Animated counters — client island only. */
export function ImpactMetrics({ metricsEyebrow, note, metrics }: Props) {
  return (
    <div className="metrics-panel reveal" data-delay="120">
      <p className="metrics-label">{metricsEyebrow}</p>
      <div className="metrics-grid">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} metric={metric} />
        ))}
      </div>
      <p className="data-note">{note}</p>
    </div>
  );
}
