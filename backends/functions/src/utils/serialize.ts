export function serializeToStripeMeta(param: Record<string, unknown>) {
  const result = <Record<string, string>>{};
  for (const [key, value] of Object.entries(param)) {
    result[key] = JSON.stringify(value);
  }
  return result;
}

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
