export function checkFalsyAndThrow(
  paramsToCheck: Record<string, unknown>,
  traceRef?: string,
) {
  for (const valueProvided of Object.values(paramsToCheck)) {
    if (!valueProvided || Object(valueProvided).length === 0) {
      throw new Error(
        `${traceRef || ""}:: Unexpected falsy parameters ${JSON.stringify(paramsToCheck, () => null, " ")}`,
      );
    }
  }
}
