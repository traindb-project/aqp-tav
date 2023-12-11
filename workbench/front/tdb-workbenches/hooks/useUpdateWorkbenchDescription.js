// Updated by wgkim 2023-04-26 : query -> workbench 변경
import { useCallback } from "react";
import useUpdateWorkbench from "./useUpdateWorkbench";
import recordEvent from "@/services/recordEvent";

export default function useUpdateWorkbenchDescription(workbench, onChange) {
  const updateWorkbench = useUpdateWorkbench(workbench, onChange);

  return useCallback(
    description => {
      recordEvent("edit_description", "workbench", workbench.id);
      updateWorkbench({ description });
    },
    [workbench.id, updateWorkbench]
  );
}
