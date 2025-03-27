export const enum ResponseStatus {
  success = 200,
  error = 400,
}

export interface GeoPoint {
  readonly latitude: number;
  readonly longitude: number;
}

/**
 * Returns the value converted to Kilometers.
 * @param {number} value the value in meter to convert in Km.
 * @return {number} the value in Km.
 */
export const convertToKm = (value: number): number => {
  return Math.round(value * 0.001 * 100) / 100;
};

/**
 * Returns the value converted to minutes.
 * The return value will be rounded to the maximum value.
 * eg: 3.5Min => 4, 3.2Min =>3.
 * @param {number} seconds the value in second to convert.
 * @return {number} the value in Minute.
 */
export const convertToMin = (seconds: number): number => {
  return Math.round(seconds / 60);
};
