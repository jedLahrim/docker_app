import { request, RequestOptions } from 'https';
import { LinkStatsResponse } from './types/link-stats-api';
import {
  DynamicLinkInfo,
  ShortLinkRequestBody,
  ShortLinkResponse,
} from './types/short-link-api';

export class FirebaseDynamicLinksService {
  private readonly webApiKey: string =
    'AIzaSyBuwL8nwiy_gyd6v1lg9eNPuvxuYeKxSfk';

  /**
   * @constructor
   * @param(webApiKey) API key to authenticate your requests to the API.
   * Take note of your project `Web Api Key` from [setting page](https://console.firebase.google.com/project/_/settings/general/) of the Firebase console.
   */
  // constructor(webApiKey: string) {
  //   if (webApiKey == null) {
  //     throw new Error(
  //       'Firebase Dynamic Links: Web Api Key can not be null or undefined',
  //     );
  //   } else {
  //     this.webApiKey = webApiKey;
  //   }
  // }

  /**
   * You can use this function to generate short Dynamic Links.
   * @param body read full documentation [here](https://firebase.google.com/docs/reference/dynamic-links/link-shortener#request_body)
   * @return read full documentation [here](https://firebase.google.com/docs/reference/dynamic-links/link-shortener#response_body)
   */
  async createLink(body: ShortLinkRequestBody): Promise<ShortLinkResponse> {
    const data: string = JSON.stringify(body);

    const options: RequestOptions = {
      hostname: 'firebasedynamiclinks.googleapis.com',
      path: `/v1/shortLinks?key=${this.webApiKey}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    };

    return new Promise((resolve, reject) => {
      const req = request(options, (res) => {
        const buffers: Buffer[] = [];
        res
          .on('data', (chunk) => {
            buffers.push(chunk);
          })
          .on('end', () => {
            const d = Buffer.concat(buffers).toString();
            const resBody = JSON.parse(d);
            if (res.statusCode === 200) {
              resolve(resBody);
            } else {
              reject(resBody);
            }
          });
      });

      req.on('error', reject);
      req.write(data);
      req.end();
    });
  }

  /**
   * Use the this function to get event statistics for a single Dynamic Link.
   * @param shortDynamicLink The URL-encoded short Dynamic Link for which you want to get event data. read full documentation [here](https://firebase.google.com/docs/reference/dynamic-links/analytics#http_request)
   * @param duration The number of days for which to get event data. read full documentation [here](https://firebase.google.com/docs/reference/dynamic-links/analytics#http_request)
   * @param accessToken An unexpired access token. read full documentation [here](https://firebase.google.com/docs/reference/dynamic-links/analytics#api_authorization)
   * @return read full documentation [here](https://firebase.gogle.com/docs/reference/dynamic-links/analytics#response_body)
   */
  async getLinkStats(): // shortDynamicLink: string,
  // duration: number,
  // accessToken: string
  Promise<LinkStatsResponse> {
    const options: RequestOptions = {
      hostname: 'firebasedynamiclinks.googleapis.com',
      // path: `/v1/${encodeURIComponent(
      // shortDynamicLink
      // )}/linkStats?durationDays=${duration}`,
      method: 'GET',
      headers: {
        // Authorization: `Bearer ${accessToken}`
      },
    };

    return new Promise((resolve, reject) => {
      const request1 = request(options, (resp) => {
        const buffers: Buffer[] = [];
        resp
          .on('data', (chunk) => {
            buffers.push(chunk);
          })
          .on('end', () => {
            const d = Buffer.concat(buffers).toString();
            const resBody = JSON.parse(d);
            if (resp.statusCode === 200) {
              resolve(resBody);
            } else {
              reject(resBody);
            }
          });
      });

      request1.on('error', reject);
      request1.end();
    });
  }

  /**
   * @deprecated Use {@link createLink} instead
   */
  async createShortLink(
    dynamicLinkInfo: DynamicLinkInfo,
    // suffix?: "SHORT" | "UNGUESSABLE"
  ): Promise<ShortLinkResponse> {
    const requestBody: ShortLinkRequestBody = {
      dynamicLinkInfo,
      // suffix: suffix && { option: suffix }
    };

    return this.createLink(requestBody);
  }

  /**
   * @deprecated Use {@link createLink} instead
   */
  async createShortLinkFromLongLink(
    longDynamicLink: string,
    suffix?: 'SHORT' | 'UNGUESSABLE',
  ): Promise<ShortLinkResponse> {
    const requestBody: ShortLinkRequestBody = {
      longDynamicLink,
      suffix: suffix && { option: suffix },
    };

    return this.createLink(requestBody);
  }

  // share() {
  //   const drakeProfileData = {
  //     title: 'Drake Doppelganger',
  //     text: 'üí°Share like a pro from your web application',
  //     url: 'https://kvkirthy.github.io/web-share-sample',
  //   };
  //
  //   const btn = document.querySelector('svg');
  //
  //   // Share must be triggered by "user activation"
  //   btn.addEventListener('click', async () => {
  //     try {
  //       if (
  //         navigator.canShare &&
  //         typeof navigator.canShare === 'function' &&
  //         navigator.canShare(drakeProfileData)
  //       ) {
  //         let result: any = await navigator.share(drakeProfileData);
  //         document.getElementById('status').innerText = result || '';
  //       } else {
  //         document.getElementById('status').innerText =
  //           'Sharing selected data not supported.';
  //       }
  //     } catch (err) {
  //       document.getElementById('status').innerText = 'Share not complete';
  //     }
  //   });
  // }
}
