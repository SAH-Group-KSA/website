import Image, { type ImageProps } from "next/image";

type AppImageProps = ImageProps & {
  /** Prefer leaving optimized on; set true only for rare assets that must bypass the optimizer. */
  unoptimized?: boolean;
};

/**
 * Next.js Image with production / SEO defaults:
 * - Required `alt` (meaningful text, or `""` when decorative + labelled parent)
 * - Intrinsic width/height for CLS control
 * - quality 100 for near-lossless visual parity with prototype assets
 * - Lazy by default (`loading="lazy"`); pass `priority` only for LCP images
 * - Formats/sizes controlled by `next.config` images config
 * - Display size still driven by prototype CSS
 */
export function AppImage({
  alt,
  quality = 100,
  unoptimized = false,
  ...props
}: AppImageProps) {
  return (
    <Image
      alt={alt}
      decoding="async"
      quality={quality}
      unoptimized={unoptimized}
      {...props}
    />
  );
}
