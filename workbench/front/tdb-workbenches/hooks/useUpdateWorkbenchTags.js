// Updated by wgkim 2023-04-25 : query -> workbench 변경
import { useCallback } from "react";
import useUpdateWorkbench from "./useUpdateWorkbench";
import recordEvent from "@/services/recordEvent";

export default function useUpdateWorkbenchTags(workbench, onChange) {
  const updateWorkbench = useUpdateWorkbench(workbench, onChange);

  return useCallback(
    tags => {
      recordEvent("edit_tags", "workbench", workbench.id);
      updateWorkbench({ tags });
    },
    [workbench.id, updateWorkbench]
  );
}
