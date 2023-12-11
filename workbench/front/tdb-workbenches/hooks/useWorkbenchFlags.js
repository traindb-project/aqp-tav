// Updated by wgkim 2023-04-26 : query -> workbench 변경
import { isNil, isEmpty } from "lodash";
import { useMemo } from "react";
import { currentUser } from "@/services/auth";
import { policy } from "@/services/policy";

export default function useWorkbenchFlags(workbench, dataSource = null) {
  dataSource = dataSource || { view_only: true };

  return useMemo(
    () => ({
      // state flags
      isNew: isNil(workbench.id),
      isDraft: workbench.is_draft,
      isArchived: workbench.is_archived,

      // TODO wgkim 2023-04-26 : 권한을 하드코딩이 아닌 유저별 권한을 얻기로 변경해야함
      // permissions flags
      // canCreate: currentUser.hasPermission("create_workbench"),
      // canView: currentUser.hasPermission("view_workbench"),
      // canEdit: currentUser.hasPermission("edit_workbench") && policy.canEdit(workbench),
      // canViewSource: currentUser.hasPermission("view_source"),
      canCreate: true,
      canView: true,
      canEdit: true,
      canViewSource: true,
      // Updated by wgkim 2023-04-27 : 실행버튼 활성화를 위한 작업
      // canExecute:
      //   !isEmpty(workbench.workbench) &&
      //   policy.canRun(workbench) &&
      //   (workbench.is_safe || (currentUser.hasPermission("execute_workbench") && !dataSource.view_only)),
      canExecute:
        !isEmpty(workbench.query) &&
        policy.canRun(workbench) &&
        (workbench.is_safe || !dataSource.view_only),
      canFork: currentUser.hasPermission("edit_workbench") && !dataSource.view_only,
      canSchedule: currentUser.hasPermission("schedule_workbench"),
    }),
    [workbench, dataSource.view_only]
  );
}
