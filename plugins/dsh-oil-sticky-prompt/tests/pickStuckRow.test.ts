import { describe, expect, it } from "vitest";

import { pickPinnedRow } from "../src/client/pickStuckRow.ts";

describe("pickPinnedRow", () => {
  it("returns undefined when no row has reached the top", () => {
    expect(pickPinnedRow([
      { key: "a", top: 80 },
      { key: "b", top: 200 },
    ], 40)).toBeUndefined();
  });

  it("picks the last row that has crossed the top", () => {
    expect(pickPinnedRow([
      { key: "a", top: 20 },
      { key: "b", top: 180 },
    ], 40)).toBe("a");
  });

  it("lets a later row take over as it crosses the top", () => {
    expect(pickPinnedRow([
      { key: "a", top: -20 },
      { key: "b", top: 40 },
    ], 40)).toBe("b");
  });

  it("keeps the current row inside a small release band", () => {
    expect(pickPinnedRow([
      { key: "a", top: 46 },
      { key: "b", top: 180 },
    ], 40, "a")).toBe("a");
  });

  it("releases the current row once it is clearly below the top", () => {
    expect(pickPinnedRow([
      { key: "a", top: 56 },
      { key: "b", top: 180 },
    ], 40, "a")).toBeUndefined();
  });
});
