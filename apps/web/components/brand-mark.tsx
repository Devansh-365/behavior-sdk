import type { SVGAttributes } from "react";

import { cn } from "@/lib/utils";

type BrandMarkProps = SVGAttributes<SVGSVGElement> & {
  /** Sets SVG document title for screen readers when the mark is the sole label. */
  title?: string;
};

/**
 * Abstract mark: layered hexagon (system boundary + inner sampling grid) and center
 * focal point. Uses currentColor for theme alignment.
 */
export function BrandMark({
  className,
  title,
  "aria-hidden": ariaHidden,
  "aria-label": ariaLabel,
  ...props
}: BrandMarkProps) {
  const decorative = ariaHidden === true || (!title && !ariaLabel);

  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("size-8 shrink-0", className)}
      role={decorative ? "presentation" : "img"}
      aria-hidden={decorative ? true : undefined}
      aria-label={decorative ? undefined : (ariaLabel ?? title)}
      {...props}
    >
      {title && !decorative ? <title>{title}</title> : null}
      <path
        d="M 16 5 L 25.53 10.5 L 25.53 21.5 L 16 27 L 6.47 21.5 L 6.47 10.5 Z"
        className="stroke-current"
        strokeWidth="1.65"
        strokeLinejoin="round"
      />
      <g transform="rotate(30 16 16)">
        <path
          d="M 16 9.5 L 21.63 12.75 L 21.63 19.25 L 16 22.5 L 10.37 19.25 L 10.37 12.75 Z"
          className="stroke-current"
          strokeWidth="1.65"
          strokeLinejoin="round"
          opacity={0.42}
        />
      </g>
      <circle cx="16" cy="16" r="2.35" className="fill-current" />
    </svg>
  );
}
