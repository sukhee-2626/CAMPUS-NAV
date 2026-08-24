import { describe, expect, it } from "vitest";
import { referencePointFromClick } from "./mapCoordinates";

describe("referencePointFromClick", () => {
  it("maps the top-left and bottom-right of the reference surface into the campus bounds", () => {
    expect(referencePointFromClick(0, 0)).toEqual({ lat: 10.9406, lng: 76.9508 });
    expect(referencePointFromClick(1, 1)).toEqual({ lat: 10.9358, lng: 76.961 });
  });

  it("clamps clicks outside the surface before mapping them", () => {
    expect(referencePointFromClick(-1, 2)).toEqual({ lat: 10.9358, lng: 76.9508 });
  });
});
