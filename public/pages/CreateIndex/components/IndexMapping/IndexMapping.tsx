/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { forwardRef, useCallback, useState, Ref, useRef, useMemo, useImperativeHandle } from "react";
import { EuiTreeView, EuiIcon, EuiTreeViewProps, EuiButton, EuiSpacer, EuiButtonGroup, EuiLink } from "@elastic/eui";
import { set, get, isEmpty } from "lodash";
import MonacoJSONEditor, { IJSONEditorRef } from "../../../../components/MonacoJSONEditor";
import { Modal } from "../../../../components/Modal";
import { MappingsProperties, MappingsPropertiesObject } from "../../../../../models/interfaces";
import CustomFormRow from "../../../../components/CustomFormRow";
import MappingLabel, { IMappingLabelRef } from "../MappingLabel";
import { INDEX_MAPPING_TYPES } from "../../../../utils/constants";
import "./IndexMapping.scss";

export const transformObjectToArray = (obj: MappingsPropertiesObject): MappingsProperties => {
  return Object.entries(obj).map(([fieldName, fieldSettings]) => {
    const { properties, ...others } = fieldSettings;
    const payload: MappingsProperties[number] = {
      ...others,
      fieldName,
    };
    if (properties) {
      payload.properties = transformObjectToArray(properties);
    }
    return payload;
  });
};

export const transformArrayToObject = (array: MappingsProperties): MappingsPropertiesObject => {
  return array.reduce((total, current) => {
    const { fieldName, properties, ...others } = current;
    const payload: MappingsPropertiesObject[string] = {
      ...others,
    };
    if (properties) {
      payload.properties = transformArrayToObject(properties);
    }
    return {
      ...total,
      [current.fieldName]: payload,
    };
  }, {} as MappingsPropertiesObject);
};

const countNodesInTree = (array: MappingsProperties) => {
  return array.reduce((total, current) => {
    total = total + 1;
    const { properties } = current;
    if (properties) {
      total = total + countNodesInTree(properties);
    }
    return total;
  }, 0);
};

export type IndexMappingsAll = {
  properties?: MappingsProperties;
  [key: string]: any;
};

export type IndexMappingsObjectAll = {
  properties?: MappingsPropertiesObject;
  [key: string]: any;
};

export interface IndexMappingProps {
  value?: IndexMappingsAll;
  oldValue?: IndexMappingsAll;
  originalValue?: IndexMappingsAll;
  onChange: (value: IndexMappingProps["value"]) => void;
  isEdit?: boolean;
  oldMappingsEditable?: boolean; // in template edit case, existing mappings is editable
  readonly?: boolean;
}

export enum EDITOR_MODE {
  JSON = "JSON",
  VISUAL = "VISUAL",
}

export interface IIndexMappingsRef {
  validate: () => Promise<string>;
}

const IndexMapping = (
  { value: propsValue, onChange: propsOnChange, isEdit, oldValue, readonly, oldMappingsEditable }: IndexMappingProps,
  ref: Ref<IIndexMappingsRef>
) => {
  const value = propsValue?.properties || [];
  const onChange = (val: MappingsProperties) => {
    propsOnChange({
      ...propsValue,
      properties: val,
    });
  };
  const allFieldsRef = useRef<Record<string, IMappingLabelRef>>({});
  const JSONEditorRef = useRef<IJSONEditorRef>(null);
  useImperativeHandle(ref, () => ({
    validate: async () => {
      const values = await Promise.all(Object.values(allFieldsRef.current).map((item) => item.validate()));
      const JSONEditorValidateResult = await JSONEditorRef.current?.validate();
      return values.some((item) => item) || JSONEditorValidateResult ? "with error" : "";
    },
  }));
  const [editorMode, setEditorMode] = useState<EDITOR_MODE>(EDITOR_MODE.VISUAL);
  const addField = useCallback(
    (pos, fieldSettings?: Partial<MappingsProperties[number]>) => {
      const newValue = [...(value || [])];
      const nowProperties = ((pos ? get(newValue, pos) : (newValue as MappingsProperties)) || []) as MappingsProperties;
      nowProperties.push({
        fieldName: fieldSettings?.fieldName || "",
        type: "text",
        ...fieldSettings,
      });
      if (pos) {
        set(newValue, pos, nowProperties);
      }
      onChange(newValue);
    },
    [onChange, value]
  );
  const deleteField = useCallback(
    (pos) => {
      const newValue = [...(value || [])];
      const splittedArray = pos.split(".");
      const index = splittedArray[splittedArray.length - 1];
      const prefix = splittedArray.slice(0, -1);
      const prefixPos = prefix.join(".");
      const nowProperties = ((prefixPos ? get(newValue, prefixPos) : (newValue as MappingsProperties)) || []) as MappingsProperties;
      nowProperties.splice(index, 1);

      if (prefixPos) {
        set(newValue, prefixPos, nowProperties);
      }

      onChange(newValue);
    },
    [onChange, value]
  );
  const transformValueToTreeItems = (formValue: MappingsProperties, pos: string = ""): EuiTreeViewProps["items"] => {
    let isFirstEditableField = false;
    return (formValue || []).map((item, index) => {
      const { fieldName, ...fieldSettings } = item;
      const id = [pos, index].filter((item) => item !== "").join(".properties.");
      const readonlyFlag = readonly || (isEdit && !!get(oldValue?.properties, id));
      let shouldShowLabel = false;
      if (!readonlyFlag && !isFirstEditableField) {
        isFirstEditableField = true;
        shouldShowLabel = true;
      }
      const payload: EuiTreeViewProps["items"][number] = {
        label: (
          <MappingLabel
            shouldShowLabel={shouldShowLabel}
            ref={(ref) => {
              if (ref) {
                allFieldsRef.current[id] = ref;
              } else {
                delete allFieldsRef.current[id];
              }
            }}
            readonly={readonlyFlag}
            value={item}
            id={`mapping-visual-editor-${id}`}
            onFieldNameCheck={(fieldName) => {
              const hasDuplicateName = (formValue || [])
                .filter((sibItem, sibIndex) => sibIndex < index)
                .some((sibItem) => sibItem.fieldName === fieldName);
              if (hasDuplicateName) {
                return `Duplicate field name [${fieldName}], please change your field name`;
              }

              return "";
            }}
            onChange={(val, key, v) => {
              const newValue = [...(value || [])];
              set(newValue, id, val);
              onChange(newValue);
            }}
            onDeleteField={() => {
              deleteField(id);
            }}
            onAddSubField={() => {
              addField(`${id}.properties`);
            }}
            onAddSubObject={() => {
              addField(`${id}.properties`, {
                type: "",
              });
            }}
          />
        ),
        id: `mapping-visual-editor-${id}`,
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
  const transformedTreeItems = useMemo(() => transformValueToTreeItems(value), [value]);
  const newValue = useMemo(() => {
    const oldValueKeys = (oldValue?.properties || []).map((item) => item.fieldName);
    return value?.filter((item) => !oldValueKeys.includes(item.fieldName)) || [];
  }, [oldValue?.properties, value]);
  const renderKey = useMemo(() => {
    return countNodesInTree(value || []);
  }, [value]);
  return (
    <>
      <EuiButtonGroup
        type="single"
        idSelected={editorMode as string}
        onChange={(id) => setEditorMode(id as EDITOR_MODE)}
        legend="Editor Type"
        options={[
          {
            label: readonly ? "Tree view" : "Visual Editor",
            id: EDITOR_MODE.VISUAL,
            "data-test-subj": "editorTypeVisualEditor",
          },
          {
            label: readonly ? "JSON" : "JSON Editor",
            id: EDITOR_MODE.JSON,
            "data-test-subj": "editorTypeJsonEditor",
          },
        ]}
      />
      <EuiSpacer />
      {editorMode === EDITOR_MODE.VISUAL ? (
        <>
          {transformedTreeItems.length ? (
            <EuiTreeView
              key={renderKey}
              expandByDefault={!readonly}
              className="index-mapping-tree"
              aria-labelledby="label"
              items={transformValueToTreeItems(value)}
            />
          ) : (
            <p>You have no field mappings.</p>
          )}
          {readonly ? null : (
            <>
              <EuiSpacer />
              <EuiButton style={{ marginRight: 8 }} data-test-subj="createIndexAddFieldButton" onClick={() => addField("")}>
                Add new field
              </EuiButton>
              <EuiButton
                data-test-subj="createIndexAddObjectFieldButton"
                onClick={() =>
                  addField("", {
                    type: "object",
                  })
                }
              >
                Add new object
              </EuiButton>
            </>
          )}
        </>
      ) : (
        <>
          {isEdit && !readonly && !isEmpty(oldValue) ? (
            <>
              <EuiButton
                size="s"
                data-test-subj="previousMappingsJsonButton"
                onClick={() => {
                  Modal.show({
                    style: {
                      width: "70vw",
                    },
                    title: "Previous mappings",
                    content: (
                      <MonacoJSONEditor
                        readOnly
                        value={JSON.stringify(
                          {
                            ...oldValue,
                            properties: transformArrayToObject(oldValue?.properties || []),
                          },
                          null,
                          2
                        )}
                      />
                    ),
                    "data-test-subj": "previousMappingsJsonModal",
                    onOk: () => {},
                  });
                }}
              >
                See previous settings
              </EuiButton>
              <EuiSpacer />
            </>
          ) : null}
          {readonly ? (
            <MonacoJSONEditor
              ref={JSONEditorRef}
              value={JSON.stringify(
                {
                  ...propsValue,
                  properties: transformArrayToObject(value || []),
                },
                null,
                2
              )}
              disabled={readonly}
              readOnly={readonly}
              width="100%"
            />
          ) : (
            <CustomFormRow
              data-test-subj="mappingsJsonEditorFormRow"
              label="Specify index mapping"
              helpText={
                <div>
                  <div>
                    Specify mapping in JSON format.{" "}
                    <EuiLink external target="_blank" href="https://opensearch.org/docs/latest/opensearch/mappings/#mapping-example-usage">
                      View mapping example.
                    </EuiLink>
                  </div>
                  {oldMappingsEditable ? null : (
                    <div>
                      {isEdit
                        ? "Mappings and field types cannot be changed once they have been added."
                        : "The existing mapping properties cannot be changed after the index is created."}
                    </div>
                  )}
                </div>
              }
              fullWidth
            >
              <MonacoJSONEditor
                value={JSON.stringify(
                  {
                    ...propsValue,
                    properties: transformArrayToObject(newValue || []),
                  },
                  null,
                  2
                )}
                onChange={(val) => {
                  const result: IndexMappingsObjectAll = JSON.parse(val);
                  propsOnChange({
                    ...result,
                    properties: [...(oldValue?.properties || []), ...transformObjectToArray(result?.properties || {})],
                  });
                }}
                path="inmemory://inmemory/index-settings.json"
                diagnosticsOptions={{
                  validate: true,
                  schemas: [
                    {
                      fileMatch: ["index-settings.json"],
                      schema: {
                        title: "Product",
                        description: "A product in the catalog",
                        type: "object",
                        properties: {
                          properties: {
                            $ref: "ISMIndexMappingProperties",
                          },
                        },
                        additionalProperties: false,
                      },
                      uri: "ISMIndexMappings",
                    },
                    {
                      schema: {
                        title: "Index mapping properties",
                        description: "Index mapping properties validation",
                        type: "object",
                        format: "123123",
                        patternProperties: {
                          ".*": {
                            type: "object",
                            allOf: INDEX_MAPPING_TYPES.map((item) => ({
                              if: {
                                properties: { type: { const: item.label } },
                              },
                              then: {
                                properties: {
                                  type: {
                                    description: "type for this field",
                                    enum: INDEX_MAPPING_TYPES.map((item) => item.label),
                                  },
                                  properties: {
                                    description: "properties for this field",
                                    $ref: "ISMIndexMappingProperties",
                                  },
                                  ...item.options?.fields?.reduce(
                                    (total, current) => ({
                                      ...total,
                                      [current.name as string]: {
                                        description: current.label,
                                        type: current.validateType,
                                      },
                                    }),
                                    {}
                                  ),
                                },
                                additionalProperties: false,
                                required: ["type", ...(item.options?.fields?.map((item) => item.name) || [])],
                              },
                            })),
                          },
                        },
                      },
                      uri: "ISMIndexMappingProperties",
                    },
                  ],
                }}
                width="100%"
                ref={JSONEditorRef}
              />
            </CustomFormRow>
          )}
        </>
      )}
    </>
  );
};

// @ts-ignore
export default forwardRef(IndexMapping);
