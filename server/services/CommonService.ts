/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { AcknowledgedResponse } from "../models/interfaces";
import { ServerResponse } from "../models/types";
import {
  OpenSearchDashboardsRequest,
  OpenSearchDashboardsResponseFactory,
  ILegacyCustomClusterClient,
  IOpenSearchDashboardsResponse,
  RequestHandlerContext,
} from "../../../../src/core/server";
import { IAPICaller } from "../../models/interfaces";

export interface ICommonCaller {
  <T>(arg: any): T;
}

export default class IndexService {
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
      console.log("request.body", JSON.stringify(request.body));
      const commonCaller = await callWithRequest("ism.apiCaller", request.body as IAPICaller);
      return response.custom({
        statusCode: 200,
        body: {
          ok: true,
          response: commonCaller,
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
}
