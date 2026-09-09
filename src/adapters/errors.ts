import type { AdapterResult } from "@/domain/lead";

export class NotConfiguredError extends Error {
  readonly code = "not_configured" as const;

  constructor(integration: string) {
    super(`${integration} is not configured yet.`);
    this.name = "NotConfiguredError";
  }
}

export function notConfiguredResult(integration: string): AdapterResult {
  return {
    ok: false,
    code: "not_configured",
    message: `${integration} is not configured yet.`,
  };
}
