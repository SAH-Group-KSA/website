import type { MetadataRoute } from "next";
import { GROUP_THEME_COLOR } from "@/lib/brand-themes";
import { siteConfig } from "@/lib/constants";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: "SAH",
    description:
      "SAH Group — integrated Saudi ecosystem from people to impact.",
    start_url: "/",
    display: "browser",
    background_color: "#f8f6f4",
    theme_color: GROUP_THEME_COLOR,
    lang: "ar",
    dir: "rtl",
    icons: [
      {
        src: "/icons/favicon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
