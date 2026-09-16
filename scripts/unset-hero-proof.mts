/**
 * Remove hero proof highlight fields from homePage + companyPage documents.
 * Only unsets `hero.proof` and `hero.proofAriaLabel` — all other content is left intact.
 *
 * Safety:
 *   - Refuses to run unless NEXT_PUBLIC_SANITY_DATASET is exactly "staging"
 *   - Supports --dry-run
 *
 * Usage:
 *   npx tsx scripts/unset-hero-proof.mts --dry-run
 *   npx tsx scripts/unset-hero-proof.mts
 */

import { createSeedClient } from "./lib/sanity-seed";

type TargetDoc = {
  _id: string;
  _type: string;
  hasProof: boolean;
  hasProofAriaLabel: boolean;
};

function parseArgs(): { dryRun: boolean } {
  return { dryRun: process.argv.includes("--dry-run") };
}

async function main(): Promise<void> {
  const { dryRun } = parseArgs();
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET?.trim();

  if (dataset !== "staging") {
    throw new Error(
      `Refusing to run: NEXT_PUBLIC_SANITY_DATASET must be "staging" (got "${dataset ?? ""}").`,
    );
  }

  const client = createSeedClient();

  const docs = await client.fetch<TargetDoc[]>(
    `*[_type in ["homePage", "companyPage"] && (
      defined(hero.proof) || defined(hero.proofAriaLabel)
    )]{
      _id,
      _type,
      "hasProof": defined(hero.proof),
      "hasProofAriaLabel": defined(hero.proofAriaLabel)
    }`,
  );

  console.log("");
  console.log(`Dataset: ${dataset}`);
  console.log(`Mode:    ${dryRun ? "dry-run (no writes)" : "write"}`);
  console.log(`Matched: ${docs.length} document(s) with hero proof fields`);
  console.log("");

  if (docs.length === 0) {
    console.log("Nothing to unset.");
    return;
  }

  for (const doc of docs) {
    const paths = [
      ...(doc.hasProof ? ["hero.proof"] : []),
      ...(doc.hasProofAriaLabel ? ["hero.proofAriaLabel"] : []),
    ];
    console.log(`  ${doc._type} ${doc._id} → unset ${paths.join(", ")}`);

    if (!dryRun) {
      await client.patch(doc._id).unset(paths).commit({ autoGenerateArrayKeys: false });
    }
  }

  console.log("");
  console.log(
    dryRun
      ? "Dry run complete. Re-run without --dry-run to apply."
      : "Done. Only hero.proof / hero.proofAriaLabel were removed.",
  );
}

main().catch((err) => {
  console.error("");
  console.error("Unset failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});
