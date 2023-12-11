// Updated by wgkim 2023-04-26 : query -> workbench 변경
import { useCallback } from "react";
import PermissionsEditorDialog from "@/components/PermissionsEditorDialog";

export default function usePermissionsEditorDialog(workbench) {
  return useCallback(() => {
    PermissionsEditorDialog.showModal({
      aclUrl: `api/workbenches/${workbench.id}/acl`,
      context: "workbench",
      author: workbench.user,
    });
  }, [workbench.id, workbench.user]);
}
