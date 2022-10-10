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
import { IndexDetailProps } from "../../components/IndexDetail/IndexDetail";
import { CommonService } from "../../../../services/index";

interface CreateIndexProps extends RouteComponentProps {
  isEdit?: boolean;
  commonService: CommonService;
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
    },
  };

  componentDidMount = async (): Promise<void> => {
    this.context.chrome.setBreadcrumbs([BREADCRUMBS.INDEX_MANAGEMENT, BREADCRUMBS.INDEX_POLICIES, BREADCRUMBS.CREATE_INDEX]);
  };

  onCancel = (): void => {
    if (this.props.isEdit) this.props.history.goBack();
    else this.props.history.push(ROUTES.INDEX_POLICIES);
  };

  onDetailChange: IndexDetailProps["onChange"] = (value) => {
    this.setState({
      indexDetail: {
        ...this.state.indexDetail,
        ...value,
      },
    });
  };

  onSubmit = async (): Promise<void> => {
    const { indexDetail } = this.state;
    const { index, ...others } = indexDetail;
    this.setState({ isSubmitting: true });
    try {
      const result = await this.props.commonService.apiCaller({
        path: index,
        method: "PUT",
        body: others,
      });
      if (result && result.ok) {
        this.context.notifications.toasts.addSuccess(`${indexDetail.index} has been successfully created.`);
        this.props.history.push(ROUTES.INDICES);
      } else {
        throw new Error(result.error);
      }
    } catch (err: any) {
      this.context.notifications.toasts.addDanger(err.message);
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
            <EuiButtonEmpty onClick={this.onCancel} data-test-subj="createIndexCancelButton">
              Cancel
            </EuiButtonEmpty>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButton fill onClick={this.onSubmit} isLoading={isSubmitting} data-test-subj="createIndexCreateButton">
              {isEdit ? "Update" : "Create"}
            </EuiButton>
          </EuiFlexItem>
        </EuiFlexGroup>
      </div>
    );
  }
}
