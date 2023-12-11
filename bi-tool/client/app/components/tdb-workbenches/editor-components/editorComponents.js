// Updated by wgkim 2023-04-26 : query -> workbench 변경
import { isArray, isNil, each } from "lodash";

const componentsRegistry = new Map();

export const WorkbenchEditorComponents = {
  SCHEMA_BROWSER: "SchemaBrowser",
  WORKBENCH_EDITOR: "WorkbenchEditor",
};

export function registerEditorComponent(componentName, component, dataSourceTypes) {
  if (isNil(dataSourceTypes)) {
    dataSourceTypes = [null]; // use `null` entry for the default set of components
  }

  if (!isArray(dataSourceTypes)) {
    dataSourceTypes = [dataSourceTypes];
  }

  each(dataSourceTypes, dataSourceType => {
    componentsRegistry.set(dataSourceType, { ...componentsRegistry.get(dataSourceType), [componentName]: component });
  });
}

export function getEditorComponents(dataSourceType) {
  return { ...componentsRegistry.get(null), ...componentsRegistry.get(dataSourceType) };
}
