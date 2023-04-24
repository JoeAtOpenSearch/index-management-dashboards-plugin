/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { CoreStart } from "opensearch-dashboards/public";
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
import "./app.scss";
import { ManagementAppMountParams } from "src/plugins/management/public";

export function renderManagementApp(
  coreStart: CoreStart,
  params: ManagementAppMountParams,
  landingPage: string,
  managementApp: boolean = true
) {
  const http = coreStart.http;
  const chrome = coreStart.chrome;

  const indexService = new IndexService(http);
  const managedIndexService = new ManagedIndexService(http);
  const policyService = new PolicyService(http);
  const rollupService = new RollupService(http);
  const transformService = new TransformService(http);
  const notificationService = new NotificationService(http);
  const snapshotManagementService = new SnapshotManagementService(http);
  const commonService = new CommonService(http);
  const services = {
    indexService,
    managedIndexService,
    policyService,
    rollupService,
    transformService,
    notificationService,
    snapshotManagementService,
    commonService,
  };

  const isDarkMode = coreStart.uiSettings.get("theme:darkMode") || false;

  const coreStartAsScope = { ...coreStart, chrome: { ...coreStart.chrome, setBreadcrumbs: params.setBreadcrumbs } };

  ReactDOM.render(
    // <Router history={params.history}>
    <Router>
      <Route
        render={(props) => (
          <DarkModeContext.Provider value={isDarkMode}>
            <ServicesContext.Provider value={services}>
              <CoreServicesContext.Provider value={coreStartAsScope}>
                <Main {...props} landingPage={landingPage} />
              </CoreServicesContext.Provider>
            </ServicesContext.Provider>
          </DarkModeContext.Provider>
        )}
      />
    </Router>,
    params.element
  );
  // return () => ReactDOM.unmountComponentAtNode(params.element);
  return () => {
    chrome.docTitle.reset();
    ReactDOM.unmountComponentAtNode(params.element);
  };
}
