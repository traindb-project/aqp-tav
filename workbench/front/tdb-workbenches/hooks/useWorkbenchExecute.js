// Updated by wgkim 2023-04-26 : query -> workbench 변경
import { useReducer, useEffect, useRef } from "react";
import location from "@/services/location";
import recordEvent from "@/services/recordEvent";
import { ExecutionStatus } from "@/services/workbench-result";
import notifications from "@/services/notifications";
import useImmutableCallback from "@/lib/hooks/useImmutableCallback";

function getMaxAge() {
  const { maxAge } = location.search;
  return maxAge !== undefined ? maxAge : -1;
}

const reducer = (prevState, updatedProperty) => ({
  ...prevState,
  ...updatedProperty,
});

// This is currently specific to a Workbench page, we can refactor
// it slightly to make it suitable for dashboard widgets instead of the other solution it
// has in there.
export default function useWorkbenchExecute(workbench) {
  const [executionState, setExecutionState] = useReducer(reducer, {
    workbenchResult: null,
    isExecuting: false,
    loadedInitialResults: false,
    executionStatus: null,
    isCancelling: false,
    cancelCallback: null,
    error: null,
  });

  const workbenchResultInExecution = useRef(null);
  // Clear executing workbenchResult when component is unmounted to avoid errors
  useEffect(() => {
    return () => {
      workbenchResultInExecution.current = null;
    };
  }, []);

  const executeWorkbench = useImmutableCallback((maxAge = 0, workbenchExecutor) => {
    let newWorkbenchResult;

    if (workbenchExecutor) {
      newWorkbenchResult = workbenchExecutor();
    } else {
      newWorkbenchResult = workbench.getWorkbenchResult(maxAge);
    }

    recordEvent("execute", "workbench", workbench.id);
    notifications.getPermissions();

    workbenchResultInExecution.current = newWorkbenchResult;

    setExecutionState({
      updatedAt: newWorkbenchResult.getUpdatedAt(),
      executionStatus: newWorkbenchResult.getStatus(),
      isExecuting: true,
      cancelCallback: () => {
        recordEvent("cancel_execute", "workbench", workbench.id);
        setExecutionState({ isCancelling: true });
        newWorkbenchResult.cancelExecution();
      },
    });

    const onStatusChange = status => {
      if (workbenchResultInExecution.current === newWorkbenchResult) {
        setExecutionState({ updatedAt: newWorkbenchResult.getUpdatedAt(), executionStatus: status });
      }
    };

    newWorkbenchResult
      .toPromise(onStatusChange)
      .then(workbenchResult => {
        // Updated by wgkim 2023-05-03 : 잡을 사용하지 않고 바로 결과 렌더링

        if (workbenchResultInExecution.current === newWorkbenchResult) {
          // TODO: this should probably belong in the WorkbenchEditor page.
          if (workbenchResult && workbenchResult.workbench_query_result.query === workbench.query) {
            workbench.latest_workbench_data_id = workbenchResult.getId();
            workbench.workbenchResult = workbenchResult;
          }

          if (executionState.loadedInitialResults) {
            notifications.showNotification("Redash", `${workbench.name} updated.`);
          }

          setExecutionState({
            workbenchResult: workbenchResult,
            loadedInitialResults: true,
            error: null,
            isExecuting: false,
            isCancelling: false,
            executionStatus: null,
          });
        }
      })
      .catch(workbenchResult => {
        if (workbenchResultInExecution.current === newWorkbenchResult) {
          if (executionState.loadedInitialResults) {
            notifications.showNotification("Redash", `${workbench.name} failed to run: ${workbenchResult.getError()}`);
          }

          setExecutionState({
            workbenchResult: workbenchResult,
            loadedInitialResults: true,
            error: workbenchResult.getError(),
            isExecuting: false,
            isCancelling: false,
            executionStatus: ExecutionStatus.FAILED,
          });
        }
      });
  });

  const workbenchRef = useRef(workbench);
  workbenchRef.current = workbench;

  useEffect(() => {
    // TODO: this belongs on the workbench page?
    // loadedInitialResults can be removed if so
    if (workbenchRef.current.hasResult() || workbenchRef.current.paramsRequired()) {
      executeWorkbench(getMaxAge());
    } else {
      setExecutionState({ loadedInitialResults: true });
    }
  }, [executeWorkbench]);

  return { ...executionState, ...{ executeWorkbench: executeWorkbench } };
}
