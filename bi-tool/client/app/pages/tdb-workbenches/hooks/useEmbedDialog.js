// Updated by wgkim 2023-04-26 : query -> workbench 변경
import { find } from "lodash";
import { useCallback } from "react";
import EmbedWorkbenchDialog from "@/components/tdb-workbenches/EmbedWorkbenchDialog";

export default function useEmbedDialog(workbench) {
  return useCallback(
    (unusedWorkbench, visualizationId) => {
      const visualization = find(workbench.visualizations, { id: visualizationId });
      EmbedWorkbenchDialog.showModal({ workbench: workbench, visualization });
    },
    [workbench]
  );
}
