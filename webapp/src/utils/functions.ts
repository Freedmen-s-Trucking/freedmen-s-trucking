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
    return driver.driverLicenseVerificationStatus || "failed";
  }
  return driver.verificationStatus || "failed";
}

/**
 * Generates a Universally Unique Identifier (UUID) using the following methods:
 * 1. Using the `crypto.randomUUID()` function if available.
 * 2. Using the `crypto.getRandomValues()` function if available.
 * 3. Fallback to a random string if none of the above methods are available.
 *
 * The generated UUIDs are in the format of `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
 * and are compliant with RFC 4122.
 *
 * @returns A string representing the generated UUID.
 */
export function generateUUID() {
  if (typeof crypto === "object") {
    if (typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
    if (typeof crypto.getRandomValues === "function") {
      const d = new Uint8Array(16);
      crypto.getRandomValues(d);
      d[6] = (d[6] & 0x0f) | 0x40; // Set version to 4
      d[8] = (d[8] & 0x3f) | 0x80; // Set variant to RFC4122
      const uuid = [...d].map((x) => ("0" + x.toString(16)).slice(-2)).join("");
      return (
        uuid.slice(0, 8) +
        "-" +
        uuid.slice(8, 12) +
        "-" +
        uuid.slice(12, 16) +
        "-" +
        uuid.slice(16, 20) +
        "-" +
        uuid.slice(20)
      );
    }
  }
  return (
    Math.random().toString(36).substring(0, 8) +
    "-" +
    Math.random().toString(36).substring(8, 12) +
    "-" +
    Math.random().toString(36).substring(12, 16) +
    "-" +
    Math.random().toString(36).substring(16, 20) +
    "-" +
    Date.now().toString().substring(1, 12)
  );
}
