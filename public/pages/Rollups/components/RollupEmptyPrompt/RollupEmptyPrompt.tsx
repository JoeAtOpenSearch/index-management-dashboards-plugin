/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { EuiButton, EuiEmptyPrompt, EuiText } from "@elastic/eui";

export const TEXT = {
  RESET_FILTERS: "There are no rollup jobs matching your applied filters. Reset your filters to view your rollup jobs.",
  NO_ROLLUPS:
    "Rollup jobs help you conserve storage space for historical time series data while preserving the specific information you need.",
  LOADING: "Loading rollup jobs...",
};

const getMessagePrompt = ({ filterIsApplied, loading }: RollupEmptyPromptProps) => {
  if (loading) return TEXT.LOADING;
  if (filterIsApplied) return TEXT.RESET_FILTERS;
  return TEXT.NO_ROLLUPS;
};

const getActions: React.SFC<RollupEmptyPromptProps> = ({ filterIsApplied, loading, resetFilters, createRollup }) => {
  if (loading) {
    return null;
  }
  if (filterIsApplied) {
    return (
      <EuiButton fill onClick={resetFilters} data-test-subj="rollupEmptyPromptRestFilters">
        Reset Filters
      </EuiButton>
    );
  }

  return (
    <EuiButton onClick={createRollup} data-test-subj="emptyPromptCreateRollupButton">
      Create rollup
    </EuiButton>
  );
};

interface RollupEmptyPromptProps {
  filterIsApplied: boolean;
  loading: boolean;
  resetFilters: () => void;
  createRollup: () => void;
}

const RollupEmptyPrompt: React.SFC<RollupEmptyPromptProps> = (props) => (
  <EuiEmptyPrompt
    style={{ maxWidth: "45em" }}
    body={
      <EuiText>
        <p>{getMessagePrompt(props)}</p>
      </EuiText>
    }
    actions={getActions(props)}
  />
);

export default RollupEmptyPrompt;
