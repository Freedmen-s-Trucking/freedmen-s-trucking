import { ArkErrors, Type } from "arktype";
import { DriverEntity, VerificationStatus } from "@freedmen-s-trucking/types";

export function checkFalsyAndThrow(
  paramsToCheck: Record<string, unknown>,
  traceRef?: string,
  schema?: Type,
) {
  if (schema) {
    const res = schema(paramsToCheck);
    if (res instanceof ArkErrors) {
      throw new Error(`${traceRef || ""}:: ${res.summary}`);
    }
    return;
  }
  for (const [key, valueProvided] of Object.entries(paramsToCheck)) {
    if (!valueProvided || Object(valueProvided).length === 0) {
      throw new Error(
        `${traceRef || ""}:: Unexpected falsy parameters ${JSON.stringify([key, valueProvided], null, " ")}`,
      );
    }
  }
}

export function formatPrice(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export const formatDate = (date: Date, space: string = " ") => {
  return date
    .toLocaleTimeString([], {
      weekday: "short",
      year: "2-digit",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
    .replace(/, /g, `,${space}`);
};

export function fileToBase64(file: File) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      resolve(reader.result); // This is the base64 string (with data URI)
    };

    reader.onerror = (error) => {
      reject(error);
    };

    reader.readAsDataURL(file); // Important!
  });
}

export function getDriverVerificationStatus(
  driver: DriverEntity,
): VerificationStatus {
  if (driver.verificationStatus === "pending") {
    return driver.driverLicenseVerificationStatus;
  }
  return driver.verificationStatus;
}
