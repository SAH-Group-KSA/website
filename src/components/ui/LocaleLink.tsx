import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";

type LocaleLinkProps = React.ComponentProps<typeof Link>;

/**
 * Locale-aware App Router link (prefixes `/en` when needed; Arabic stays unprefixed).
 * Prefer this over raw `<a>` for any non-hash, non-external navigation.
 */
export function LocaleLink({ className, ...props }: LocaleLinkProps) {
  return <Link className={cn(className)} {...props} />;
}
