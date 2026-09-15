/** Append a trailing ` *` for required fields; idempotent if already marked. */
export function requiredLabel(label: string): string {
  const trimmed = label.replace(/\s*\*\s*$/u, "").trimEnd();
  return `${trimmed} *`;
}
