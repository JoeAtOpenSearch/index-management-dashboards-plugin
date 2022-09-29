/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from "react";
import { EuiSpacer, EuiTitle, EuiFlexGroup, EuiFlexItem, EuiButton, EuiButtonEmpty } from "@elastic/eui";
import { RouteComponentProps } from "react-router-dom";
import IndexDetail from "../../components/IndexDetail";
import { IndexItem } from "../../../../../models/interfaces";
import { BREADCRUMBS, ROUTES } from "../../../../utils/constants";
import { CoreServicesContext } from "../../../../components/core_services";

interface CreateIndexProps extends RouteComponentProps {
  isEdit?: boolean;
}

interface CreateIndexState {
  indexDetail: IndexItem;
  isSubmitting: boolean;
}

export default class CreateIndex extends Component<CreateIndexProps, CreateIndexState> {
  static contextType = CoreServicesContext;
  state = {
    isSubmitting: false,
    indexDetail: {
      index: "",
      indexUuid: "",
    },
  };

  componentDidMount = async (): Promise<void> => {
    this.context.chrome.setBreadcrumbs([BREADCRUMBS.INDEX_MANAGEMENT, BREADCRUMBS.INDEX_POLICIES, BREADCRUMBS.CREATE_INDEX]);
  };

  onCancel = (): void => {
    if (this.props.isEdit) this.props.history.goBack();
    else this.props.history.push(ROUTES.INDEX_POLICIES);
  };

  onDetailChange = (value: Partial<IndexItem>): void => {
    this.setState({
      indexDetail: {
        ...this.state.indexDetail,
        ...value,
      },
    });
  };

  onSubmit = async (): Promise<void> => {
    const { indexDetail } = this.state;
    this.setState({ isSubmitting: true });
    try {
      console.log(indexDetail);
    } catch (err) {
      this.context.notifications.toasts.addDanger("Invalid Policy JSON");
      console.error(err);
    }

    this.setState({ isSubmitting: false });
  };

  render() {
    const { isEdit } = this.props;
    const { indexDetail, isSubmitting } = this.state;

    return (
      <div style={{ padding: "0px 50px" }}>
        <EuiTitle size="l">
          <h1>{isEdit ? "Edit" : "Create"} index</h1>
        </EuiTitle>
        <EuiSpacer />
        <IndexDetail value={indexDetail} onChange={this.onDetailChange} />
        <EuiSpacer />
        <EuiSpacer />
        <EuiFlexGroup alignItems="center" justifyContent="flexEnd">
          <EuiFlexItem grow={false}>
            <EuiButtonEmpty onClick={this.onCancel} data-test-subj="createPolicyCancelButton">
              Cancel
            </EuiButtonEmpty>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButton fill onClick={this.onSubmit} isLoading={isSubmitting} data-test-subj="createPolicyCreateButton">
              {isEdit ? "Update" : "Create"}
            </EuiButton>
          </EuiFlexItem>
        </EuiFlexGroup>
      </div>
    );
  }
}
