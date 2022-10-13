/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { forwardRef, useCallback, useImperativeHandle, useMemo, useState, Ref, useEffect, useRef } from "react";
import {
  EuiTreeView,
  EuiIcon,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  EuiFieldText,
  EuiSelect,
  EuiTreeViewProps,
  EuiButton,
  EuiSpacer,
  EuiLink,
  EuiButtonGroup,
} from "@elastic/eui";
import { set, get, unset } from "lodash";
import { ContentPanel } from "../../../../components/ContentPanel";
import JSONEditor from "../../../../components/JSONEditor";
import AliasSelect from "../../containers/AliasSelect";
import { IndexItem, MappingsProperties } from "../../../../../models/interfaces";
import { INDEX_DYNAMIC_SETTINGS, INDEX_MAPPING_TYPES, INDEX_MAPPING_TYPES_WITH_CHILDREN } from "../../../../utils/constants";
import "./IndexMapping.scss";

export interface IndexMappingProps {
  value?: MappingsProperties;
  oldValue?: MappingsProperties;
  onChange: (value: IndexMappingProps["value"]) => void;
  isEdit?: boolean;
}

export interface IIndexDetailRef {
  validate: () => Promise<Boolean>;
}

export enum EDITOR_MODE {
  JSON = "JSON",
  VISUAL = "VISUAL",
}

interface IMappingLabel {
  value: MappingsProperties;
  onChange: (val: IMappingLabel["value"]) => void;
  onFieldNameChange: (newFieldName: string, oldFieldName: string) => void;
  onAddSubField: () => void;
  disabled?: boolean;
}

const NEW_FIELD_PREFIX = "NAME_YOUR_FIELD";

const MappingLabel = ({ value, onChange, onFieldNameChange, disabled, onAddSubField }: IMappingLabel) => {
  const [fieldName, fieldSettings] = Object.entries(value || {})[0];
  const [fieldNameError, setFieldNameError] = useState("");
  const ref = useRef<any>(null);
  const type = fieldSettings.type ? fieldSettings.type : "object";
  const onFieldChange = useCallback(
    (k, v) => {
      const newValue = { ...value };
      set(newValue, `${fieldName}.${k}`, v);
      onChange(newValue);
    },
    [value, onChange]
  );
  const [fieldNameState, setFieldNameState] = useState(fieldName);
  useEffect(() => {
    setFieldNameState(fieldNameState);
  }, [fieldName]);
  useEffect(() => {
    if (fieldNameState) {
      setFieldNameError("");
    }
  }, [fieldNameState]);
  return (
    <EuiFlexGroup onClick={(e) => e.stopPropagation()}>
      <EuiFlexItem style={{ width: 240 }} grow={false}>
        <EuiFormRow isInvalid={!!fieldNameError} error={fieldNameError} label="Field name" display="rowCompressed">
          <>
            <EuiFieldText
              inputRef={ref}
              disabled={disabled}
              compressed
              value={fieldNameState}
              onChange={(e) => setFieldNameState(e.target.value)}
              onFocus={() => {
                if (fieldNameState && fieldNameState.startsWith(NEW_FIELD_PREFIX)) {
                  setFieldNameState("");
                }
              }}
              onBlur={(e) => {
                if (!fieldNameState) {
                  setFieldNameError("Field name is required, please input");
                  e.target.focus();
                } else {
                  onFieldNameChange(fieldNameState, fieldName);
                }
              }}
            />
          </>
        </EuiFormRow>
      </EuiFlexItem>
      <EuiFlexItem grow={false}>
        <EuiFormRow label="Field type" display="rowCompressed">
          <EuiSelect
            disabled={disabled}
            compressed
            value={type}
            onChange={(e) => onFieldChange("type", e.target.value)}
            options={INDEX_MAPPING_TYPES.map((item) => ({ text: item.label, value: item.label }))}
          />
        </EuiFormRow>
      </EuiFlexItem>
      {INDEX_MAPPING_TYPES_WITH_CHILDREN.includes(type) ? (
        <EuiFlexItem grow={false}>
          <EuiFormRow label="Extra parameters" display="rowCompressed">
            <span
              className="euiLink euiLink--primary"
              style={{ display: "flex", height: 32, alignItems: "center" }}
              onClick={(e) => {
                e.stopPropagation();
                onAddSubField();
              }}
            >
              Add a sub field
            </span>
          </EuiFormRow>
        </EuiFlexItem>
      ) : null}
    </EuiFlexGroup>
  );
};

const IndexMapping = ({ value, onChange, isEdit, oldValue }: IndexMappingProps, ref: Ref<IIndexDetailRef>) => {
  const treeRef = useRef<EuiTreeView>(null);
  const [editorMode, setEditorMode] = useState<EDITOR_MODE>(EDITOR_MODE.VISUAL);
  const addField = useCallback(
    (path) => {
      const newValue = { ...value };
      set(newValue, path, {
        type: "text",
      });
      onChange(newValue);
    },
    [onChange, value]
  );
  const transformValueToTreeItems = (formValue: IndexMappingProps["value"], pos: string = ""): EuiTreeViewProps["items"] => {
    return Object.entries(formValue || {}).map(([fieldName, fieldSettings]) => {
      const id = [pos, fieldName].filter((item) => item).join(".properties.");
      const payload: EuiTreeViewProps["items"][number] = {
        label: (
          <MappingLabel
            disabled={isEdit && !!get(oldValue, id)}
            value={{ [fieldName]: fieldSettings }}
            onChange={(val) => {
              const newValue = { ...value };
              const newFieldSettings = get(val, fieldName);
              set(newValue, id, newFieldSettings);
              if (INDEX_MAPPING_TYPES_WITH_CHILDREN.includes(newFieldSettings.type)) {
                unset(newValue, [id, "type"].join("."));
              }
              onChange(newValue);
            }}
            onFieldNameChange={(newFieldName) => {
              const newValue = { ...value };
              const oldFieldSettings = get(value, id);
              set(newValue, [pos, newFieldName].filter((item) => item).join("."), oldFieldSettings);
              unset(newValue, id);
              onChange(newValue);
            }}
            onAddSubField={() => {
              addField([id, "properties", `${NEW_FIELD_PREFIX}-${Date.now()}`].join("."));
            }}
          />
        ),
        id,
        icon: <EuiIcon type="arrowRight" style={{ visibility: "hidden" }} />,
        iconWhenExpanded: <EuiIcon type="arrowDown" style={{ visibility: "hidden" }} />,
      };
      if (fieldSettings.properties) {
        (payload.icon = <EuiIcon type="arrowRight" />),
          (payload.iconWhenExpanded = <EuiIcon type="arrowDown" />),
          (payload.children = transformValueToTreeItems(fieldSettings.properties, id));
      }

      return payload;
    });
  };
  const transformedTreeItems = transformValueToTreeItems(value);
  return (
    <>
      <EuiSpacer />
      <EuiButtonGroup
        type="single"
        idSelected={editorMode as string}
        onChange={(id) => setEditorMode(id as EDITOR_MODE)}
        legend="Editor Type"
        options={[
          {
            label: "Visual Editor",
            id: EDITOR_MODE.VISUAL,
          },
          {
            label: "JSON Editor",
            id: EDITOR_MODE.JSON,
          },
        ]}
      />
      <EuiSpacer />
      {editorMode === EDITOR_MODE.VISUAL ? (
        <>
          {transformedTreeItems.length ? (
            <EuiTreeView
              key={JSON.stringify(value)}
              ref={treeRef}
              expandByDefault
              className="index-mapping-tree"
              aria-labelledby="label"
              items={transformValueToTreeItems(value)}
            />
          ) : (
            <p>You have no field mappings.</p>
          )}
          <EuiSpacer />
          <EuiButton onClick={() => addField(`${NEW_FIELD_PREFIX}-${Date.now()}`)}>Add a field</EuiButton>
        </>
      ) : (
        <JSONEditor value={JSON.stringify(value || {}, null, 2)} onChange={(val) => onChange(JSON.parse(val))} />
      )}
    </>
  );
};

// @ts-ignore
export default forwardRef(IndexMapping);
