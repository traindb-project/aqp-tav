// Updated by wgkim 2023-04-26 : query -> workbench 변경
import { isArray, intersection } from "lodash";
import { useCallback } from "react";
import ScheduleDialog from "@/components/tdb-workbenches/ScheduleDialog";
import { clientConfig } from "@/services/auth";
import { policy } from "@/services/policy";
import useUpdateWorkbench from "./useUpdateWorkbench";
import useWorkbenchFlags from "./useWorkbenchFlags";
import recordEvent from "@/services/recordEvent";

export default function useEditScheduleDialog(workbench, onChange) {
  // We won't use flags that depend on data source
  const workbenchFlags = useWorkbenchFlags(workbench);

  const updateWorkbench = useUpdateWorkbench(workbench, onChange);

  return useCallback(() => {
    if (!workbenchFlags.canEdit || !workbenchFlags.canSchedule) {
      return;
    }

    const intervals = clientConfig.workbenchRefreshIntervals;
    const allowedIntervals = policy.getQueryRefreshIntervals();
    const refreshOptions = isArray(allowedIntervals) ? intersection(intervals, allowedIntervals) : intervals;

    ScheduleDialog.showModal({
      schedule: workbench.schedule,
      refreshOptions,
    }).onClose(schedule => {
      recordEvent("edit_schedule", "workbench", workbench.id);
      updateWorkbench({ schedule });
    });
  }, [workbench.id, workbench.schedule, workbenchFlags.canEdit, workbenchFlags.canSchedule, updateWorkbench]);
}
