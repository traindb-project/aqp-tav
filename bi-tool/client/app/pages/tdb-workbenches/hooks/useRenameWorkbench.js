// Updated by wgkim 2023-04-25 : query -> workbench 변경
import { useCallback } from "react";
import useUpdateWorkbench from "./useUpdateWorkbench";
import recordEvent from "@/services/recordEvent";
import { clientConfig } from "@/services/auth";

export default function useRenameWorkbench(workbench, onChange) {
  const updateWorkbench = useUpdateWorkbench(workbench, onChange);

  return useCallback(
    name => {
      recordEvent("edit_name", "workbench", workbench.id);
      const changes = { name };
      const options = {};

      if (workbench.is_draft && clientConfig.autoPublishNamedWorkbenches && name !== "New_Model") {
        changes.is_draft = false;
        options.successMessage = "Model saved and published";
      }

      updateWorkbench(changes, options);
    },
    [workbench.id, workbench.is_draft, updateWorkbench]
  );
}
