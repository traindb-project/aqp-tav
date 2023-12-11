// Updated by wgkim 2023-04-25 : query -> workbench 변경
import { includes } from "lodash";
import React from "react";
import PropTypes from "prop-types";
import Alert from "antd/lib/alert";
import Button from "antd/lib/button";
import Timer from "@/components/Timer";

export default function WorkbenchExecutionStatus({ status, updatedAt, error, isCancelling, onCancel }) {
  const alertType = status === "failed" ? "error" : "info";
  const showTimer = status !== "failed" && updatedAt;
  const isCancelButtonAvailable = includes(["waiting", "processing"], status);
  let message = isCancelling ? <React.Fragment>Cancelling&hellip;</React.Fragment> : null;

  switch (status) {
    case "waiting":
      if (!isCancelling) {
        message = <React.Fragment>Workbench in queue&hellip;</React.Fragment>;
      }
      break;
    case "processing":
      if (!isCancelling) {
        message = <React.Fragment>Executing Workbench&hellip;</React.Fragment>;
      }
      break;
    case "loading-result":
      message = <React.Fragment>Loading results&hellip;</React.Fragment>;
      break;
    case "failed":
      message = (
        <React.Fragment>
          Error running workbench: <strong>{error}</strong>
        </React.Fragment>
      );
      break;
    // no default
  }

  return (
    <Alert
      data-test="WorkbenchExecutionStatus"
      type={alertType}
      message={
        <div className="d-flex align-items-center">
          <div className="flex-fill p-t-5 p-b-5">
            {message} {showTimer && <Timer from={updatedAt} />}
          </div>
          <div>
            {isCancelButtonAvailable && (
              <Button className="m-l-10" type="primary" size="small" disabled={isCancelling} onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
        </div>
      }
    />
  );
}

WorkbenchExecutionStatus.propTypes = {
  status: PropTypes.string,
  updatedAt: PropTypes.any,
  error: PropTypes.string,
  isCancelling: PropTypes.bool,
  onCancel: PropTypes.func,
};

WorkbenchExecutionStatus.defaultProps = {
  status: "waiting",
  updatedAt: null,
  error: null,
  isCancelling: true,
  onCancel: () => {},
};
