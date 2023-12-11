// Updated by wgkim 2023-04-26 : query -> workbench 변경
import { extend, filter } from "lodash";
import { useCallback } from "react";
import Visualization from "@/services/visualization";
import notification from "@/services/notification";
import useImmutableCallback from "@/lib/hooks/useImmutableCallback";

export default function useDeleteVisualization(workbench, onChange) {
  const handleChange = useImmutableCallback(onChange);

  return useCallback(
    visualizationId =>
      Visualization.delete({ id: visualizationId })
        .then(() => {
          const filteredVisualizations = filter(workbench.visualizations, v => v.id !== visualizationId);
          handleChange(extend(workbench.clone(), { visualizations: filteredVisualizations }));
        })
        .catch(() => {
          notification.error("Error deleting visualization.", "Maybe it's used in a dashboard?");
        }),
    [workbench, handleChange]
  );
}
