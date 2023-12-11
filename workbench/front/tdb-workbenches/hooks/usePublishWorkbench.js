// Updated by wgkim 2023-04-25 : query -> workbench 변경
import { useCallback } from "react";
import useUpdateWorkbench from "./useUpdateWorkbench";
import recordEvent from "@/services/recordEvent";

export default function usePublishWorkbench(workbench, onChange) {
  const updateWorkbench = useUpdateWorkbench(workbench, onChange);

  return useCallback(() => {
    recordEvent("toggle_published", "workbench", workbench.id);
    updateWorkbench({ is_draft: false });
  }, [workbench.id, updateWorkbench]);
}
