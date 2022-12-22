/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { ChangeEvent, useContext, useEffect, useState } from "react";
import CustomFormRow from "../../../../components/CustomFormRow";
import { EuiCheckbox, EuiComboBox, EuiComboBoxOptionOption, EuiFieldText, EuiLink, EuiSpacer, EuiText } from "@elastic/eui";
import { CoreServicesContext } from "../../../../components/core_services";
import { CoreStart } from "opensearch-dashboards/public";
import CustomLabel from "../../../../components/CustomLabel";

interface ReindexOptionsProps {
  slices: string;
  onSlicesChange: (e: ChangeEvent<HTMLInputElement>) => void;
  sliceErr?: string;
  selectedPipelines?: EuiComboBoxOptionOption[];
  onSelectedPipelinesChange: (options: EuiComboBoxOptionOption[]) => void;
  getAllPipelines: () => Promise<EuiComboBoxOptionOption[]>;
  copyUniqueDoc: boolean;
  onCopyUniqueDocChange: (val: ChangeEvent<HTMLInputElement>) => void;
}

const ReindexAdvancedOptions = (props: ReindexOptionsProps) => {
  let pipelinesInit: EuiComboBoxOptionOption[] = [];
  const [pipelines, SetPipelines] = useState(pipelinesInit);
  const coreServices = useContext(CoreServicesContext) as CoreStart;

  const {
    slices,
    sliceErr,
    onSlicesChange,
    selectedPipelines,
    onSelectedPipelinesChange,
    getAllPipelines,
    copyUniqueDoc,
    onCopyUniqueDocChange,
  } = props;

  useEffect(() => {
    getAllPipelines()
      .then((pipelines) => {
        SetPipelines(pipelines);
      })
      .catch((err) => {
        coreServices.notifications.toasts.addDanger(`fetch pipelines error ${err}`);
      });
  }, [coreServices, getAllPipelines]);

  return (
    <div style={{ padding: "10px 10px" }}>
      <EuiCheckbox
        id="ConflictsOption"
        label={<CustomLabel title="Reindex only unique documents" helpText="Copy only documents missing from destination index." />}
        checked={copyUniqueDoc}
        onChange={onCopyUniqueDocChange}
      />
      <EuiSpacer />

      <CustomFormRow
        isInvalid={!!sliceErr}
        error={sliceErr}
        label="Slices"
        helpText="The number of subtasks OpenSearch should divide this task into. Setting to auto indicates OpenSearch that it should automatically decide how many slices to split the task into."
      >
        <EuiFieldText data-test-subj="slices" value={slices} onChange={onSlicesChange} />
      </CustomFormRow>

      <EuiSpacer />
      <CustomFormRow
        label="Ingest pipeline"
        helpText={
          <>
            Ingest pipeline to transform your data during the reindexing process.
            <EuiText size="xs">
              <EuiLink href={coreServices.docLinks.links.opensearch.reindexData.transform} target="_blank">
                Learn more.
              </EuiLink>
            </EuiText>
          </>
        }
      >
        <EuiComboBox
          aria-label="Ingest Pipeline"
          placeholder="Select a single ingest pipeline"
          data-test-subj="pipelineCombobox"
          singleSelection={{ asPlainText: true }}
          options={pipelines}
          selectedOptions={selectedPipelines}
          onChange={onSelectedPipelinesChange}
        />
      </CustomFormRow>
    </div>
  );
};

export default ReindexAdvancedOptions;
