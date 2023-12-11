// Updated by wgkim 2023-04-26 : query -> workbench 변경
import { map } from "lodash";
import { useCallback } from "react";
import EditParameterSettingsDialog from "@/components/EditParameterSettingsDialog";
import useImmutableCallback from "@/lib/hooks/useImmutableCallback";

export default function useAddNewParameterDialog(workbench, onParameterAdded) {
  const handleParameterAdded = useImmutableCallback(onParameterAdded);

  return useCallback(() => {
    EditParameterSettingsDialog.showModal({
      parameter: {
        title: null,
        name: "",
        type: "text",
        value: null,
      },
      existingParams: map(workbench.getParameters().get(), p => p.name),
    }).onClose(param => {
      const newWorkbench = workbench.clone();
      param = newWorkbench.getParameters().add(param);
      handleParameterAdded(newWorkbench, param);
    });
  }, [workbench, handleParameterAdded]);
}
