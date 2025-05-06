import { ArkErrors, Type } from "arktype";
import {
  DateStringOrTimestamp,
  DriverEntity,
  VerificationStatus,
} from "@freedmen-s-trucking/types";
import { Timestamp } from "firebase/firestore";
import {
  FlowbiteModalTheme,
  FlowbiteTabsTheme,
  getTheme,
} from "flowbite-react";
import { modalTheme, tabTheme } from "./constants";

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

/**
 * Formats a price to USD string.
 * @param {number} amount - The price to format.
 * @returns {string} The formatted price string.
 */
export function formatPrice(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

/**
 * Formats a date to a string.
 * @param {DateStringOrTimestamp} rawDate - The date to format.
 * @param {string} space - The space between the date components.
 * @returns {string} The formatted date string.
 */
export const customDateFormat = (
  rawDate: DateStringOrTimestamp | Date | Timestamp,
  space: string = " ",
): string => {
  let date: Date;
  if (typeof rawDate === "string") {
    date = new Date(rawDate);
  } else if (rawDate instanceof Date) {
    date = rawDate;
  } else if (rawDate === null) {
    return "N/A";
  } else {
    date = new Timestamp(rawDate.seconds, rawDate.nanoseconds).toDate();
  }

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

/**
 * Converts a file to a base64 string.
 * @param {File} file - The file to convert.
 * @returns {Promise<string>} A promise that resolves to the base64 string.
 */
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

/**
 * Returns the verification status of a driver.
 * If the driver's verification status is "pending", it returns the driver's license verification status or "failed".
 * Otherwise, it returns the driver's verification status or "failed".
 *
 * @param {DriverEntity} driver - The driver entity to get the verification status from.
 * @returns {VerificationStatus} The verification status of the driver.
 */
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

function isObject(item: unknown): item is Record<string, unknown> {
  return (
    item !== null && typeof item === "object" && item.constructor === Object
  );
}

function cloneDeep<T = unknown>(source: T): T {
  if (!isObject(source)) {
    return source;
  }
  const output = source;
  for (const key in source) {
    output[key as keyof T] = cloneDeep(source[key as keyof T]);
  }
  return output;
}

// type DeepPartial<T> = {
//   [P in keyof T]?: T[P] extends object
//     ? // eslint-disable-next-line
//       T[P] extends Function
//       ? T[P] // Don't recurse into functions
//       : DeepPartial<T[P]>
//     : T[P];
// };

function mergeDeep<T = unknown, S = unknown>(target: T, source: S): T & S {
  if (!isObject(target) || !isObject(source)) {
    return { ...target, ...source };
  }
  if (isObject(source) && Object.keys(source).length === 0) {
    return cloneDeep({ ...target, ...source });
  }
  const output = { ...target, ...source };
  if (isObject(source) && isObject(target)) {
    for (const key in source) {
      if (isObject(source[key]) && key in target && isObject(target[key])) {
        output[key as keyof (T & S)] = mergeDeep(
          target[key],
          source[key],
        ) as (T & Record<string, unknown> & S)[keyof (T & S)];
      } else {
        output[key as keyof (T & S)] = (
          isObject(source[key]) ? cloneDeep(source[key]) : source[key]
        ) as (T & Record<string, unknown> & S)[keyof (T & S)];
      }
    }
  }
  return output;
}

export const getFlowbiteTheme = () => {
  const defaultTheme = getTheme();
  return {
    tabs: mergeDeep(defaultTheme.tabs, tabTheme) as FlowbiteTabsTheme,
    modal: mergeDeep(defaultTheme.modal, modalTheme) as FlowbiteModalTheme,
  };
};

export function getPasswordSecurityLevel(password: string) {
  const lowerCaseRegExp = /[a-z]/;
  const upperCaseRegExp = /[A-Z]/;
  const numberRegExp = /[0-9]/;
  const symbolRegExp = /[_\-!@#$%^&*(),.?":{}|<>/]/;
  const minimumLength = 6;
  let score = 0;
  const res = {
    level: 0,
    hasLower: false,
    lowerRequired: true,
    hasUpperCase: false,
    upperRequired: true,
    hasSymbol: false,
    symbolRequired: true,
    hasNumber: false,
    numberRequired: false,
    remainingLength: Math.max(minimumLength - password.length, 0),
  };

  score += Math.floor(password.length / 4);
  if (lowerCaseRegExp.test(password)) {
    score += 1 + Math.floor(score / 2);
    res.hasLower = true;
  }
  if (upperCaseRegExp.test(password)) {
    score += 1 + Math.floor(score / 2);
    res.hasUpperCase = true;
  }
  if (numberRegExp.test(password)) {
    score += 1 + Math.floor(score / 2);
    res.hasNumber = true;
  }
  if (symbolRegExp.test(password)) {
    score += 1 + Math.floor(score / 2);
    res.hasSymbol = true;
  }

  if (score < minimumLength) {
    res.level = 0;
  } else if (score < 13) {
    res.level = 1;
  } else if (score < 20) {
    res.level = 2;
  } else if (score >= 20) {
    res.level = 3;
  }

  return res;
}

/**
 * Generates a browser fingerprint based on the user agent string.
 * @returns The browser fingerprint.
 */
export function generateBrowserFingerprint() {
  const str = navigator.userAgent;
  let hash = 0;
  if (str.length === 0) return hash;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}
