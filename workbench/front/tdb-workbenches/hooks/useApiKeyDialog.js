// Updated by wgkim 2023-04-26 : query -> workbench 변경
import { useCallback } from "react";
import ApiKeyDialog from "@/components/tdb-workbenches/ApiKeyDialog";
import useImmutableCallback from "@/lib/hooks/useImmutableCallback";

export default function useApiKeyDialog(workbench, onChange) {
  const handleChange = useImmutableCallback(onChange);

  return useCallback(() => {
    ApiKeyDialog.showModal({ workbench: workbench }).onClose(handleChange);
  }, [workbench, handleChange]);
}
