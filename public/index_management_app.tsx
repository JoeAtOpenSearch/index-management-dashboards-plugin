/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { CoreStart, AppMountParameters } from "opensearch-dashboards/public";
import React from "react";
import ReactDOM from "react-dom";
import { HashRouter as Router, Route } from "react-router-dom";
import {
  IndexService,
  ManagedIndexService,
  PolicyService,
  RollupService,
  TransformService,
  NotificationService,
  ServicesContext,
  SnapshotManagementService,
  CommonService,
} from "./services";
import { DarkModeContext } from "./components/DarkMode";
import Main from "./pages/Main";
import { CoreServicesContext } from "./components/core_services";
import DataSourceService from "./services/DataSourceService";
import { BrowserServices } from "./models/interfaces";
import "./app.scss";

export function renderApp(coreStart: CoreStart, params: AppMountParameters, landingPage: string) {
  const http = coreStart.http;

  const indexService = new IndexService(http);
  const managedIndexService = new ManagedIndexService(http);
  const policyService = new PolicyService(http);
  const rollupService = new RollupService(http);
  const transformService = new TransformService(http);
  const notificationService = new NotificationService(http);
  const snapshotManagementService = new SnapshotManagementService(http);
  const commonService = new CommonService(http);
  const dataSourceService = new DataSourceService(coreStart.savedObjects.client);
  const services: BrowserServices = {
    indexService,
    managedIndexService,
    policyService,
    rollupService,
    transformService,
    notificationService,
    snapshotManagementService,
    commonService,
    dataSourceService,
  };

  const isDarkMode = coreStart.uiSettings.get("theme:darkMode") || false;

  ReactDOM.render(
    <Router>
      <Route
        render={(props) => (
          <DarkModeContext.Provider value={isDarkMode}>
            <ServicesContext.Provider value={services}>
              <CoreServicesContext.Provider value={coreStart}>
                <Main {...props} landingPage={landingPage} />
              </CoreServicesContext.Provider>
            </ServicesContext.Provider>
          </DarkModeContext.Provider>
        )}
      />
    </Router>,
    params.element
  );
  return () => {
    ReactDOM.unmountComponentAtNode(params.element);
  };
}
