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
import { CreateManagementItemArgs } from "../../../src/plugins/management/public/types";

interface IndexManagementSetupDependencies {
  management: ManagementSetup;
}

interface IndexManagementItem extends CreateManagementItemArgs {
  landingPage: string;
}

export class IndexManagementPlugin implements Plugin<IndexManagementPluginSetup, IndexManagementPluginStart> {
  constructor(private readonly initializerContext: PluginInitializerContext) {
    // can retrieve config from initializerContext
  }

  public setup(core: CoreSetup, { management }: IndexManagementSetupDependencies): IndexManagementPluginSetup {
    JobHandlerRegister(core);
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
        const [coreStart, depsStart] = await core.getStartServices();
        return renderApp(coreStart, params, ROUTES.INDEX_POLICIES);
      },
    });

    const indexManagementSection = management.sections.section.indexManagement;
    const snapshotManagementSection = management.sections.section.snapshotManagement;

    if (!indexManagementSection) {
      throw new Error("`indexManagementSection` management section not found.");
    }
    if (!snapshotManagementSection) {
      throw new Error("`snapshotManagementSection` management section not found.");
    }

    const indexManagementItems: IndexManagementItem[] = [
      { id: "IndexPolicies", title: Navigation.IndexPolicies, order: 0, landingPage: ROUTES.INDEX_POLICIES },
      { id: "ManagedIndices", title: Navigation.ManagedIndices, order: 10, landingPage: ROUTES.MANAGED_INDICES },
      { id: "Indices", title: Navigation.Indices, order: 20, landingPage: ROUTES.INDICES },
      { id: "Aliases", title: Navigation.Aliases, order: 30, landingPage: ROUTES.ALIASES },
      { id: "Templates", title: Navigation.Templates, order: 40, landingPage: ROUTES.TEMPLATES },
      { id: "DataStreams", title: Navigation.DataStreams, order: 50, landingPage: ROUTES.DATA_STREAMS },
      { id: "ComposableTemplates", title: Navigation.ComposableTemplates, order: 60, landingPage: ROUTES.COMPOSABLE_TEMPLATES },
      { id: "Rollups", title: Navigation.Rollups, order: 70, landingPage: ROUTES.ROLLUPS },
      { id: "Transforms", title: Navigation.Transforms, order: 80, landingPage: ROUTES.TRANSFORMS },
    ];

    const snapshotManagementItems: IndexManagementItem[] = [
      { id: "Snapshots", title: Navigation.Snapshots, order: 0, landingPage: ROUTES.SNAPSHOTS },
      { id: "SnapshotPolicies", title: Navigation.SnapshotPolicies, order: 10, landingPage: ROUTES.SNAPSHOT_POLICIES },
      { id: "Repositories", title: Navigation.Repositories, order: 20, landingPage: ROUTES.REPOSITORIES },
    ];

    indexManagementItems.forEach((item) => {
      indexManagementSection.registerApp({
        id: item.id,
        title: item.title,
        order: item.order,
        mount: async (params) => {
          const { renderApp } = await import("./index_management_app");
          const [coreStart] = await core.getStartServices();

          return renderApp(coreStart, params, item.landingPage);
        },
      });
    });

    snapshotManagementItems.forEach((item) => {
      snapshotManagementSection.registerApp({
        id: item.id,
        title: item.title,
        order: item.order,
        mount: async (params) => {
          const { renderApp } = await import("./index_management_app");
          const [coreStart] = await core.getStartServices();

          return renderApp(coreStart, params, item.landingPage);
        },
      });
    });

    // core.application.register({
    //   id: "opensearch_snapshot_management_dashboards",
    //   title: "Snapshot Management",
    //   order: 9060,
    //   category: DEFAULT_APP_CATEGORIES.management,
    //   // category: {
    //   //   id: "opensearch",
    //   //   label: "OpenSearch Plugins",
    //   //   order: 2000,
    //   // },
    //   mount: async (params: AppMountParameters) => {
    //     const { renderApp } = await import("./index_management_app");
    //     const [coreStart, depsStart] = await core.getStartServices();
    //     return renderApp(coreStart, {element: params.element} as ManagementAppMountParams, ROUTES.SNAPSHOT_POLICIES);
    //   },
    // });

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
