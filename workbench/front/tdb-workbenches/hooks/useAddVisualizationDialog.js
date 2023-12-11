// Updated by wgkim 2023-04-26 : query -> workbench 변경
import { useState, useCallback, useEffect } from "react";
import useWorkbenchFlags from "./useWorkbenchFlags";
import useEditVisualizationDialog from "./useEditVisualizationDialog";

export default function useAddVisualizationDialog(workbench, workbenchResult, saveWorkbench, onChange) {
  const workbenchFlags = useWorkbenchFlags(workbench);
  const editVisualization = useEditVisualizationDialog(workbench, workbenchResult, onChange);
  const [shouldOpenDialog, setShouldOpenDialog] = useState(false);

  useEffect(() => {
    if (!workbenchFlags.isNew && shouldOpenDialog) {
      setShouldOpenDialog(false);
      editVisualization();
    }
  }, [workbenchFlags.isNew, shouldOpenDialog, editVisualization]);

  return useCallback(() => {
    if (workbenchFlags.isNew) {
      setShouldOpenDialog(true);
      saveWorkbench();
    } else {
      editVisualization();
    }
  }, [workbenchFlags.isNew, saveWorkbench, editVisualization]);
}
