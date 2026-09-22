"use client";

import { useEffect } from "react";
import { captureAttribution, persistAttribution } from "@/lib/attribution";
import { subscribeConsent } from "@/lib/consent";

/**
 * Captures first-touch attribution (UTM / click id / referrer / landing page).
 *
 * Reads the landing URL into memory immediately — it must, because visitors
 * usually accept the cookie banner on the page they arrived at and the query
 * parameters are gone once they navigate. Nothing is written to storage until
 * consent is accepted, and it re-runs on consent change so accepting on the
 * landing page still records that visit's campaign.
 */
export function AttributionTracker() {
  useEffect(() => {
    captureAttribution();
    persistAttribution();
    return subscribeConsent(() => persistAttribution());
  }, []);

  return null;
}
