// Updated by wgkim 2023-04-26 : query -> workbench 변경
import { isEmpty } from "lodash";
import { useState, useMemo } from "react";
import useUpdateWorkbench from "./useUpdateWorkbench";
import navigateTo from "@/components/ApplicationArea/navigateTo";

export default function useWorkbench(originalWorkbench) {
  const [workbench, setWorkbench] = useState(originalWorkbench);
  const [originalWorkbenchSource, setOriginalWorkbenchSource] = useState(originalWorkbench.workbench);
  const [originalAutoLimit, setOriginalAutoLimit] = useState(workbench.options.apply_auto_limit);

  const updateWorkbench = useUpdateWorkbench(workbench, updatedWorkbench => {
    // It's important to update URL first, and only then update state
    if (updatedWorkbench.id !== workbench.id) {
      // Don't reload page when saving new model
      navigateTo(updatedWorkbench.getUrl(true), true);
    }
    setWorkbench(updatedWorkbench);
    setOriginalWorkbenchSource(updatedWorkbench.workbench);
    setOriginalAutoLimit(updatedWorkbench.options.apply_auto_limit);
  });

  // Updated by wgkim 2023-05-04 : workbench -> query
  return useMemo(
    () => ({
      workbench: workbench,
      setWorkbench: setWorkbench,
      isDirty:
        workbench.query !== originalWorkbenchSource ||
        (!isEmpty(workbench.query) && workbench.options.apply_auto_limit !== originalAutoLimit),
      saveWorkbench: () => updateWorkbench(),
    }),
    [workbench, originalWorkbenchSource, updateWorkbench, originalAutoLimit]
  );
}
