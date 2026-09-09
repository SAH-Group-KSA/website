import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

/**
 * Load `.env.local` then `.env` for standalone tsx scripts.
 * Next.js loads these automatically; seed/validate scripts do not.
 * Existing process.env values are not overwritten.
 */
export function loadLocalEnv(): void {
  for (const file of [".env.local", ".env"]) {
    const filePath = path.join(process.cwd(), file);
    if (!existsSync(filePath)) continue;

    const content = readFileSync(filePath, "utf8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;

      const eq = trimmed.indexOf("=");
      if (eq <= 0) continue;

      const key = trimmed.slice(0, eq).trim();
      if (!key || process.env[key] !== undefined) continue;

      let value = trimmed.slice(eq + 1).trim();
      const hash = value.indexOf(" #");
      if (hash > -1) value = value.slice(0, hash).trim();

      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      process.env[key] = value;
    }
  }
}

// Run once when this module is imported by seed/validate scripts.
loadLocalEnv();
