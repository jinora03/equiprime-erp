/**
 * Centralized elapsed-time + duration formatting.
 *
 * Single source of truth so the workflow timeline, dashboard service metrics,
 * and bottleneck widgets always measure and render a span the same way. Do not
 * reimplement difference/formatting logic elsewhere — import from here.
 */

export const MS_PER_MINUTE = 60_000;
export const MS_PER_HOUR = 60 * MS_PER_MINUTE;
export const MS_PER_DAY = 24 * MS_PER_HOUR;

type TimeInput = string | number | Date;

/** Milliseconds between two instants (defaults `to` to now). Never negative. */
export function elapsedMs(from: TimeInput, to: TimeInput = Date.now()): number {
  const start = new Date(from).getTime();
  const end = new Date(to).getTime();
  if (Number.isNaN(start) || Number.isNaN(end)) return 0;
  return Math.max(0, end - start);
}

/** Whole hours in the span between two instants. */
export function elapsedHours(from: TimeInput, to?: TimeInput): number {
  return Math.floor(elapsedMs(from, to) / MS_PER_HOUR);
}

interface FormatDurationOptions {
  /** Max coarse-to-fine units to show, e.g. 2 -> "1d 4h". Default 2. */
  maxParts?: number;
  /** Label when the span is under a minute. Default "just now". */
  zeroLabel?: string;
}

/**
 * Human, deterministic duration: "1d 4h", "2h 15m", "6m". The same input
 * always produces the same string.
 */
export function formatDuration(
  ms: number,
  options: FormatDurationOptions = {},
): string {
  const { maxParts = 2, zeroLabel = "just now" } = options;
  if (!Number.isFinite(ms) || ms < MS_PER_MINUTE) return zeroLabel;

  const days = Math.floor(ms / MS_PER_DAY);
  const hours = Math.floor((ms % MS_PER_DAY) / MS_PER_HOUR);
  const minutes = Math.floor((ms % MS_PER_HOUR) / MS_PER_MINUTE);

  const parts: string[] = [];
  if (days) parts.push(`${days}d`);
  if (hours) parts.push(`${hours}h`);
  if (minutes) parts.push(`${minutes}m`);

  return parts.slice(0, maxParts).join(" ") || zeroLabel;
}

/** Convenience: format the span between two instants directly. */
export function formatElapsed(
  from: TimeInput,
  to?: TimeInput,
  options?: FormatDurationOptions,
): string {
  return formatDuration(elapsedMs(from, to), options);
}
