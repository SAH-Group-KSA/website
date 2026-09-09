"use client";

import { useMemo, useState } from "react";
import type { Coach } from "@/domain/coach";
import type { CoachesListLabels } from "@/content/types";
import { formatCountTemplate } from "@/lib/content-labels";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ListingCard } from "@/components/ui/ListingCard";
import { useRovingTablist } from "@/hooks/useRovingTablist";

type Props = {
  labels: CoachesListLabels;
  /** Locale-resolved coaches from `getCoaches` (server). */
  coaches: Coach[];
};

/**
 * Client filter/search UI only — data comes from the catalog / CMS facade.
 */
export function CoachesListClient({ labels, coaches }: Props) {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState(0);

  const specialties = labels.specialties;
  const specialtyIds = useMemo(
    () => specialties.map((_, i) => String(i)),
    [specialties],
  );
  const { onKeyDown: onSpecialtyKeyDown } = useRovingTablist(
    specialtyIds,
    String(activeFilter),
    (id) => setActiveFilter(Number(id)),
    "horizontal",
    "radio",
  );

  const filtered = coaches.filter((c) => {
    const matchesSearch =
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.specialty.toLowerCase().includes(search.toLowerCase());
    const filterLabel = specialties[activeFilter] ?? "";
    const matchesFilter =
      activeFilter === 0 ||
      c.specialty.toLowerCase().includes(filterLabel.toLowerCase()) ||
      c.specialty.includes(filterLabel);
    return matchesSearch && matchesFilter;
  });

  return (
    <>
      <div className="coaches-toolbar">
        <label className="search-field" htmlFor="coach-search">
          <span className="visually-hidden">{labels.searchAriaLabel}</span>
          <svg
            className="search-icon"
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
          >
            <circle
              cx="6.5"
              cy="6.5"
              r="4.5"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <path
              d="M10 10l3 3"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          <input
            id="coach-search"
            type="search"
            autoComplete="off"
            placeholder={labels.searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search ? (
            <button
              type="button"
              className="search-clear"
              aria-label={labels.clearSearchAriaLabel}
              onClick={() => setSearch("")}
            >
              <svg
                width="10"
                height="10"
                viewBox="0 0 10 10"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M1.5 1.5l7 7M8.5 1.5l-7 7"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          ) : null}
        </label>
        <div
          className="filter-group"
          role="radiogroup"
          aria-label={labels.filterAriaLabel}
          onKeyDown={onSpecialtyKeyDown}
        >
          {specialties.map((spec, i) => (
            <Badge
              key={spec}
              interactive
              variant="filter"
              role="radio"
              aria-checked={activeFilter === i}
              tabIndex={activeFilter === i ? 0 : -1}
              className={activeFilter === i ? "is-active" : undefined}
              onClick={() => setActiveFilter(i)}
            >
              {spec}
            </Badge>
          ))}
        </div>
      </div>

      <p className="program-count" aria-live="polite">
        {formatCountTemplate(labels.countTemplate, filtered.length)}
      </p>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <h3>{labels.emptyTitle}</h3>
          <p>{labels.emptyBody}</p>
        </div>
      ) : (
        <div className="coaches-grid">
          {filtered.map((coach) => (
            <ListingCard
              key={coach.slug}
              kind="coach"
              media={
                coach.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element -- CSS expects .coach-photo img
                  <img src={coach.photo} alt={coach.name} />
                ) : (
                  <div className="coach-photo-placeholder" aria-hidden="true">
                    👤
                  </div>
                )
              }
              footer={
                <>
                  <div className="coach-price">
                    {coach.price.amount}{" "}
                    <small>
                      {coach.price.currency}/{labels.sessionSuffix}
                    </small>
                  </div>
                  <Button
                    href={`/coaches/${coach.slug}`}
                    variant="gold"
                    size="sm"
                  >
                    {labels.bookSession}
                  </Button>
                </>
              }
            >
              <span className="coach-specialty">{coach.specialty}</span>
              <h3 className="coach-name">{coach.name}</h3>
              <p className="coach-bio">{coach.bio}</p>
              <div className="coach-rating">
                <strong>★ {coach.rating}</strong>
                <span>
                  ({coach.reviewCount} {labels.reviewsLabel})
                </span>
              </div>
            </ListingCard>
          ))}
        </div>
      )}
    </>
  );
}
