type Props = {
  labels: string[];
  currentIndex: 0 | 1 | 2;
  ariaLabel: string;
  /** Called when the user clicks a completed step to navigate back to it. */
  onNavigate?: (index: 0 | 1 | 2) => void;
  /** `discovery` = connector stepper for the /discovery page. */
  variant?: "default" | "discovery";
};

export function JourneyStage({
  labels,
  currentIndex,
  ariaLabel,
  onNavigate,
  variant = "default",
}: Props) {
  if (variant === "discovery") {
    return (
      <ol aria-label={ariaLabel} className="discovery-steps">
        {labels.map((label, index) => {
          const active = index === currentIndex;
          const done = index < currentIndex;
          const canClick = done && Boolean(onNavigate);
          const cls = `discovery-step${active ? " is-active" : ""}${done ? " is-complete" : ""}`;

          const inner = (
            <>
              <span className="discovery-step-index" aria-hidden="true">
                {done ? (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path
                      d="M2.5 7.5l3 3 6-6.5"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  index + 1
                )}
              </span>
              <span className="discovery-step-label">{label}</span>
            </>
          );

          return (
            <li key={label} className={cls} data-step={index + 1}>
              {canClick ? (
                <button
                  type="button"
                  className="discovery-step-btn"
                  aria-label={`Go back to step ${index + 1}: ${label}`}
                  onClick={() => onNavigate!(index as 0 | 1 | 2)}
                >
                  {inner}
                </button>
              ) : (
                <div
                  className="discovery-step-btn"
                  aria-current={active ? "step" : undefined}
                >
                  {inner}
                </div>
              )}
            </li>
          );
        })}
      </ol>
    );
  }

  return (
    <nav aria-label={ariaLabel} className="journey-steps">
      {labels.map((label, index) => {
        const active = index === currentIndex;
        const done = index < currentIndex;
        const canClick = done && Boolean(onNavigate);

        const cls = `journey-step${active ? " is-active" : ""}${done ? " is-complete" : ""}`;

        if (canClick) {
          return (
            <button
              key={label}
              type="button"
              className={cls}
              data-step={index + 1}
              aria-label={`Go back to step ${index + 1}: ${label}`}
              onClick={() => onNavigate!(index as 0 | 1 | 2)}
            >
              <span aria-hidden="true">✓</span>
              <b>{label}</b>
            </button>
          );
        }

        return (
          <div
            key={label}
            className={cls}
            data-step={index + 1}
            aria-current={active ? "step" : undefined}
          >
            <span aria-hidden="true">{index + 1}</span>
            <b>{label}</b>
          </div>
        );
      })}
    </nav>
  );
}
