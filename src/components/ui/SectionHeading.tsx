import type { ReactNode } from "react";
import { Fragment } from "react";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow?: string;
  title?: string | string[];
  titleLines?: string[];
  intro?: string;
  /** Dark sections use the light gold eyebrow. */
  tone?: "light" | "dark";
  align?: "start" | "center";
  id?: string;
  className?: string;
  children?: ReactNode;
  reveal?: boolean;
  delay?: number | string;
  titleAs?: "h2" | "h3";
}

/**
 * Prototype `.section-heading` — no Tailwind size/color overrides.
 * Title lines use Fragment + `<br>` (same as prototype HTML).
 */
export function SectionHeading({
  eyebrow,
  title,
  titleLines,
  intro,
  tone = "light",
  align = "start",
  id,
  className,
  children,
  reveal = false,
  delay,
  titleAs: TitleTag = "h2",
}: SectionHeadingProps) {
  const lines =
    titleLines ?? (Array.isArray(title) ? title : title ? [title] : []);

  return (
    <div
      className={cn(
        "section-heading",
        align === "center" && "centered",
        reveal && "reveal",
        className,
      )}
      data-delay={
        delay === undefined || delay === "" ? undefined : String(delay)
      }
    >
      {eyebrow ? (
        <p className={cn("eyebrow", tone === "dark" && "eyebrow-light")}>
          {eyebrow}
        </p>
      ) : null}
      {lines.length ? (
        <TitleTag id={id}>
          {lines.map((line, i) => (
            <Fragment key={`${i}-${line}`}>
              {i > 0 ? <br /> : null}
              {line}
            </Fragment>
          ))}
        </TitleTag>
      ) : null}
      {intro ? <p className="lead">{intro}</p> : null}
      {children}
    </div>
  );
}
