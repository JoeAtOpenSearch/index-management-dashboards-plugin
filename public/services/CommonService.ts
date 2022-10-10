/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { HttpSetup } from "opensearch-dashboards/public";
import { AcknowledgedResponse } from "../../server/models/interfaces";
import { ServerResponse } from "../../server/models/types";
import { NODE_API } from "../../utils/constants";
import { IAPICaller } from "../../models/interfaces";

export default class CommonService {
  httpClient: HttpSetup;

  constructor(httpClient: HttpSetup) {
    this.httpClient = httpClient;
  }

  apiCaller = async (params: IAPICaller): Promise<ServerResponse<AcknowledgedResponse>> => {
    const url = `${NODE_API.API_CALLER}`;
    const response = (await this.httpClient.fetch(url, {
      method: params.method,
      body: JSON.stringify(params),
    })) as ServerResponse<AcknowledgedResponse>;
    return response;
  };
}
