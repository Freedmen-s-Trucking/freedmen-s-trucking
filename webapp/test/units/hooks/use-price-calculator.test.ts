import { describe, expect, it } from "vitest";
import {
  // useComputeDeliveryEstimation,
  computeTheMinimumRequiredVehiclesAndFees,
} from "~/hooks/use-price-calculator";
import { OrderPriority, ProductWithQuantity } from "@freedmen-s-trucking/types";
// import { renderHook } from "@testing-library/react";

describe("computeTheMinimumRequiredVehiclesAndFees", () => {
  it("should calculate the fees correctly", () => {
    const products = [
      {
        name: "TEST SUV",
        estimatedDimensions: {
          widthInInches: 33,
          heightInInches: 33,
          lengthInInches: 33,
        },
        estimatedWeightInLbsPerUnit: 80,
        quantity: 1,
        // volumeInCuFeet: 20,
      },
    ] satisfies ProductWithQuantity[];
    const distanceInMiles = 75; // From: Bluhill Rd, Silver Spring, MD 20902, USA => To: Fredericksburg, VA 22408, USA
    const priority = OrderPriority.STANDARD;
    const result = computeTheMinimumRequiredVehiclesAndFees(
      products,
      distanceInMiles,
      priority,
    );
    expect(result).not.toBeInstanceOf(Error);
    console.log(result);
    expect((result as { fees: number }).fees).toBeCloseTo(
      186.74 + 186.74 * 0.06,
      2,
    );
  });
});

// describe("useComputeDeliveryEstimation", () => {
//   it("should calculate the fees correctly", async () => {
//     const { result } = renderHook(() => useComputeDeliveryEstimation());
//     const products = [
//       {
//         id: "1",
//         sku: "SUV",
//         title: "TEST SUV",
//         quantity: 1,
//         weightToBeUsedInLbs: [80],
//         volumeInCuFeet: 20,
//       },
//     ];
//     const distanceInMiles = 75;
//     const priority = "standard";
//     const total = await result.current.getTotal(
//       products,
//       distanceInMiles,
//       priority,
//     );
//     expect(total).toBeCloseTo(186.74 + 186.74 * 0.06, 2);
//   });
// });
