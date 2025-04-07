export function checkFalsyAndThrow(
  paramsToCheck: Record<string, unknown>,
  traceRef?: string,
) {
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
