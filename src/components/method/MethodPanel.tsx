import type { MethodStep } from "@/content/types";

export function MethodPanel({
  step,
}: {
  step: MethodStep;
  outputsLabel?: string;
}) {
  return (
    <div className="method-panel" data-active-method={step.id}>
      <span className="method-number">{step.number}</span>
      <h3>{step.title}</h3>
      <p>{step.text}</p>
      <div className="method-output">
        {step.outputs.map((item) => (
          <span key={item}>{item}</span>
        ))}
      </div>
      <div className="method-decision">{step.decision}</div>
    </div>
  );
}
