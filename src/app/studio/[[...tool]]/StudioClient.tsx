"use client";

import { NextStudio } from "next-sanity/studio";
import config from "@/sanity/sanity.config";

/**
 * Client-only Studio shell.
 * Sanity plugins (e.g. muxInput → swr) must not load in the RSC graph.
 */
export default function StudioClient() {
  return <NextStudio config={config} />;
}
