/**
 * Integration adapters — UI imports these contracts only.
 * Implementations stay no-op until credentials exist.
 * Secrets belong in Route Handlers under `src/app/api/**`, not here on the client.
 */

export { NotConfiguredError, notConfiguredResult } from "@/adapters/errors";
