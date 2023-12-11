// Updated by wgkim 2023-04-26 : query -> workbench 변경
import { extend, filter, find } from "lodash";
import { useCallback } from "react";
import EditVisualizationDialog from "@/components/visualizations/EditVisualizationDialog";
import useImmutableCallback from "@/lib/hooks/useImmutableCallback";

export default function useEditVisualizationDialog(workbench, workbenchResult, onChange) {
  const handleChange = useImmutableCallback(onChange);

  return useCallback(
    (visualizationId = null) => {
      const visualization = find(workbench.visualizations, { id: visualizationId }) || null;
      EditVisualizationDialog.showModal({
        workbench: workbench,
        visualization,
        workbenchResult: workbenchResult,
      }).onClose(updatedVisualization => {
        const filteredVisualizations = filter(workbench.visualizations, v => v.id !== updatedVisualization.id);
        handleChange(
          extend(workbench.clone(), { visualizations: [...filteredVisualizations, updatedVisualization] }),
          updatedVisualization
        );
      });
    },
    [workbench, workbenchResult, handleChange]
  );
}
