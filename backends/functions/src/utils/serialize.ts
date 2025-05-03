/**
 * Converts a Record<string, unknown> to a Record<string, string> by stringifying
 * each value in the original object.
 *
 * @param {Record<string, unknown>} param The object to serialize
 * @return {Record<string, string>} A new object with the same keys as param, but with string values
 */
export function serializeToStripeMeta(param: Record<string, unknown>) {
  const result = <Record<string, string>>{};
  for (const [key, value] of Object.entries(param)) {
    result[key] = JSON.stringify(value);
  }
  return result;
}

/**
 * Converts a Record<string, string> to a Record<string, unknown> by parsing
 * each value in the original object.
 *
 * @param {Record<string, unknown>} param The object to parse
 * @return {Record<string, unknown>} A new object with the same keys as param, but with unknown values
 */
export function parseStripeMeta(param: Record<string, unknown>) {
  const result = <Record<string, unknown>>{};
  for (const [key, value] of Object.entries(param)) {
    if (typeof value === "string") {
      result[key] = JSON.parse(value);
    } else {
      result[key] = value;
    }
  }
  return result;
}
