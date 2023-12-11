// Updated by wgkim 2023-04-25 : query -> workbench 변경
import React, { useState, useMemo, useCallback } from "react";
import PropTypes from "prop-types";
import cx from "classnames";
import { find, orderBy } from "lodash";
import useMedia from "use-media";
import Tabs from "antd/lib/tabs";
import Button from "antd/lib/button";
import Modal from "antd/lib/modal";
// import VisualizationRenderer from "@/components/visualizations/VisualizationRenderer";
import VisualizationRenderer from "@/components/visualizations/WorkbenchVisualizationRenderer";
import PlainButton from "@/components/PlainButton";

import "./WorkbenchVisualizationTabs.less";

const { TabPane } = Tabs;

function EmptyState({ title, message, refreshButton }) {
  return (
    <div className="workbench-results-empty-state">
      <div className="empty-state-content">
        <div>
          <img src="static/images/illustrations/no-workbench-results.svg" alt="No Workbench Results Illustration" />
        </div>
        <h3>{title}</h3>
        <div className="m-b-20">{message}</div>
        {refreshButton}
      </div>
    </div>
  );
}

EmptyState.propTypes = {
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  refreshButton: PropTypes.node,
};

EmptyState.defaultProps = {
  refreshButton: null,
};

function TabWithDeleteButton({ visualizationName, canDelete, onDelete, ...props }) {
  const handleDelete = useCallback(
    e => {
      e.stopPropagation();
      Modal.confirm({
        title: "Delete Visualization",
        content: "Are you sure you want to delete this visualization?",
        okText: "Delete",
        okType: "danger",
        onOk: onDelete,
        maskClosable: true,
        autoFocusButton: null,
      });
    },
    [onDelete]
  );

  return (
    <span {...props}>
      {visualizationName}
      {canDelete && (
        <PlainButton className="delete-visualization-button" onClick={handleDelete} aria-label="Close" title="Close">
          <i className="zmdi zmdi-close" aria-hidden="true" />
        </PlainButton>
      )}
    </span>
  );
}

TabWithDeleteButton.propTypes = {
  visualizationName: PropTypes.string.isRequired,
  canDelete: PropTypes.bool,
  onDelete: PropTypes.func,
};
TabWithDeleteButton.defaultProps = { canDelete: false, onDelete: () => {} };

const defaultVisualizations = [
  {
    type: "TABLE",
    name: "Table",
    id: null,
    options: {},
  },
];

export default function WorkbenchVisualizationTabs({
  workbenchResult,
  selectedTab,
  showNewVisualizationButton,
  canDeleteVisualizations,
  onChangeTab,
  onAddVisualization,
  onDeleteVisualization,
  refreshButton,
  canRefresh,
  ...props
}) {
  const visualizations = useMemo(
    () => (props.visualizations.length > 0 ? props.visualizations : defaultVisualizations),
    [props.visualizations]
  );

  const tabsProps = {};
  if (find(visualizations, { id: selectedTab })) {
    tabsProps.activeKey = `${selectedTab}`;
  }

  if (showNewVisualizationButton) {
    tabsProps.tabBarExtraContent = (
      <Button
        className="add-visualization-button"
        data-test="NewVisualization"
        type="link"
        onClick={() => onAddVisualization()}>
        <i className="fa fa-plus" aria-hidden="true" />
        <span className="m-l-5 hidden-xs">Add Visualization</span>
      </Button>
    );
  }

  const orderedVisualizations = useMemo(() => orderBy(visualizations, ["id"]), [visualizations]);
  const isFirstVisualization = useCallback(visId => visId === orderedVisualizations[0].id, [orderedVisualizations]);
  const isMobile = useMedia({ maxWidth: 768 });

  const [filters, setFilters] = useState([]);

  return (
    <Tabs
      {...tabsProps}
      type="card"
      className={cx("workbench-visualization-tabs card-style")}
      data-test="WorkbenchPageVisualizationTabs"
      animated={false}
      tabBarGutter={0}
      onChange={activeKey => onChangeTab(+activeKey)}
      destroyInactiveTabPane>
      {orderedVisualizations.map(visualization => (
        <TabPane
          key={`${visualization.id}`}
          tab={
            <TabWithDeleteButton
              data-test={`WorkbenchPageVisualizationTab${visualization.id}`}
              canDelete={!isMobile && canDeleteVisualizations && !isFirstVisualization(visualization.id)}
              visualizationName={visualization.name}
              onDelete={() => onDeleteVisualization(visualization.id)}
            />
          }>
          {workbenchResult ? (
            <VisualizationRenderer
              visualization={visualization}
              workbenchResult={workbenchResult}
              context="workbench"
              filters={filters}
              onFiltersChange={setFilters}
            />
          ) : (
            <EmptyState
              title="Workbench has no result"
              message={
                canRefresh
                  ? "Execute/Refresh the workbench to show results."
                  : "You do not have a permission to execute/refresh this workbench."
              }
              refreshButton={refreshButton}
            />
          )}
        </TabPane>
      ))}
    </Tabs>
  );
}

WorkbenchVisualizationTabs.propTypes = {
  workbenchResult: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  visualizations: PropTypes.arrayOf(PropTypes.object),
  selectedTab: PropTypes.number,
  showNewVisualizationButton: PropTypes.bool,
  canDeleteVisualizations: PropTypes.bool,
  onChangeTab: PropTypes.func,
  onAddVisualization: PropTypes.func,
  onDeleteVisualization: PropTypes.func,
  refreshButton: PropTypes.node,
  canRefresh: PropTypes.bool,
};

WorkbenchVisualizationTabs.defaultProps = {
  workbenchResult: null,
  visualizations: [],
  selectedTab: null,
  showNewVisualizationButton: false,
  canDeleteVisualizations: false,
  onChangeTab: () => {},
  onAddVisualization: () => {},
  onDeleteVisualization: () => {},
  refreshButton: null,
  canRefresh: true,
};
