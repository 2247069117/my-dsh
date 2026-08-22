export interface StuckRowBox {
  readonly key: string;
  readonly top: number;
}

const PIN = 0.5;
const RELEASE = 8;

/** Last user row that has crossed the scrollport top, with hysteresis so compact styles cannot flicker. */
export function pickPinnedRow(
  rows: readonly StuckRowBox[],
  scrollerTop: number,
  currentKey?: string,
): string | undefined {
  let lastPast: string | undefined;
  let lastPastIndex = -1;
  for (const [index, row] of rows.entries()) {
    if (row.top <= scrollerTop + PIN) {
      lastPast = row.key;
      lastPastIndex = index;
    }
  }

  if (currentKey !== undefined) {
    const currentIndex = rows.findIndex((row) => row.key === currentKey);
    const current = currentIndex === -1 ? undefined : rows[currentIndex];
    if (lastPastIndex > currentIndex) return lastPast;
    if (current !== undefined && current.top <= scrollerTop + RELEASE) return currentKey;
  }

  return lastPast;
}
