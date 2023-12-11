// Updated by wgkim 2023-04-26 : query -> workbench 변경
import { find, has } from "lodash";
import React, { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import moment from "moment";
import { markdown } from "markdown";

import Button from "antd/lib/button";
import Dropdown from "antd/lib/dropdown";
import Menu from "antd/lib/menu";
import Tooltip from "@/components/Tooltip";
import Link from "@/components/Link";
import routeWithApiKeySession from "@/components/ApplicationArea/routeWithApiKeySession";
import Parameters from "@/components/Parameters";
import { Moment } from "@/components/proptypes";
import TimeAgo from "@/components/TimeAgo";
import Timer from "@/components/Timer";
import WorkbenchResultsLink from "@/components/EditVisualizationButton/WorkbenchResultsLink";
import VisualizationName from "@/components/visualizations/VisualizationName";
import VisualizationRenderer from "@/components/visualizations/VisualizationRenderer";

import FileOutlinedIcon from "@ant-design/icons/FileOutlined";
import FileExcelOutlinedIcon from "@ant-design/icons/FileExcelOutlined";

import { VisualizationType } from "@redash/viz/lib";
import HtmlContent from "@redash/viz/lib/components/HtmlContent";

import { formatDateTime } from "@/lib/utils";
import useImmutableCallback from "@/lib/hooks/useImmutableCallback";
import { Workbench } from "@/services/workbench";
import location from "@/services/location";
import routes from "@/services/routes";

import logoUrl from "@/assets/images/redash_icon_small.png";

function VisualizationEmbedHeader({ workbenchName, workbenchDescription, visualization }) {
  return (
    <div className="embed-heading p-b-10 p-r-15 p-l-15">
      <h3>
        <img src={logoUrl} alt="Redash Logo" style={{ height: "24px", verticalAlign: "text-bottom" }} />
        <VisualizationName visualization={visualization} /> {workbenchName}
        {workbenchDescription && (
          <small>
            <HtmlContent className="markdown text-muted">{markdown.toHTML(workbenchDescription || "")}</HtmlContent>
          </small>
        )}
      </h3>
    </div>
  );
}

VisualizationEmbedHeader.propTypes = {
  workbenchName: PropTypes.string.isRequired,
  workbenchDescription: PropTypes.string,
  visualization: VisualizationType.isRequired,
};

VisualizationEmbedHeader.defaultProps = { workbenchDescription: "" };

function VisualizationEmbedFooter({
  workbench,
  workbenchResults,
  updatedAt,
  refreshStartedAt,
  workbenchUrl,
  hideTimestamp,
  apiKey,
}) {
  const downloadMenu = (
    <Menu>
      <Menu.Item>
        <WorkbenchResultsLink
          fileType="csv"
          workbench={workbench}
          workbenchResult={workbenchResults}
          apiKey={apiKey}
          disabled={!workbenchResults || !workbenchResults.getData || !workbenchResults.getData()}
          embed>
          <FileOutlinedIcon /> Download as CSV File
        </WorkbenchResultsLink>
      </Menu.Item>
      <Menu.Item>
        <WorkbenchResultsLink
          fileType="tsv"
          workbench={workbench}
          workbenchResult={workbenchResults}
          apiKey={apiKey}
          disabled={!workbenchResults || !workbenchResults.getData || !workbenchResults.getData()}
          embed>
          <FileOutlinedIcon /> Download as TSV File
        </WorkbenchResultsLink>
      </Menu.Item>
      <Menu.Item>
        <WorkbenchResultsLink
          fileType="xlsx"
          workbench={workbench}
          workbenchResult={workbenchResults}
          apiKey={apiKey}
          disabled={!workbenchResults || !workbenchResults.getData || !workbenchResults.getData()}
          embed>
          <FileExcelOutlinedIcon /> Download as Excel File
        </WorkbenchResultsLink>
      </Menu.Item>
    </Menu>
  );

  return (
    <div className="tile__bottom-control">
      {!hideTimestamp && (
        <span>
          <span className="small hidden-print">
            <i className="zmdi zmdi-time-restore" aria-hidden="true" />{" "}
            {refreshStartedAt ? <Timer from={refreshStartedAt} /> : <TimeAgo date={updatedAt} />}
          </span>
          <span className="small visible-print">
            <i className="zmdi zmdi-time-restore" aria-hidden="true" /> {formatDateTime(updatedAt)}
          </span>
        </span>
      )}
      {workbenchUrl && (
        <span className="hidden-print">
          <Tooltip title="Open in Redash">
            <Link.Button className="icon-button" href={workbenchUrl} target="_blank">
              <i className="fa fa-external-link" aria-hidden="true" />
              <span className="sr-only">Open in Redash</span>
            </Link.Button>
          </Tooltip>
          {!workbench.hasParameters() && (
            <Dropdown overlay={downloadMenu} disabled={!workbenchResults} trigger={["click"]} placement="topLeft">
              <Button loading={!workbenchResults && !!refreshStartedAt} className="m-l-5">
                Download Dataset
                <i className="fa fa-caret-up m-l-5" aria-hidden="true" />
              </Button>
            </Dropdown>
          )}
        </span>
      )}
    </div>
  );
}

VisualizationEmbedFooter.propTypes = {
  workbench: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  workbenchResults: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  updatedAt: PropTypes.string,
  refreshStartedAt: Moment,
  workbenchUrl: PropTypes.string,
  hideTimestamp: PropTypes.bool,
  apiKey: PropTypes.string,
};

VisualizationEmbedFooter.defaultProps = {
  workbenchResults: null,
  updatedAt: null,
  refreshStartedAt: null,
  workbenchUrl: null,
  hideTimestamp: false,
  apiKey: null,
};

function VisualizationEmbed({ workbenchId, visualizationId, apiKey, onError }) {
  const [workbench, setWorkbench] = useState(null);
  const [error, setError] = useState(null);
  const [refreshStartedAt, setRefreshStartedAt] = useState(null);
  const [workbenchResults, setWorkbenchResults] = useState(null);

  const handleError = useImmutableCallback(onError);

  useEffect(() => {
    let isCancelled = false;
    Workbench.get({ id: workbenchId })
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

  const refreshWorkbenchResults = useCallback(() => {
    if (workbench) {
      setError(null);
      setRefreshStartedAt(moment());
      workbench
        .getWorkbenchResultPromise()
        .then(result => {
          setWorkbenchResults(result);
        })
        .catch(err => {
          setError(err.getError());
        })
        .finally(() => setRefreshStartedAt(null));
    }
  }, [workbench]);

  useEffect(() => {
    document.querySelector("body").classList.add("headless");
    refreshWorkbenchResults();
  }, [refreshWorkbenchResults]);

  if (!workbench) {
    return null;
  }

  const hideHeader = has(location.search, "hide_header");
  const hideParametersUI = has(location.search, "hide_parameters");
  const hideWorkbenchLink = has(location.search, "hide_link");
  const hideTimestamp = has(location.search, "hide_timestamp");

  const showWorkbenchDescription = has(location.search, "showDescription");
  visualizationId = parseInt(visualizationId, 10);
  const visualization = find(workbench.visualizations, vis => vis.id === visualizationId);

  if (!visualization) {
    // call error handler async, otherwise it will destroy the component on render phase
    setTimeout(() => {
      onError(new Error("Visualization does not exist"));
    }, 10);
    return null;
  }

  return (
    <div className="tile m-t-10 m-l-10 m-r-10 p-t-10 embed__vis" data-test="VisualizationEmbed">
      {!hideHeader && (
        <VisualizationEmbedHeader
          workbenchName={workbench.name}
          workbenchDescription={showWorkbenchDescription ? workbench.description : null}
          visualization={visualization}
        />
      )}
      <div className="col-md-12 workbench__vis">
        {!hideParametersUI && workbench.hasParameters() && (
          <div className="p-t-15 p-b-10">
            <Parameters parameters={workbench.getParametersDefs()} onValuesChange={refreshWorkbenchResults} />
          </div>
        )}
        {error && <div className="alert alert-danger" data-test="ErrorMessage">{`Error: ${error}`}</div>}
        {!error && workbenchResults && (
          <VisualizationRenderer visualization={visualization} queryResult={workbenchResults} context="widget" />
        )}
        {!workbenchResults && refreshStartedAt && (
          <div className="d-flex justify-content-center">
            <div className="spinner">
              <i className="zmdi zmdi-refresh zmdi-hc-spin zmdi-hc-5x" aria-hidden="true" />
              <span className="sr-only">Refreshing...</span>
            </div>
          </div>
        )}
      </div>
      <VisualizationEmbedFooter
        workbench={workbench}
        workbenchResults={workbenchResults}
        updatedAt={workbenchResults ? workbenchResults.getUpdatedAt() : undefined}
        refreshStartedAt={refreshStartedAt}
        workbenchUrl={!hideWorkbenchLink ? workbench.getUrl() : null}
        hideTimestamp={hideTimestamp}
        apiKey={apiKey}
      />
    </div>
  );
}

VisualizationEmbed.propTypes = {
  workbenchId: PropTypes.string.isRequired,
  visualizationId: PropTypes.string,
  apiKey: PropTypes.string.isRequired,
  onError: PropTypes.func,
};

VisualizationEmbed.defaultProps = {
  onError: () => {},
};

routes.register(
  "Visualizations.ViewShared",
  routeWithApiKeySession({
    path: "/embed/workbench/:workbenchId/visualization/:visualizationId",
    render: pageProps => <VisualizationEmbed {...pageProps} />,
    getApiKey: () => location.search.api_key,
  })
);
