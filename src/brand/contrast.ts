/**
 * WCAG 2.x relative-luminance contrast, computed at build time.
 *
 * Here so the minerals page can print a *measured* ratio next to each swatch
 * rather than a claim. Mzizi's own checker (`mzizi_check_accessibility` over
 * its MCP, and the same check in the toolkit at mzizi.dev) reports APCA as
 * well; this is the WCAG 2.2 figure, which is what an audit will ask for.
 */

/** `#RGB` or `#RRGGBB` to channel bytes. */
function channels(hex: string): readonly [number, number, number] {
  const value = hex.replace('#', '');
  const full =
    value.length === 3
      ? value
          .split('')
          .map((c) => c + c)
          .join('')
      : value;
  const int = Number.parseInt(full, 16);
  return [(int >> 16) & 255, (int >> 8) & 255, int & 255];
}

function luminance(hex: string): number {
  const [r, g, b] = channels(hex).map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Contrast ratio between two opaque colours, 1–21. */
export function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}

/**
 * How a ratio reads against WCAG 2.2.
 *
 * `large` covers 24px, or 18.66px at 700 — the SC 1.4.3 threshold. The 3:1
 * floor is also what SC 1.4.11 asks of a non-text mark like a rail segment,
 * which is how every mineral on this site is actually used.
 */
export function rating(ratio: number): 'AAA' | 'AA' | 'AA Large' | 'Non-text only' {
  if (ratio >= 7) return 'AAA';
  if (ratio >= 4.5) return 'AA';
  if (ratio >= 3) return 'AA Large';
  return 'Non-text only';
}

/** Two decimals, the way a contrast report is normally quoted. */
export function ratio(a: string, b: string): string {
  return `${contrast(a, b).toFixed(2)}:1`;
}
