import {GetDistanceInKilometerRequest, GetDistanceInKilometerResponse, GeoRoutingInterface} from "./georouting.js";
import {getRequest} from "./utils/http_request.js";
import {convertToKm, convertToMin, GeoPoint} from "./utils/utils.js";

const routingUrl = (startingPoint: GeoPoint, endPoint: GeoPoint) => {
  return (
    "http://router.project-osrm.org/route/v1/driving" +
    `/${endPoint.longitude},${endPoint.latitude};${startingPoint.longitude},${startingPoint.latitude}`
  );
};

/**
 * GeoRoutingService implementation using OSRM.
 */
export class OSRMGeoRoutingService implements GeoRoutingInterface {
  /**
   * Calculates the fastest distance, route and time for a route.
   * @param {GetDistanceInKilometerRequest} request The provided starting and destination point in degree.
   * @return {GetDistanceInKilometerResponse} The distance and duration between the two point.
   **/
  async getDistanceInKilometer(
    request: GetDistanceInKilometerRequest,
  ): Promise<GetDistanceInKilometerResponse | undefined> {
    const response = await getRequest({
      route: routingUrl(request.startPoint, request.endPoint),
    });
    if (response.error) {
      console.error(" [OSRM] failed to get distance in kilometer error: ", JSON.stringify(response.error));
      return;
    }

    const routingResponse = response.data as null | Array<GetDistanceInKilometerResponse>;
    if (!routingResponse || routingResponse.length < 1) {
      console.log(`Route not found for the given points ${JSON.stringify(request)}`);
      return;
    }

    const distanceInKm = convertToKm(routingResponse[0].distance);
    const timeInMin = convertToMin(routingResponse[0].durationInMin ?? 0);
    return {distance: distanceInKm, durationInMin: timeInMin};
  }
}
