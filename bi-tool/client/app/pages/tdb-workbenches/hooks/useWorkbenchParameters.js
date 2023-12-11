// Updated by wgkim 2023-04-26 : query -> workbench 변경
import { isUndefined } from "lodash";
import { useEffect, useMemo, useState, useCallback } from "react";

export default function useWorkbenchParameters(workbench) {
  const parameters = useMemo(() => workbench.getParametersDefs(), [workbench]);
  const [dirtyFlag, setDirtyFlag] = useState(workbench.getParameters().hasPendingValues());

  const updateDirtyFlag = useCallback(
    flag => {
      flag = isUndefined(flag) ? workbench.getParameters().hasPendingValues() : flag;
      setDirtyFlag(flag);
    },
    [workbench]
  );

  useEffect(() => {
    const updatedDirtyParameters = workbench.getParameters().hasPendingValues();
    if (updatedDirtyParameters !== dirtyFlag) {
      setDirtyFlag(updatedDirtyParameters);
    }
  }, [workbench, parameters, dirtyFlag]);

  return useMemo(() => [parameters, dirtyFlag, updateDirtyFlag], [parameters, dirtyFlag, updateDirtyFlag]);
}
