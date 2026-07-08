import { format, formatDistanceToNow, isValid, parseISO } from "date-fns";

function toDate(value: string | Date | null | undefined): Date | null {
  if (!value) return null;
  const date = typeof value === "string" ? parseISO(value) : value;
  return isValid(date) ? date : null;
}

/** "Jul 1, 2026" */
export function formatDate(value: string | Date | null | undefined): string {
  const date = toDate(value);
  return date ? format(date, "MMM d, yyyy") : "—";
}

/** "Jul 1, 2026, 9:00 AM" */
export function formatDateTime(value: string | Date | null | undefined): string {
  const date = toDate(value);
  return date ? format(date, "MMM d, yyyy, h:mm a") : "—";
}

/** "3 days ago" */
export function formatRelativeTime(
  value: string | Date | null | undefined,
): string {
  const date = toDate(value);
  return date ? formatDistanceToNow(date, { addSuffix: true }) : "Never";
}

/** Philippine peso currency, e.g. "₱2,450,000.00" */
export function formatCurrency(value: number, currency = "PHP"): string {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

/** Compact notation, e.g. "1.2K", "3.4M" */
export function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatPercent(value: number, fractionDigits = 0): string {
  return `${value > 0 ? "+" : ""}${value.toFixed(fractionDigits)}%`;
}
