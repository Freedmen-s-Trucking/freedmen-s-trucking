/**
 * Converts a distance from kilometers to miles.
 *
 * @param {number} kilometer - The distance in kilometers
 * @return {number} The distance in miles
 */
export function convertKilometerToMiles(kilometer: number): number {
  return kilometer * 0.621371;
}

/**
 * Converts a distance from miles to kilometers.
 *
 * @param {number} miles - The distance in miles
 * @return {number} The distance in kilometers
 */
export function convertMilesToKilometer(miles: number): number {
  return miles / 0.621371;
}
