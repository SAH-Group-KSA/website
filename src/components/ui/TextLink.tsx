import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { LocaleLink } from "@/components/ui/LocaleLink";
import { cn, isAppPathHref, isExternalOrHashHref } from "@/lib/utils";

type Common = {
  className?: string;
  children: ReactNode;
};

type TextLinkAsAnchor = Common &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
    href: string;
    as?: "a";
  };

type TextLinkAsButton = Common &
  ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined; as: "button" };

export type TextLinkProps = TextLinkAsAnchor | TextLinkAsButton;

/** Prototype `.text-link` (inline CTA with optional arrow child). */
export function TextLink(props: TextLinkProps) {
  const { className, children, as: _as, ...rest } = props;
  const classes = cn("text-link", className);

  if (props.as === "button") {
    const buttonProps = rest as ButtonHTMLAttributes<HTMLButtonElement>;
    return (
      <button type="button" className={classes} {...buttonProps}>
        {children}
      </button>
    );
  }

  const { href, ...anchorRest } = rest as Omit<
    AnchorHTMLAttributes<HTMLAnchorElement>,
    "href"
  > & { href: string };

  if (isExternalOrHashHref(href) || !isAppPathHref(href)) {
    return (
      <a href={href} className={classes} {...anchorRest}>
        {children}
      </a>
    );
  }

  return (
    <LocaleLink
      href={href as React.ComponentProps<typeof LocaleLink>["href"]}
      className={classes}
      {...anchorRest}
    >
      {children}
    </LocaleLink>
  );
}
