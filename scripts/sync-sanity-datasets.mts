/**
 * Copy one Sanity dataset onto another (exact replace).
 *
 * Usage:
 *   npx sanity login   # project Administrator (once)
 *   npm run sync:sanity:staging-to-production
 *   npm run sync:sanity:production-to-staging
 *
 * Or directly:
 *   tsx scripts/sync-sanity-datasets.mts --from staging --to production
 *   tsx scripts/sync-sanity-datasets.mts --from production --to staging
 *
 * Flow:
 *   1. Confirm (yes/no)
 *   2. Delete target dataset       — uses CLI login session
 *   3. Recreate target dataset     — uses CLI login session
 *   4. Export source               — uses CLI login session
 *   5. Import into target          — uses SANITY_API_WRITE_TOKEN
 *
 * Requires:
 *   - NEXT_PUBLIC_SANITY_PROJECT_ID
 *   - SANITY_API_WRITE_TOKEN (Editor is enough for import)
 *   - `sanity login` as a project Administrator (dataset delete/create)
 *
 * Loads `.env.local` automatically (see scripts/lib/load-env.ts).
 */

import "./lib/load-env";

import { spawn } from "node:child_process";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

const ALLOWED_DATASETS = new Set(["staging", "production"]);

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

function parseDirection(): { from: string; to: string } {
  const args = process.argv.slice(2);
  let from: string | undefined;
  let to: string | undefined;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--from") {
      from = args[++i];
      continue;
    }
    if (arg === "--to") {
      to = args[++i];
      continue;
    }
    if (arg.startsWith("--from=")) {
      from = arg.slice("--from=".length);
      continue;
    }
    if (arg.startsWith("--to=")) {
      to = arg.slice("--to=".length);
      continue;
    }
  }

  if (!from || !to) {
    throw new Error(
      'Usage: sync-sanity-datasets.mts --from <staging|production> --to <staging|production>',
    );
  }

  if (!ALLOWED_DATASETS.has(from) || !ALLOWED_DATASETS.has(to)) {
    throw new Error(
      `Only "staging" and "production" are allowed (got --from ${from} --to ${to}).`,
    );
  }

  if (from === to) {
    throw new Error("--from and --to must be different datasets.");
  }

  return { from, to };
}

/** Env for project-level CLI ops — prefer `sanity login`, never force API token. */
function sessionEnv(): NodeJS.ProcessEnv {
  const env = { ...process.env };
  delete env.SANITY_AUTH_TOKEN;
  delete env.SANITY_API_TOKEN;
  delete env.SANITY_IMPORT_TOKEN;
  return env;
}

/** Env for import — Editor write token is enough. */
function importEnv(token: string): NodeJS.ProcessEnv {
  return {
    ...sessionEnv(),
    SANITY_IMPORT_TOKEN: token,
  };
}

function runSanity(
  args: string[],
  env: NodeJS.ProcessEnv,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn("npx", ["sanity", ...args], {
      env,
      stdio: "inherit",
      shell: process.platform === "win32",
    });

    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(
        new Error(
          `sanity ${args.join(" ")} exited with code ${code ?? "unknown"}`,
        ),
      );
    });
  });
}

function runSanityCapture(
  args: string[],
  env: NodeJS.ProcessEnv,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn("npx", ["sanity", ...args], {
      env,
      stdio: ["ignore", "pipe", "pipe"],
      shell: process.platform === "win32",
    });

    let stdout = "";
    let stderr = "";
    child.stdout?.on("data", (chunk: Buffer) => {
      stdout += chunk.toString();
    });
    child.stderr?.on("data", (chunk: Buffer) => {
      stderr += chunk.toString();
    });

    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve(stdout);
        return;
      }
      reject(
        new Error(
          `sanity ${args.join(" ")} exited with code ${code ?? "unknown"}` +
            (stderr.trim() ? `\n${stderr.trim()}` : ""),
        ),
      );
    });
  });
}

async function datasetExists(
  projectId: string,
  name: string,
  env: NodeJS.ProcessEnv,
): Promise<boolean> {
  const outputText = await runSanityCapture(
    ["datasets", "list", "--project-id", projectId],
    env,
  );
  return outputText
    .split("\n")
    .some((line) => line.trim().split(/\s+/)[0] === name);
}

async function confirm(message: string): Promise<boolean> {
  const rl = createInterface({ input, output });
  try {
    const answer = (await rl.question(message)).trim().toLowerCase();
    return answer === "y" || answer === "yes";
  } finally {
    rl.close();
  }
}

async function main(): Promise<void> {
  const { from: sourceDataset, to: targetDataset } = parseDirection();
  const projectId = requireEnv("NEXT_PUBLIC_SANITY_PROJECT_ID");
  const token = requireEnv("SANITY_API_WRITE_TOKEN");
  const cliSession = sessionEnv();
  const arrow = `${sourceDataset} → ${targetDataset}`;

  console.log("");
  console.log("╔══════════════════════════════════════════════════════════════╗");
  console.log(`║  Sanity sync: ${arrow.padEnd(44)} (DESTRUCTIVE) ║`);
  console.log("╚══════════════════════════════════════════════════════════════╝");
  console.log("");
  console.log(`This will DESTROY all content in the "${targetDataset}" dataset and`);
  console.log(`replace it with an exact copy of "${sourceDataset}".`);
  console.log("");
  console.log(`  Project:  ${projectId}`);
  console.log(`  Source:   ${sourceDataset}`);
  console.log(`  Target:   ${targetDataset}`);
  console.log("");
  console.log("Auth:");
  console.log("  • Delete / create / export → `sanity login` (Administrator)");
  console.log("  • Import                   → SANITY_API_WRITE_TOKEN (Editor OK)");
  console.log("");
  console.log("Steps that will run after you confirm:");
  console.log(`  1. Clear (delete) the "${targetDataset}" dataset`);
  console.log(`  2. Recreate the "${targetDataset}" dataset (public)`);
  console.log(`  3. Export the "${sourceDataset}" dataset to a temporary archive`);
  console.log(`  4. Import that archive into "${targetDataset}"`);
  console.log("");
  console.log(
    `Result: ${targetDataset} becomes an exact copy of ${sourceDataset}.`,
  );
  console.log("");

  const ok = await confirm('Type "yes" to proceed, or "no" to cancel: ');
  if (!ok) {
    console.log("Cancelled. No changes were made.");
    process.exit(0);
  }

  console.log("");
  console.log("Confirmed. Starting sync…");
  console.log("");

  const exportDir = await mkdtemp(path.join(tmpdir(), "sah-sanity-sync-"));
  const exportFile = path.join(exportDir, `${sourceDataset}.tar.gz`);

  try {
    console.log(`→ Step 1/4: Deleting "${targetDataset}" dataset…`);
    const targetExists = await datasetExists(
      projectId,
      targetDataset,
      cliSession,
    );
    if (targetExists) {
      await runSanity(
        [
          "datasets",
          "delete",
          targetDataset,
          "--project-id",
          projectId,
          "--force",
        ],
        cliSession,
      );
    } else {
      console.log(`  "${targetDataset}" does not exist — skip delete.`);
    }

    console.log("");
    console.log(`→ Step 2/4: Creating "${targetDataset}" dataset…`);
    await runSanity(
      [
        "datasets",
        "create",
        targetDataset,
        "--project-id",
        projectId,
        "--visibility",
        "public",
      ],
      cliSession,
    );

    console.log("");
    console.log(`→ Step 3/4: Exporting "${sourceDataset}" → ${exportFile}`);
    await runSanity(
      [
        "datasets",
        "export",
        sourceDataset,
        exportFile,
        "--project-id",
        projectId,
        "--overwrite",
      ],
      cliSession,
    );

    console.log("");
    console.log(`→ Step 4/4: Importing into "${targetDataset}"…`);
    await runSanity(
      [
        "datasets",
        "import",
        exportFile,
        "--project-id",
        projectId,
        "--dataset",
        targetDataset,
        "--token",
        token,
        "--replace",
      ],
      importEnv(token),
    );

    console.log("");
    console.log("✓ Sync complete.");
    console.log(
      `  "${targetDataset}" is now an exact copy of "${sourceDataset}" (${projectId}).`,
    );
  } finally {
    await rm(exportDir, { recursive: true, force: true });
  }
}

main().catch((err) => {
  console.error("");
  console.error("Sync failed:", err instanceof Error ? err.message : err);
  console.error("");
  console.error(
    "If delete/create failed with Unauthorized, run: npx sanity login",
  );
  console.error("(use a project Administrator account), then retry.");
  process.exit(1);
});
