/**
 * Largest integer scale factor at which a virtual screen fits inside the available space.
 * Integer scaling keeps every pixel the same size (no shimmering / uneven pixels).
 */
export function integerScale(
  availableWidth: number,
  availableHeight: number,
  virtualWidth: number,
  virtualHeight: number,
): number {
  const scale = Math.floor(Math.min(availableWidth / virtualWidth, availableHeight / virtualHeight));
  return Math.max(1, scale);
}
