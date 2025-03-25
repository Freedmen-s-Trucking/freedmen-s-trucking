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

export function formatPaymentAmount(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}
