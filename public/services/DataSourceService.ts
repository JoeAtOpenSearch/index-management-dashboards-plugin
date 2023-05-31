/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { SavedObjectsClientContract } from "opensearch-dashboards/public";
import { IDataSource } from "../../models/interfaces";
import { getDataSources } from "../../../../src/plugins/data_source_management/public/components/utils";

export default class DataSourceService {
  private savedObjectClient: SavedObjectsClientContract;

  constructor(savedObjectClient: SavedObjectsClientContract) {
    this.savedObjectClient = savedObjectClient;
  }

  async getDataSource(): Promise<IDataSource[]> {
    return getDataSources(this.savedObjectClient);
  }
}
