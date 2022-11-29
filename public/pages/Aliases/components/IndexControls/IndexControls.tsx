/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from "react";
import { EuiComboBox, EuiFieldSearch, EuiFlexGroup, EuiFlexItem } from "@elastic/eui";
import { ALIAS_STATUS_OPTIONS } from "../../../../utils/constants";

export interface SearchControlsProps {
  value: {
    search: string;
    status: string;
  };
  onSearchChange: (args: SearchControlsProps["value"]) => void;
}

export default class SearchControls extends Component<SearchControlsProps, SearchControlsProps["value"]> {
  state = this.props.value;
  onSearchChange = () => {
    this.props.onSearchChange(this.state);
  };
  onChange = <T extends keyof SearchControlsProps["value"]>(field: T, value: SearchControlsProps["value"][T]) => {
    this.setState(
      {
        [field]: value,
      } as SearchControlsProps["value"],
      () => {
        this.onSearchChange();
      }
    );
  };
  render() {
    return (
      <EuiFlexGroup style={{ padding: "0px 5px" }} alignItems="center">
        <EuiFlexItem>
          <EuiFieldSearch
            fullWidth
            placeholder="Search..."
            onKeyUp={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === "Enter") {
                e.defaultPrevented = true;
                this.onChange("search", e.currentTarget.value);
              }
            }}
          />
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiComboBox
            style={{
              width: 150,
            }}
            singleSelection={{
              asPlainText: true,
            }}
            placeholder="Status"
            options={ALIAS_STATUS_OPTIONS}
            selectedOptions={this.state.status ? [{ label: this.state.status }] : []}
            onChange={(val) => this.onChange("status", val[0].label)}
          />
        </EuiFlexItem>
      </EuiFlexGroup>
    );
  }
}
