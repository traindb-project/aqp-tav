// Updated by wgkim 2023-04-25 : query -> workbench 변경
import React from "react";
import PropTypes from "prop-types";
import WarningTwoTone from "@ant-design/icons/WarningTwoTone";
import TimeAgo from "@/components/TimeAgo";
import Tooltip from "@/components/Tooltip";
import useAddToDashboardDialog from "../hooks/useAddToDashboardDialog";
import useEmbedDialog from "../hooks/useEmbedDialog";
import WorkbenchControlDropdown from "@/components/EditVisualizationButton/WorkbenchControlDropdown";
import EditVisualizationButton from "@/components/EditVisualizationButton";
import useWorkbenchResultData from "@/lib/useWorkbenchResultData";
import { durationHumanize, pluralize, prettySize } from "@/lib/utils";

import "./WorkbenchExecutionMetadata.less";

export default function WorkbenchExecutionMetadata({
  workbench,
  workbenchResult,
  isWorkbenchExecuting,
  selectedVisualization,
  showEditVisualizationButton,
  onEditVisualization,
  extraActions,
}) {
  const workbenchResultData = useWorkbenchResultData(workbenchResult);
  const openAddToDashboardDialog = useAddToDashboardDialog(workbench);
  const openEmbedDialog = useEmbedDialog(workbench);
  return (
    <div className="workbench-execution-metadata">
      <span className="m-r-5">
        <WorkbenchControlDropdown
          workbench={workbench}
          workbenchResult={workbenchResult}
          workbenchExecuting={isWorkbenchExecuting}
          showEmbedDialog={openEmbedDialog}
          embed={false}
          apiKey={workbench.api_key}
          selectedTab={selectedVisualization}
          openAddToDashboardForm={openAddToDashboardDialog}
        />
      </span>
      {extraActions}
      {showEditVisualizationButton && (
        <EditVisualizationButton openVisualizationEditor={onEditVisualization} selectedTab={selectedVisualization} />
      )}
      <span className="m-l-5 m-r-10">
        <span>
          {workbenchResultData.truncated === true && (
            <span className="m-r-5">
              <Tooltip
                title={
                  "Result truncated to " +
                  workbenchResultData.rows.length +
                  " rows. Databricks may truncate workbench results that are unstably large."
                }>
                <WarningTwoTone twoToneColor="#FF9800" />
              </Tooltip>
            </span>
          )}
          <strong>{workbenchResultData.rows.length}</strong> {pluralize("row", workbenchResultData.rows.length)}
        </span>
        <span className="m-l-5">
          {!isWorkbenchExecuting && (
            <React.Fragment>
              <strong>{durationHumanize(workbenchResultData.runtime)}</strong>
              <span className="hidden-xs"> runtime</span>
            </React.Fragment>
          )}
          {isWorkbenchExecuting && <span>Running&hellip;</span>}
        </span>
        {workbenchResultData.metadata.data_scanned && (
          <span className="m-l-5">
            Data Scanned
            <strong>{prettySize(workbenchResultData.metadata.data_scanned)}</strong>
          </span>
        )}
      </span>
      <div>
        <span className="m-r-10">
          <span className="hidden-xs">Refreshed </span>
          <strong>
            <TimeAgo date={workbenchResultData.retrievedAt} placeholder="-" />
          </strong>
        </span>
      </div>
    </div>
  );
}

WorkbenchExecutionMetadata.propTypes = {
  workbench: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  workbenchResult: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  isWorkbenchExecuting: PropTypes.bool,
  selectedVisualization: PropTypes.number,
  showEditVisualizationButton: PropTypes.bool,
  onEditVisualization: PropTypes.func,
  extraActions: PropTypes.node,
};

WorkbenchExecutionMetadata.defaultProps = {
  isWorkbenchExecuting: false,
  selectedVisualization: null,
  showEditVisualizationButton: false,
  onEditVisualization: () => {},
  extraActions: null,
};
