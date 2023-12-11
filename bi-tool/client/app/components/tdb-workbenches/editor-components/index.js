// Updated by wgkim 2023-04-26 : query -> workbench 변경
import SchemaBrowser from "@/components/tdb-workbenches/SchemaBrowser";
import WorkbenchEditor from "@/components/tdb-workbenches/WorkbenchEditor";
import DatabricksSchemaBrowser from "./databricks/DatabricksSchemaBrowser";

import { registerEditorComponent, getEditorComponents, WorkbenchEditorComponents } from "./editorComponents";

// default
registerEditorComponent(WorkbenchEditorComponents.SCHEMA_BROWSER, SchemaBrowser);
registerEditorComponent(WorkbenchEditorComponents.WORKBENCH_EDITOR, WorkbenchEditor);

// databricks
registerEditorComponent(WorkbenchEditorComponents.SCHEMA_BROWSER, DatabricksSchemaBrowser, [
  "databricks",
  "databricks_internal",
]);

export { getEditorComponents };
