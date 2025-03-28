import { HarversineGeoRoutingService } from './haversine.js';
import { OSRMGeoRoutingService } from './osrm.js';
import { GeoPoint } from './utils/utils.js';

export enum GeoRoutingServiceType {
  osm,
  haversine,
}

export interface GeoRoutingInterface {
  getDistanceInKilometer(
    request: GetDistanceInKilometerRequest
  ): Promise<GetDistanceInKilometerResponse | undefined>;
}

export interface GetDistanceInKilometerRequest {
  startPoint: GeoPoint;
  endPoint: GeoPoint;
}

export interface GetDistanceInKilometerResponse {
  /**
   * The duration between the start and end points.
   */
  durationInMin?: number;

  /**
   * The distance between the start and end points.
   */
  distance: number;
}

/**
 * The GeoRouting service.
 */
export class GeoRoutingService {
  /**
   * Returns the corresponding georouting implementation service.
   * @param {GeoRoutingServiceType} serviceType The type of open street map routing distance service.
   * @return {GeoRoutingInterface} The corresponding open street map routing distance service implementation.
   */
  static create(serviceType: GeoRoutingServiceType): GeoRoutingInterface {
    switch (serviceType) {
      case GeoRoutingServiceType.osm:
        return new OSRMGeoRoutingService();
      case GeoRoutingServiceType.haversine:
        return new HarversineGeoRoutingService();
      default:
        return new OSRMGeoRoutingService();
    }
  }
}
