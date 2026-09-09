import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from "react";
import { LocaleLink } from "@/components/ui/LocaleLink";
import { cn, isAppPathHref, isExternalOrHashHref } from "@/lib/utils";

type Variant = "primary" | "gold" | "ghost" | "dark" | "outline" | "outline-dark";
type Size = "md" | "sm";

interface CommonProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
}

type ButtonAsButton = CommonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };

type ButtonAsAnchor = CommonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & { href: string };

export type ButtonProps = ButtonAsButton | ButtonAsAnchor;

/**
 * Prototype `.button` + `.button-*` modifiers.
 * Internal paths use LocaleLink; hash/external URLs use a plain `<a>`.
 */
export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  const classes = cn(
    "button",
    `button-${variant}`,
    size === "sm" && "button-small",
    className,
  );

  if ("href" in props && props.href != null) {
    const { href, ...rest } = props as ButtonAsAnchor;

    if (isExternalOrHashHref(href) || !isAppPathHref(href)) {
      return (
        <a href={href} className={classes} {...rest}>
          {children}
        </a>
      );
    }

    return (
      <LocaleLink
        href={href as React.ComponentProps<typeof LocaleLink>["href"]}
        className={classes}
        {...rest}
      >
        {children}
      </LocaleLink>
    );
  }

  const { type = "button", ...rest } =
    props as ButtonHTMLAttributes<HTMLButtonElement>;

  return (
    <button type={type} className={classes} {...rest}>
      {children}
    </button>
  );
}
