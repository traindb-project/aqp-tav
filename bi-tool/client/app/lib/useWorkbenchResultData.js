// Created by wgkim 2023-04-25 : query -> workbench 변경
import { useMemo } from "react";
import { get, invoke } from "lodash";

function getWorkbenchResultData(workbenchResult, workbenchResultStatus = null) {
  return {
    status: workbenchResultStatus || invoke(workbenchResult, "getStatus") || null,
    columns: invoke(workbenchResult, "getColumns") || [],
    rows: invoke(workbenchResult, "getData") || [],
    filters: invoke(workbenchResult, "getFilters") || [],
    updatedAt: invoke(workbenchResult, "getUpdatedAt") || null,
    retrievedAt: get(workbenchResult, "workbench_query_result.retrieved_at", null),
    truncated: invoke(workbenchResult, "getTruncated") || null,
    log: invoke(workbenchResult, "getLog") || [],
    error: invoke(workbenchResult, "getError") || null,
    runtime: invoke(workbenchResult, "getRuntime") || null,
    metadata: get(workbenchResult, "workbench_query_result.data.metadata", {}),
  };
}

export default function useWorkbenchResultData(workbenchResult) {
  // make sure it re-executes when workbenchResult status changes
  const workbenchResultStatus = invoke(workbenchResult, "getStatus");
  return useMemo(() => getWorkbenchResultData(workbenchResult, workbenchResultStatus), [workbenchResult, workbenchResultStatus]);
}
