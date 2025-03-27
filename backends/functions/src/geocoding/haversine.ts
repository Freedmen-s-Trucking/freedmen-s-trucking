import {
  GetDistanceInKilometerRequest,
  GetDistanceInKilometerResponse,
  GeoRoutingInterface,
} from './georouting';
import { GeoPoint } from './utils/utils';

/**
 * GeoRoutingService implementation using the Harversine algorithm.
 */
export class HarversineGeoRoutingService implements GeoRoutingInterface {
  /**
   * Calculates the fastest distance, route and time for a route.
   * @param {GetDistanceInKilometerRequest} request The provided starting and destination point in degree.
   * @return {GetDistanceInKilometerResponse} The distance and duration between the two point.
   **/
  async getDistanceInKilometer(
    request: GetDistanceInKilometerRequest
  ): Promise<GetDistanceInKilometerResponse | undefined> {
    const distance = getRoundedDistanceInKilometerBetween(
      request.startPoint,
      request.endPoint
    );
    return { distance: distance };
  }
}

/**
 * Converts number from degree to radians.
 * @param {number} degree The provided degree value.
 * @return {number} The requested radians value.
 **/
function toRadians(degree: number): number {
  return (degree * Math.PI) / 180;
}

/**
 * Calculates the distance between the supplied coordinates in meters.
 * The distance between the coordinates is calculated using the Haversine.
 * (Method get from https://en.wikipedia.org/wiki/Haversine_formula).
 * @param {GeoPoint} startPoint The provided starting point in degree.
 * @param {GeoPoint} endPoint The provided destination point in degree.
 * @return {number} The requested distance in meter.
 **/
export function getDistanceInMeterBetween(
  startPoint: GeoPoint,
  endPoint: GeoPoint
): number {
  // The mean earth radius in kilometers
  const earthRadius = 6371009;
  const dLat = toRadians(endPoint.latitude - startPoint.latitude);
  const dLon = toRadians(endPoint.longitude - startPoint.longitude);

  const a =
    Math.pow(Math.sin(dLat / 2), 2) +
    Math.pow(Math.sin(dLon / 2), 2) *
      Math.cos(toRadians(startPoint.latitude)) *
      Math.cos(toRadians(endPoint.latitude));
  const c = 2 * Math.asin(Math.sqrt(a));

  return earthRadius * c;
}

/**
 * Calculates the rounded distance between two points in kilometers with
 * one decimal precision.
 * @param {GeoPoint} startPoint The provided starting point in degree.
 * @param {GeoPoint} endPoint The provided destination point in degree.
 * @return {number} The requested distance in meter.
 **/
export function getRoundedDistanceInKilometerBetween(
  startPoint: GeoPoint,
  endPoint: GeoPoint
): number {
  const distanceInKm = getDistanceInMeterBetween(startPoint, endPoint) / 1000;
  return Math.round(distanceInKm * 10) / 10;
}
