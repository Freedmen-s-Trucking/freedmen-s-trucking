import * as axios from 'axios';
import * as https from 'https';

export enum ContentType {
  TypeJson = 'application/json',
  TypeWwwFrom = 'application/x-www-form-urlencoded',
}

/**
 * Posts an http request to the given route.
 * @param {string | Record<string | number, unknown>} data The data to be posted.
 * @param {string} route The end point url.
 * @param {ContentType} contentType The type content  of request.
 * @return {Promise<unknown | undefined>} The server response.
 */
export async function postRequest({
  data,
  route,
  contentType,
}: {
  data: string;
  route: string;
  contentType: ContentType;
}): Promise<{status: number, data: unknown} | undefined> {
  try {
    return (
      await axios.default.post(route, data, {
        headers: {
          'Content-Type': contentType,
        },
      })
    ).data;
  } catch (error) {
    console.error(
      ' [Axios] failed to send post request error: ' +
        error +
        '\n route : ' +
        route
    );
    return undefined;
  }
}

/**
 * Gets an http request to the given route.
 * @param {Record<string, string | undefined>} data The data to be posted.
 * @param {string} route The end point url.
 * @param {Record<string, string>} headers The type content  of request.
 * @return {Promise<unknown | undefined>} The server response.
 */
export async function getRequest({
  data,
  route,
  headers,
}: {
  data?: Record<string | number, unknown>;
  route: string;
  headers?: Record<string, string>;
}): Promise<{status: number, data?: unknown, error?: unknown}> {
  try {
    const agent = new https.Agent({
      rejectUnauthorized: false,
    });
    const response = await axios.default({
      method: 'get',
      url: route,
      headers: headers || {},
      data: data || null,
      httpsAgent: agent,
    });
    console.log(
      `Request completed successfully with status ${
        response.status
      } and data : ${JSON.stringify(response.data)}`
    );
    return { status: response.status, data: response.data };
  } catch (error) {
    console.error(' [Axios] failed to send get request error: ' + error)
    if (axios.default.isAxiosError(error)) {
      const response = error.response;
      if (response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error(response.data);
        return { status: response.status, error: response.data };
      } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        return { status: error.request.status, error: error.request };
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error', error.message);
        return { status: error.request.status, error: error.request };
      }
    }
    console.error(
      ' [Axios] failed to send get request error: ' + '\n route : ' + route
    );
    return { status: 404, error: error };
  }
}
