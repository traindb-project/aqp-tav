// Updated by wgkim 2023-04-25 : query -> workbench 변경
import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import LoadingState from "@/components/items-list/components/LoadingState";
import { Workbench } from "@/services/workbench";
import useImmutableCallback from "@/lib/hooks/useImmutableCallback";

export default function wrapWorkbenchPage(WrappedComponent) {
  function WorkbenchPageWrapper({ workbenchId, onError, ...props }) {
    const [workbench, setWorkbench] = useState(null);

    const handleError = useImmutableCallback(onError);

    useEffect(() => {
      let isCancelled = false;
      const promise = workbenchId ? Workbench.get({ id: workbenchId }) : Promise.resolve(Workbench.newWorkbench());
      promise
        .then(result => {
          if (!isCancelled) {
            setWorkbench(result);
          }
        })
        .catch(handleError);

      return () => {
        isCancelled = true;
      };
    }, [workbenchId, handleError]);

    if (!workbench) {
      return <LoadingState className="flex-fill" />;
    }

    return <WrappedComponent workbench={workbench} onError={onError} {...props} />;
  }

  WorkbenchPageWrapper.propTypes = {
    workbenchId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  };

  WorkbenchPageWrapper.defaultProps = {
    workbenchId: null,
  };

  return WorkbenchPageWrapper;
}
