import {Coordinate} from "@freedmen-s-trucking/types";
import * as geofire from "geofire-common";

/**
 * Converts number from degree to radians.
 * @param {number} degree The provided degree value.
 * @return {number} The requested radians value.
 **/
function toRadians(degree: number): number {
  return (degree * Math.PI) / 180;
}

/**
 * Creates a geoHash of the given geolocation.
 * @param {number} latitude The latitude of the geolocation.
 * @param {number} longitude The longitude of the geolocation.
 * @return {string} The requested geoHash.
 **/
export function getGeoHash(latitude: number, longitude: number): string {
  const geoHasPrecision = 12;
  const centerCoordinate: [number, number] = [latitude, longitude];

  return geofire.geohashForLocation(centerCoordinate, geoHasPrecision);
}

/**
 * Calculates a set of query bounds to fully contain a given circle, each being a [start, end] pair
 * where any geohash is guaranteed to be lexicographically larger than start and smaller than end.
 * @param {[number, number]} center The center given as [latitude, longitude] pair.
 * @param {number} radius The radius of the circle.
 * @return {Array<string[]>} An array of geohash query bounds, each containing a [start, end] pair.
 **/
export function getGeohashQueryBounds(center: [number, number], radius: number): string[][] {
  return geofire.geohashQueryBounds(center, radius);
}

/**
 * Calculates the distance between the supplied coordinates in meters.
 * The distance between the coordinates is calculated using the Haversine.
 * (Method get from https://en.wikipedia.org/wiki/Haversine_formula).
 * @param {Coordinate} startPoint The provided starting point in degree.
 * @param {Coordinate} endPoint The provided destination point in degree.
 * @return {number} The requested distance in meter.
 **/
export function getDistanceInMeterBetween(startPoint: Coordinate, endPoint: Coordinate): number {
  // The mean earth radius in kilometers
  const earthRadius = 6371009;
  const dLat = toRadians(endPoint.latitude - startPoint.latitude);
  const dLon = toRadians(endPoint.longitude - startPoint.longitude);

  const a =
    Math.pow(Math.sin(dLat / 2), 2) +
    Math.pow(Math.sin(dLon / 2), 2) * Math.cos(toRadians(startPoint.latitude)) * Math.cos(toRadians(endPoint.latitude));
  const c = 2 * Math.asin(Math.sqrt(a));

  return earthRadius * c;
}

/**
 * Calculates the rounded distance between two point in kilometers with
 * one decimal precision.
 * @param {Coordinate} startPoint The provided starting point in degree.
 * @param {Coordinate} endPoint The provided destination point in degree.
 * @return {number} The requested distance in meter.
 **/
export function getRoundedDistanceInKilometerBetween(startPoint: Coordinate, endPoint: Coordinate): number {
  const distanceInKm = getDistanceInMeterBetween(startPoint, endPoint) / 1000;
  return Math.round(distanceInKm * 10) / 10;
}
