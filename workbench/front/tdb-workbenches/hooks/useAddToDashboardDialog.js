// Updated by wgkim 2023-04-26 : query -> workbench 변경
import { find } from "lodash";
import { useCallback } from "react";
import AddToDashboardDialog from "@/components/tdb-workbenches/AddToDashboardDialog";

export default function useAddToDashboardDialog(workbench) {
  return useCallback(
    visualizationId => {
      const visualization = find(workbench.visualizations, { id: visualizationId });
      AddToDashboardDialog.showModal({ visualization });
    },
    [workbench.visualizations]
  );
}
