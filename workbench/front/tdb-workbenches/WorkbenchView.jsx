// Updated by wgkim 2023-04-25 : query -> workbench 변경
import React, { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import cx from "classnames";
import useMedia from "use-media";
import Button from "antd/lib/button";

import FullscreenOutlinedIcon from "@ant-design/icons/FullscreenOutlined";
import FullscreenExitOutlinedIcon from "@ant-design/icons/FullscreenExitOutlined";

import routeWithUserSession from "@/components/ApplicationArea/routeWithUserSession";
import EditInPlace from "@/components/EditInPlace";
import Parameters from "@/components/Parameters";
import DynamicComponent from "@/components/DynamicComponent";
import PlainButton from "@/components/PlainButton";

import DataSource from "@/services/data-source";
import { ExecutionStatus } from "@/services/workbench-result";
import routes from "@/services/routes";
import { policy } from "@/services/policy";

import useWorkbenchResultData from "@/lib/useWorkbenchResultData";

import WorkbenchPageHeader from "./components/WorkbenchPageHeader";
import WorkbenchVisualizationTabs from "./components/WorkbenchVisualizationTabs";
import WorkbenchExecutionStatus from "./components/WorkbenchExecutionStatus";
import WorkbenchMetadata from "./components/WorkbenchMetadata";
import wrapWorkbenchPage from "./components/wrapWorkbenchPage";
import WorkbenchViewButton from "./components/WorkbenchViewButton";
import WorkbenchExecutionMetadata from "./components/WorkbenchExecutionMetadata";

import useVisualizationTabHandler from "./hooks/useVisualizationTabHandler";
import useWorkbenchExecute from "./hooks/useWorkbenchExecute";
import useUpdateWorkbenchDescription from "./hooks/useUpdateWorkbenchDescription";
import useWorkbenchFlags from "./hooks/useWorkbenchFlags";
import useWorkbenchParameters from "./hooks/useWorkbenchParameters";
import useEditScheduleDialog from "./hooks/useEditScheduleDialog";
import useEditVisualizationDialog from "./hooks/useEditVisualizationDialog";
import useDeleteVisualization from "./hooks/useDeleteVisualization";
import useFullscreenHandler from "../../lib/hooks/useFullscreenHandler";

import "./WorkbenchView.less";

function WorkbenchView(props) {
  const [workbench, setWorkbench] = useState(props.workbench);
  const [dataSource, setDataSource] = useState();
  const workbenchFlags = useWorkbenchFlags(workbench, dataSource);
  const [parameters, areParametersDirty, updateParametersDirtyFlag] = useWorkbenchParameters(workbench);
  const [selectedVisualization, setSelectedVisualization] = useVisualizationTabHandler(workbench.visualizations);
  const isDesktop = useMedia({ minWidth: 768 });
  const isFixedLayout = useMedia({ minHeight: 500 }) && isDesktop;
  const [fullscreen, toggleFullscreen] = useFullscreenHandler(isDesktop);
  const [addingDescription, setAddingDescription] = useState(false);

  const {
    workbenchResult,
    loadedInitialResults,
    isExecuting,
    executionStatus,
    executeWorkbench,
    error: executionError,
    cancelCallback: cancelExecution,
    isCancelling: isExecutionCancelling,
    updatedAt,
  } = useWorkbenchExecute(workbench);

  const workbenchResultData = useWorkbenchResultData(workbenchResult);

  const updateWorkbenchDescription = useUpdateWorkbenchDescription(workbench, setWorkbench);
  const editSchedule = useEditScheduleDialog(workbench, setWorkbench);
  const addVisualization = useEditVisualizationDialog(workbench, workbenchResult, (newWorkbench, visualization) => {
    setWorkbench(newWorkbench);
    setSelectedVisualization(visualization.id);
  });
  const editVisualization = useEditVisualizationDialog(workbench, workbenchResult, newWorkbench => setWorkbench(newWorkbench));
  const deleteVisualization = useDeleteVisualization(workbench, setWorkbench);

  const doExecuteWorkbench = useCallback(
    (skipParametersDirtyFlag = false) => {
      if (!workbenchFlags.canExecute || (!skipParametersDirtyFlag && (areParametersDirty || isExecuting))) {
        return;
      }
      executeWorkbench();
    },
    [areParametersDirty, executeWorkbench, isExecuting, workbenchFlags.canExecute]
  );

  useEffect(() => {
    document.title = workbench.name;
  }, [workbench.name]);

  useEffect(() => {
    DataSource.get({ id: workbench.data_source_id }).then(setDataSource);
  }, [workbench.data_source_id]);

  return (
    <div
      className={cx("workbench-page-wrapper", {
        "workbench-view-fullscreen": fullscreen,
        "workbench-fixed-layout": isFixedLayout,
      })}>
      <div className="container w-100">
        <WorkbenchPageHeader
          workbench={workbench}
          dataSource={dataSource}
          onChange={setWorkbench}
          selectedVisualization={selectedVisualization}
          headerExtra={
            <DynamicComponent name="WorkbenchView.HeaderExtra" workbench={workbench}>
              {policy.canRun(workbench) && (
                <WorkbenchViewButton
                  className="m-r-5"
                  type="primary"
                  shortcut="mod+enter, alt+enter, ctrl+enter"
                  disabled={!workbenchFlags.canExecute || isExecuting || areParametersDirty}
                  onClick={doExecuteWorkbench}>
                  Refresh
                </WorkbenchViewButton>
              )}
            </DynamicComponent>
          }
          tagsExtra={
            !workbench.description &&
            workbenchFlags.canEdit &&
            !addingDescription &&
            !fullscreen && (
              <PlainButton className="label label-tag hidden-xs" role="none" onClick={() => setAddingDescription(true)}>
                <i className="zmdi zmdi-plus m-r-5" aria-hidden="true" />
                Add description
              </PlainButton>
            )
          }
        />
        {(workbench.description || addingDescription) && (
          <div className={cx("m-t-5", { hidden: fullscreen })}>
            <EditInPlace
              className="w-100"
              value={workbench.description}
              isEditable={workbenchFlags.canEdit}
              onDone={updateWorkbenchDescription}
              onStopEditing={() => setAddingDescription(false)}
              placeholder="Add description"
              ignoreBlanks={false}
              editorProps={{ autoSize: { minRows: 2, maxRows: 4 } }}
              defaultEditing={addingDescription}
              multiline
            />
          </div>
        )}
      </div>
      <div className="workbench-view-content">
        {workbench.hasParameters() && (
          <div className={cx("bg-white tiled p-15 m-t-15 m-l-15 m-r-15", { hidden: fullscreen })}>
            <Parameters
              parameters={parameters}
              onValuesChange={() => {
                updateParametersDirtyFlag(false);
                doExecuteWorkbench(true);
              }}
              onPendingValuesChange={() => updateParametersDirtyFlag()}
            />
          </div>
        )}
        <div className="workbench-results m-t-15">
          {loadedInitialResults && (
            <WorkbenchVisualizationTabs
              workbenchResult={workbenchResult}
              visualizations={workbench.visualizations}
              showNewVisualizationButton={workbenchFlags.canEdit && workbenchResultData.status === ExecutionStatus.DONE}
              canDeleteVisualizations={workbenchFlags.canEdit}
              selectedTab={selectedVisualization}
              onChangeTab={setSelectedVisualization}
              onAddVisualization={addVisualization}
              onDeleteVisualization={deleteVisualization}
              refreshButton={
                policy.canRun(workbench) && (
                  <Button
                    type="primary"
                    disabled={!workbenchFlags.canExecute || areParametersDirty}
                    loading={isExecuting}
                    onClick={doExecuteWorkbench}>
                    {!isExecuting && <i className="zmdi zmdi-refresh m-r-5" aria-hidden="true" />}
                    Refresh Now
                  </Button>
                )
              }
              canRefresh={policy.canRun(workbench)}
            />
          )}
          <div className="workbench-results-footer">
            {workbenchResult && !workbenchResult.getError() && (
              <WorkbenchExecutionMetadata
                workbench={workbench}
                workbenchResult={workbenchResult}
                selectedVisualization={selectedVisualization}
                isWorkbenchExecuting={isExecuting}
                showEditVisualizationButton={workbenchFlags.canEdit}
                onEditVisualization={editVisualization}
                extraActions={
                  <WorkbenchViewButton
                    className="icon-button m-r-5 hidden-xs"
                    title="Toggle Fullscreen"
                    type="default"
                    shortcut="alt+f"
                    onClick={toggleFullscreen}>
                    {fullscreen ? <FullscreenExitOutlinedIcon /> : <FullscreenOutlinedIcon />}
                  </WorkbenchViewButton>
                }
              />
            )}
            {(executionError || isExecuting) && (
              <div className="workbench-execution-status">
                <WorkbenchExecutionStatus
                  status={executionStatus}
                  error={executionError}
                  isCancelling={isExecutionCancelling}
                  onCancel={cancelExecution}
                  updatedAt={updatedAt}
                />
              </div>
            )}
          </div>
        </div>
        <div className={cx("p-t-15 p-r-15 p-l-15", { hidden: fullscreen })}>
          <WorkbenchMetadata layout="horizontal" workbench={workbench} dataSource={dataSource} onEditSchedule={editSchedule} />
        </div>
      </div>
    </div>
  );
}

WorkbenchView.propTypes = { workbench: PropTypes.object.isRequired }; // eslint-disable-line react/forbid-prop-types

const WorkbenchViewPage = wrapWorkbenchPage(WorkbenchView);

// routes.register(
//   "Workbenches.View",
//   routeWithUserSession({
//     path: "/workbenches/:workbenchId",
//     render: pageProps => <WorkbenchViewPage {...pageProps} />,
//   })
// );
