// Updated by wgkim 2023-04-26 : query -> workbench 변경
import { trim } from "lodash";
import sqlFormatter from "sql-formatter";

interface WorkbenchFormatterMap {
  [syntax: string]: (workbenchText: string) => string;
}

const WorkbenchFormatters: WorkbenchFormatterMap = {
  sql: workbenchText => sqlFormatter.format(trim(workbenchText)),
  json: workbenchText => JSON.stringify(JSON.parse(workbenchText), null, 4),
};

export function isFormatWorkbenchAvailable(syntax: string) {
  return syntax in WorkbenchFormatters;
}

export function formatWorkbench(workbenchText: string, syntax: string) {
  if (!isFormatWorkbenchAvailable(syntax)) {
    return workbenchText;
  }
  const formatter = WorkbenchFormatters[syntax];
  return formatter(workbenchText);
}
