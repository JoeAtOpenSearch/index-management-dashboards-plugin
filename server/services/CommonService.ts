/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import { Client } from "@opensearch-project/opensearch";
import { get } from "lodash";
import { AcknowledgedResponse } from "../models/interfaces";
import { ServerResponse } from "../models/types";
import {
  OpenSearchDashboardsRequest,
  OpenSearchDashboardsResponseFactory,
  ILegacyCustomClusterClient,
  IOpenSearchDashboardsResponse,
  RequestHandlerContext,
} from "../../../../src/core/server";
import { IAPICaller, IProxyCaller } from "../../models/interfaces";

export interface ICommonCaller {
  <T>(arg: any): T;
}

let requestId = 0;

export default class CommonService {
  osDriver: ILegacyCustomClusterClient;

  constructor(osDriver: ILegacyCustomClusterClient) {
    this.osDriver = osDriver;
  }

  apiCaller = async (
    context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest,
    response: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<ServerResponse<AcknowledgedResponse>>> => {
    try {
      const { callAsCurrentUser: callWithRequest } = this.osDriver.asScoped(request);
      const useQuery = !request.body;
      const usedParam = (useQuery ? request.query : request.body) as IAPICaller;
      const { endpoint, data } = usedParam || {};
      const payload = useQuery ? JSON.parse(data || "{}") : data;
      const commonCallerResponse = await callWithRequest(endpoint, payload || {});
      return response.custom({
        statusCode: 200,
        body: {
          ok: true,
          response: commonCallerResponse,
        },
      });
    } catch (err) {
      console.error("Index Management - CommonService - apiCaller", err);
      return response.custom({
        statusCode: 200,
        body: {
          ok: false,
          error: err.message,
        },
      });
    }
  };

  proxyApiCaller = async (
    context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest,
    response: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<ServerResponse<any>>> => {
    const { endpoint, data, remoteInfo } = request.body as IProxyCaller;
    if (!remoteInfo || !remoteInfo?.host) {
      return response.custom({
        statusCode: 200,
        body: {
          ok: false,
          error: "host is required",
        },
      });
    }
    const proxyClient = new Client({
      node: remoteInfo?.host,
      ssl: {
        requestCert: true,
        rejectUnauthorized: true,
      },
    });
    let finalClient = proxyClient.child();
    if (remoteInfo.username && remoteInfo.password) {
      finalClient = proxyClient.child({
        auth: {
          username: remoteInfo.username,
          password: remoteInfo.password,
        },
        headers: {
          authorization: null,
        },
      });
    }
    const endpointFunction = get(finalClient, endpoint);
    if (!endpointFunction) {
      return response.custom({
        statusCode: 200,
        body: {
          ok: false,
          error: "Not found endpoint",
        },
      });
    }

    try {
      const result =
        endpoint === "transport.request"
          ? await finalClient.transport.request(data, {
              id: requestId++,
            })
          : await endpointFunction.call(finalClient, data);
      finalClient.close();
      return response.custom({
        statusCode: 200,
        body: {
          ok: true,
          response: result.body,
        },
      });
    } catch (err) {
      finalClient.close();
      return response.custom({
        statusCode: 200,
        body: {
          ok: false,
          error: err.message,
        },
      });
    }
  };
}
