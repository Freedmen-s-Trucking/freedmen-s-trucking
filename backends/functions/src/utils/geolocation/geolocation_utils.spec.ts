import {describe, it, expect} from "vitest";
import {Coordinate} from "@freedmen-s-trucking/types";
import {getDistanceInMeterBetween, getRoundedDistanceInKilometerBetween} from "./geolocation_utils";

const marcheCitePalmier: Coordinate = {latitude: 4.05244, longitude: 9.76413};
const carefourNdokoti: Coordinate = {latitude: 4.0437742, longitude: 9.7431494};

describe("./util.ts:getDistanceInMeterBetween", () => {
  it("Should be defined", () => {
    expect(getDistanceInMeterBetween).toBeDefined();
  });

  it("Should return a number close to `2518.7294`", () => {
    expect(getDistanceInMeterBetween(marcheCitePalmier, carefourNdokoti)).toBeCloseTo(2518.7294);
  });
});

describe("./util.ts:getRoundedDistanceInKilometerBetween", () => {
  it("Should be defined", () => {
    expect(getRoundedDistanceInKilometerBetween).toBeDefined();
  });

  it("Should return a number `2.5`", () => {
    expect(getRoundedDistanceInKilometerBetween(marcheCitePalmier, carefourNdokoti)).toEqual(2.5);
  });

  it("Should return a number `10`", () => {
    expect(
      getRoundedDistanceInKilometerBetween(marcheCitePalmier, {
        latitude: 4.14244,
        longitude: 9.76413,
      }),
    ).toEqual(10);
  });
});
