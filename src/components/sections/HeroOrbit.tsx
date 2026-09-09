"use client";

import type { CSSProperties } from "react";
import type { Entity } from "@/content/types";
import { AppImage } from "@/components/ui/AppImage";
import { LocaleLink } from "@/components/ui/LocaleLink";
import {
  companyPath,
  type CompanyEntityId,
} from "@/lib/companies";
import { cn } from "@/lib/utils";

/**
 * Hub-and-spoke constellation: SAH Group at the center (parent),
 * entity companies on a ring with radial connectors (children).
 */
const ORBIT_LOGOS = [
  { id: "human", logoScale: 0.82 },
  { id: "seera", logoScale: 1 },
  { id: "nexus", logoScale: 1.05 },
  { id: "connect", logoScale: 1.05 },
  { id: "lego", logoScale: 0.92 },
  // Square full-bleed mark — scale stays ≤1 so it never leaves the face
  { id: "impact", logoScale: 0.86 },
] as const;

const ORBIT_WHITE_LOGOS: Record<(typeof ORBIT_LOGOS)[number]["id"], string> = {
  human: "/logos/sah-human-logo-white.png",
  seera: "/logos/sah-seera-logo-white.png",
  nexus: "/logos/sah-nexus-logo-white.png",
  connect: "/logos/sah-sponsor-logo-white.png",
  lego: "/logos/lego-by-sah-logo-white.png",
  impact: "/logos/sah-impact-logo-white.png",
};

/** Even radial distribution starting at 12 o'clock (−90°). */
const ORBIT_CONFIG = ORBIT_LOGOS.map((logo, index) => ({
  ...logo,
  angle: -90 + (index * 360) / ORBIT_LOGOS.length,
  index,
}));

/** Small accent particles around the outer ring (angles in deg). */
const ORBIT_PARTICLES = [15, 75, 135, 195, 255, 315] as const;

const VB = 100;
const CX = 50;
const CY = 50;
/** Must match CSS `--orbit-r` (42cqmin ≈ 42% of square). */
const RING_OUTER = 42;
const RING_MID = 34;
const RING_INNER = 27;
/** Must match CSS hub radius (`--orbit-hub` / 2 ≈ 19). */
const HUB_R = 19;
/** Keep spoke tips short of node faces (~11cqmin radius). */
const SPOKE_END = RING_OUTER - 11;

function polarToCartesian(angleDeg: number, radius: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: CX + radius * Math.cos(rad),
    y: CY + radius * Math.sin(rad),
  };
}

type Props = {
  entities: Entity[];
  orbitAriaLabel: string;
  orbitCenterAriaLabel: string;
};

/** Interactive hero constellation — SAH Group parent with entity companies. */
export function HeroOrbit({
  entities,
  orbitAriaLabel,
  orbitCenterAriaLabel,
}: Props) {
  const byId = Object.fromEntries(entities.map((e) => [e.id, e]));

  return (
    <div
      role="group"
      aria-label={orbitAriaLabel}
      className="group-orbit reveal is-visible"
      data-delay="120"
    >
      {/* Fixed ambient layer — ripples stay hub-centered */}
      <svg
        className="orbit-ambient-svg"
        viewBox={`0 0 ${VB} ${VB}`}
        aria-hidden="true"
      >
        <circle className="orbit-ripple orbit-ripple-1" cx={CX} cy={CY} r={46} fill="none" />
        <circle className="orbit-ripple orbit-ripple-2" cx={CX} cy={CY} r={46} fill="none" />
        <circle className="orbit-ripple orbit-ripple-3" cx={CX} cy={CY} r={46} fill="none" />
        <circle
          className="orbit-hub-halo"
          cx={CX}
          cy={CY}
          r={HUB_R + 2.5}
          fill="none"
          pathLength={100}
        />
      </svg>

      {/* Rotating system: rings, spokes, and companies — hub stays fixed */}
      <div className="orbit-system">
        <svg
          className="orbit-ring-svg"
          viewBox={`0 0 ${VB} ${VB}`}
          aria-hidden="true"
        >
          <defs>
            <radialGradient id="orbit-hub-wash" cx="50%" cy="45%" r="55%">
              <stop offset="0%" stopColor="#c89a13" stopOpacity="0.28" />
              <stop offset="55%" stopColor="#c89a13" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#c89a13" stopOpacity="0" />
            </radialGradient>
            <linearGradient
              id="orbit-sweep-grad"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="#c89a13" stopOpacity="0" />
              <stop offset="40%" stopColor="#c89a13" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="1" />
            </linearGradient>
          </defs>

          <circle
            className="orbit-hub-wash"
            cx={CX}
            cy={CY}
            r={RING_INNER + 4}
            fill="url(#orbit-hub-wash)"
          />

          <circle
            className="orbit-ring-arc orbit-ring-outer"
            cx={CX}
            cy={CY}
            r={RING_OUTER}
            fill="none"
          />
          <circle
            className="orbit-ring-arc orbit-ring-mid"
            cx={CX}
            cy={CY}
            r={RING_MID}
            fill="none"
            pathLength={100}
          />
          <circle
            className="orbit-ring-arc orbit-ring-inner"
            cx={CX}
            cy={CY}
            r={RING_INNER}
            fill="none"
          />
          <circle
            className="orbit-ring-sweep"
            cx={CX}
            cy={CY}
            r={RING_OUTER}
            fill="none"
            pathLength={100}
          />
          <circle
            className="orbit-ring-sweep orbit-ring-sweep-alt"
            cx={CX}
            cy={CY}
            r={RING_INNER}
            fill="none"
            pathLength={100}
          />
          <circle
            className="orbit-hub-ring"
            cx={CX}
            cy={CY}
            r={HUB_R}
            fill="none"
          />

          {ORBIT_CONFIG.map(({ id, angle }) => {
            const tip = polarToCartesian(angle, SPOKE_END);
            const hubEdge = polarToCartesian(angle, HUB_R);
            const mid = polarToCartesian(angle, (HUB_R + SPOKE_END) / 2);
            return (
              <g key={`spoke-${id}`} className={cn("orbit-spoke-group", `orbit-spoke-group-${id}`)}>
                <line
                  className={cn("orbit-spoke", `orbit-spoke-${id}`)}
                  x1={hubEdge.x}
                  y1={hubEdge.y}
                  x2={tip.x}
                  y2={tip.y}
                  pathLength={100}
                />
                <circle
                  className="orbit-spoke-bead"
                  cx={mid.x}
                  cy={mid.y}
                  r={0.55}
                />
              </g>
            );
          })}

          {ORBIT_PARTICLES.map((angle, i) => {
            const p = polarToCartesian(angle, RING_OUTER);
            return (
              <circle
                key={`particle-${angle}`}
                className="orbit-particle"
                cx={p.x}
                cy={p.y}
                r={0.45}
                style={{ "--particle-delay": `${i * 0.4}s` } as CSSProperties}
              />
            );
          })}
        </svg>

        {ORBIT_CONFIG.map(({ id, angle, logoScale, index }) => {
          const entity = byId[id];
          if (!entity) return null;

          const slotStyle = {
            "--orbit-angle": `${angle}deg`,
            "--orbit-float-delay": `${0.2 + index * 0.14}s`,
            "--orbit-pulse-delay": `${index * 0.55}s`,
          } as CSSProperties;

          const nodeStyle = {
            "--logo-scale": logoScale,
          } as CSSProperties;

          return (
            <div
              key={id}
              className={cn("orbit-slot", `orbit-slot-${id}`)}
              style={slotStyle}
            >
              {/* Counter-spin keeps logos upright while the system rotates */}
              <div className="orbit-node-counter">
                <LocaleLink
                  href={companyPath(id as CompanyEntityId) as `/${string}`}
                  aria-label={entity.name}
                  className={cn("orbit-node", `orbit-${id}`)}
                  style={nodeStyle}
                  data-entity={id}
                >
                  <span className="orbit-node-aura" aria-hidden="true" />
                  <span className="orbit-node-face">
                    <span className="orbit-node-logo-wrap">
                      {/*
                        fill + CSS transform scale — display size is CSS-only.
                        unoptimized: Vercel Sharp/WebP must not change intrinsic
                        aspect vs localhost (was causing padding/overflow diffs).
                      */}
                      <AppImage
                        src={ORBIT_WHITE_LOGOS[id]}
                        alt=""
                        fill
                        sizes="96px"
                        unoptimized
                        className="orbit-node-logo"
                      />
                    </span>
                  </span>
                </LocaleLink>
              </div>
            </div>
          );
        })}
      </div>

      {/* Reverse-spinning accent ring (decorative only) */}
      <div className="orbit-system-reverse" aria-hidden="true">
        <svg className="orbit-ring-svg" viewBox={`0 0 ${VB} ${VB}`}>
          <circle
            className="orbit-ring-arc orbit-ring-counter"
            cx={CX}
            cy={CY}
            r={RING_MID}
            fill="none"
            pathLength={100}
          />
        </svg>
      </div>

      <button
        type="button"
        aria-label={orbitCenterAriaLabel}
        className="orbit-center"
        data-scroll-target="#entities"
        onClick={() =>
          document
            .getElementById("entities")
            ?.scrollIntoView({ behavior: "smooth" })
        }
      >
        <span className="orbit-center-core">
          <span className="orbit-center-spin-ring" aria-hidden="true" />
          <AppImage
            src="/logos/sah-group-logo-white.png"
            alt=""
            width={377}
            height={139}
            sizes="(max-width: 760px) 160px, 220px"
            priority
          />
        </span>
      </button>
    </div>
  );
}
