// Updated by wgkim 2023-04-26 : query -> workbench 변경
import React from "react";
import PropTypes from "prop-types";
import Card from "antd/lib/card";
import WarningFilledIcon from "@ant-design/icons/WarningFilled";
import Typography from "antd/lib/typography";
import Link from "@/components/Link";
import DynamicComponent from "@/components/DynamicComponent";
import { currentUser } from "@/services/auth";

import useWorkbenchFlags from "../hooks/useWorkbenchFlags";
import "./WorkbenchSourceAlerts.less";

export default function WorkbenchSourceAlerts({ workbench, dataSourcesAvailable }) {
  const workbenchFlags = useWorkbenchFlags(workbench); // we don't use flags that depend on data source

  let message = null;
  if (workbenchFlags.isNew && !workbenchFlags.canCreate) {
    message = (
      <React.Fragment>
        <Typography.Title level={4}>
          You don't have permission to create new models on any of the data sources available to you.
        </Typography.Title>
        <p>
          <Typography.Text type="secondary">
            You can either <Link href="workbenches">browse existing workbenchies</Link>, or ask for additional permissions from
            your Redash admin.
          </Typography.Text>
        </p>
      </React.Fragment>
    );
  } else if (!dataSourcesAvailable) {
    if (currentUser.isAdmin) {
      message = (
        <React.Fragment>
          <Typography.Title level={4}>
            Looks like no data sources were created yet or none of them available to the group(s) you're member of.
          </Typography.Title>
          <p>
            <Typography.Text type="secondary">Please create one first, and then start workbenching.</Typography.Text>
          </p>

          <div className="workbench-source-alerts-actions">
            <Link.Button type="primary" href="data_sources/new">
              Create Data Source
            </Link.Button>
            <Link.Button type="default" href="groups">
              Manage Group Permissions
            </Link.Button>
          </div>
        </React.Fragment>
      );
    } else {
      message = (
        <React.Fragment>
          <Typography.Title level={4}>
            Looks like no data sources were created yet or none of them available to the group(s) you're member of.
          </Typography.Title>
          <p>
            <Typography.Text type="secondary">Please ask your Redash admin to create one first.</Typography.Text>
          </p>
        </React.Fragment>
      );
    }
  }

  if (!message) {
    return null;
  }

  return (
    <div className="workbench-source-alerts">
      <Card>
        <DynamicComponent name="WorkbenchSource.Alerts" workbench={workbench} dataSourcesAvailable={dataSourcesAvailable}>
          <div className="workbench-source-alerts-icon">
            <WarningFilledIcon />
          </div>
          {message}
        </DynamicComponent>
      </Card>
    </div>
  );
}

WorkbenchSourceAlerts.propTypes = {
  workbench: PropTypes.object.isRequired,
  dataSourcesAvailable: PropTypes.bool,
};

WorkbenchSourceAlerts.defaultProps = {
  dataSourcesAvailable: false,
};
