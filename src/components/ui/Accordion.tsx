"use client";

import { useId, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export type AccordionItemData = {
  id: string;
  question: string;
  answer: ReactNode;
};

type AccordionProps = {
  items: AccordionItemData[];
  className?: string;
  /** Open the first item by default (FAQ pattern). */
  defaultOpenFirst?: boolean;
  delay?: number | string;
};

/**
 * Canonical accordion — live FAQ chrome (`.faq-list` / `.faq-item`).
 * Replaces the unused details/summary prototype.
 */
export function Accordion({
  items,
  className,
  defaultOpenFirst = true,
  delay,
}: AccordionProps) {
  const baseId = useId();
  const [openId, setOpenId] = useState<string | null>(
    defaultOpenFirst ? (items[0]?.id ?? null) : null,
  );

  return (
    <div
      className={cn("faq-list", className)}
      data-delay={
        delay === undefined || delay === "" ? undefined : String(delay)
      }
    >
      {items.map((item, index) => {
        const isOpen = openId === item.id;
        const panelId = `${baseId}-panel-${item.id}`;
        const buttonId = `${baseId}-btn-${item.id}`;

        return (
          <div
            key={item.id}
            className={cn("faq-item", isOpen && "is-open")}
          >
            <button
              type="button"
              id={buttonId}
              className="faq-question"
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => setOpenId(isOpen ? null : item.id)}
            >
              <span className="faq-n" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="faq-q-text">{item.question}</span>
              <span className="faq-toggle" aria-hidden="true" />
            </button>

            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              className="faq-panel"
              aria-hidden={!isOpen}
              {...(!isOpen ? { inert: true } : {})}
            >
              <div className="faq-panel-inner">
                <div className="faq-answer">
                  {typeof item.answer === "string" ? (
                    <p>{item.answer}</p>
                  ) : (
                    item.answer
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** @deprecated Use `Accordion` — alias kept for FAQ section imports. */
export function FaqAccordion({
  items,
  className,
}: {
  items: AccordionItemData[];
  className?: string;
}) {
  return (
    <Accordion items={items} className={cn("reveal", className)} delay={80} />
  );
}
