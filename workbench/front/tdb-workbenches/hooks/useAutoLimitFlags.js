// Updated by wgkim 2023-04-26 : query -> workbench 변경
import { useCallback, useState } from "react";
import localOptions from "@/lib/localOptions";
import { get, extend } from "lodash";

function isAutoLimitAvailable(dataSource) {
  return get(dataSource, "supports_auto_limit", false);
}

export default function useAutoLimitFlags(dataSource, workbench, setWorkbench) {
  const isAvailable = isAutoLimitAvailable(dataSource);
  const [isChecked, setIsChecked] = useState(workbench.options.apply_auto_limit);
  workbench.options.apply_auto_limit = isChecked;

  const setAutoLimit = useCallback(
    state => {
      setIsChecked(state);
      localOptions.set("applyAutoLimit", state);
      setWorkbench(extend(workbench.clone(), { options: { ...workbench.options, apply_auto_limit: state } }));
    },
    [workbench, setWorkbench]
  );

  return [isAvailable, isChecked, setAutoLimit];
}
