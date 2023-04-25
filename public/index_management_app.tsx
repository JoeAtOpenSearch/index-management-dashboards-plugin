/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { CoreStart } from "opensearch-dashboards/public";
import React from "react";
import ReactDOM from "react-dom";
import { HashRouter as Router, Route, matchPath } from "react-router-dom";
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
import { ManagementAppMountParams } from "src/plugins/management/public";
import { indexManagementItems } from "./pages/Main/Main";
import "./app.scss";

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

  const coreStartAsScope = { ...coreStart, chrome: { ...coreStart.chrome } };
  const handler = ({ newURL, oldURL }: HashChangeEvent) => {
    const previousUrlObject = new URL(oldURL);
    const currentUrlObject = new URL(newURL);
    const previousApp = indexManagementItems.find((item) =>
      item.hashRoutes.some((hashRoute) => matchPath(previousUrlObject.hash.replace(/^#?/, "").replace(/\?.*$/, ""), hashRoute))
    );
    const currentApp = indexManagementItems.find((item) =>
      item.hashRoutes.some((hashRoute) => matchPath(currentUrlObject.hash.replace(/^#?/, "").replace(/\?.*$/, ""), hashRoute))
    );
    if (previousApp && currentApp && previousApp.id !== currentApp.id) {
      params.history.replace(`../${currentApp.id}`);
    }
  };

  window.addEventListener("hashchange", handler);

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
    window.removeEventListener("hashchange", handler);
  };
}
