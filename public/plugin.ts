/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { AppMountParameters, CoreSetup, CoreStart, Plugin, PluginInitializerContext } from "../../../src/core/public";
import { IndexManagementPluginSetup, IndexManagementPluginStart } from ".";
import { actionRepoSingleton } from "./pages/VisualCreatePolicy/utils/helpers";
import { ROUTES } from "./utils/constants";
import { JobHandlerRegister } from "./JobHandler";
import { ManagementSetup } from "../../../src/plugins/management/public";
import { Navigation } from "./pages/Main/Main";
import { CreateManagementItemArgs, ManagementAppMountParams } from "../../../src/plugins/management/public/types";

interface IndexManagementSetupDependencies {
  management: ManagementSetup;
}

interface IndexManagementItem extends CreateManagementItemArgs {
  landingPage: string;
}

const controlCenter = true;

export class IndexManagementPlugin implements Plugin<IndexManagementPluginSetup, IndexManagementPluginStart> {
  constructor(private readonly initializerContext: PluginInitializerContext) {
    // can retrieve config from initializerContext
  }

  public setup(core: CoreSetup, { management }: IndexManagementSetupDependencies): IndexManagementPluginSetup {
    JobHandlerRegister(core);
    if (!controlCenter) {
      // regiester under plugins section
      core.application.register({
        id: "opensearch_index_management_dashboards",
        title: "Index Management",
        order: 7000,
        category: {
          id: "opensearch",
          label: "OpenSearch Plugins",
          order: 2000,
        },
        mount: async (params: AppMountParameters) => {
          const { renderApp } = await import("./index_management_app");
          const [coreStart] = await core.getStartServices();
          return renderApp(coreStart, params, ROUTES.INDEX_POLICIES);
        },
      });

      core.application.register({
        id: "opensearch_snapshot_management_dashboards",
        title: "Snapshot Management",
        order: 7000,
        category: {
          id: "opensearch",
          label: "OpenSearch Plugins",
          order: 2000,
        },
        mount: async (params: AppMountParameters) => {
          const { renderApp } = await import("./index_management_app");
          const [coreStart] = await core.getStartServices();
          return renderApp(coreStart, params, ROUTES.SNAPSHOT_POLICIES);
        },
      });
    }

    // register with management app
    const indexManagementSection = management.sections.section.indexManagement;
    const snapshotManagementSection = management.sections.section.snapshotManagement;

    if (!indexManagementSection) {
      throw new Error("`indexManagementSection` management section not found.");
    }
    if (!snapshotManagementSection) {
      throw new Error("`snapshotManagementSection` management section not found.");
    }

    const indexManagementItems: IndexManagementItem[] = [
      { id: "indexPolicies", title: Navigation.IndexPolicies, order: 0, landingPage: ROUTES.INDEX_POLICIES },
      { id: "managedIndices", title: Navigation.ManagedIndices, order: 10, landingPage: ROUTES.MANAGED_INDICES },
      { id: "indices", title: Navigation.Indices, order: 20, landingPage: ROUTES.INDICES },
      { id: "aliases", title: Navigation.Aliases, order: 30, landingPage: ROUTES.ALIASES },
      { id: "templates", title: Navigation.Templates, order: 40, landingPage: ROUTES.TEMPLATES },
      { id: "dataStreams", title: Navigation.DataStreams, order: 50, landingPage: ROUTES.DATA_STREAMS },
      { id: "composableTemplates", title: Navigation.ComposableTemplates, order: 60, landingPage: ROUTES.COMPOSABLE_TEMPLATES },
      { id: "rollups", title: Navigation.Rollups, order: 70, landingPage: ROUTES.ROLLUPS },
      { id: "transforms", title: Navigation.Transforms, order: 80, landingPage: ROUTES.TRANSFORMS },
    ];

    const snapshotManagementItems: IndexManagementItem[] = [
      { id: "snapshots", title: Navigation.Snapshots, order: 0, landingPage: ROUTES.SNAPSHOTS },
      { id: "snapshotPolicies", title: Navigation.SnapshotPolicies, order: 10, landingPage: ROUTES.SNAPSHOT_POLICIES },
      { id: "repositories", title: Navigation.Repositories, order: 20, landingPage: ROUTES.REPOSITORIES },
    ];

    indexManagementItems.forEach((item) => {
      indexManagementSection.registerApp({
        id: item.id,
        title: item.title,
        order: item.order,
        mount: async (params) => {
          const { renderManagementApp } = await import("./index_management_app");
          const [coreStart] = await core.getStartServices();

          return renderManagementApp(coreStart, params, item.landingPage);
        },
      });
    });

    snapshotManagementItems.forEach((item) => {
      snapshotManagementSection.registerApp({
        id: item.id,
        title: item.title,
        order: item.order,
        mount: async (params: ManagementAppMountParams) => {
          const { renderManagementApp } = await import("./index_management_app");
          const [coreStart] = await core.getStartServices();

          return renderManagementApp(coreStart, params, item.landingPage);
        },
      });
    });

    return {
      registerAction: (actionType, uiActionCtor, defaultAction) => {
        actionRepoSingleton.registerAction(actionType, uiActionCtor, defaultAction);
      },
    };
  }

  public start(core: CoreStart): IndexManagementPluginStart {
    Object.freeze(actionRepoSingleton.repository);
    // After this point, calling registerAction will throw error because "Object is not extensible"
    return {};
  }
}
