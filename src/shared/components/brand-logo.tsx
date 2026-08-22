import { cn } from "@/lib/utils";

interface BrandLogoProps {
  className?: string;
  /** Pixel size of the square mark. */
  size?: number;
}

/**
 * The Equiprime "EP" monogram mark — navy tile with a muted-gold "P", echoing the
 * company logo. Used in the sidebar and on the auth screen.
 */
export function BrandLogo({ className, size = 36 }: BrandLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      role="img"
      aria-label="Equiprime"
    >
      <rect width="64" height="64" rx="14" fill="#15273f" />
      <path d="M18 16h12v6h-6v5h5.5v6H24v5h6v6H18V16Z" fill="#B7A56A" />
      <path
        d="M34 16h7.5c5.2 0 8.5 3 8.5 7.6 0 4.7-3.4 7.7-8.7 7.7H40V44h-6V16Zm6 6v3.6h1.4c1.6 0 2.6-.7 2.6-1.8 0-1.1-1-1.8-2.6-1.8H40Z"
        fill="#B7A56A"
      />
    </svg>
  );
}
