// Updated by wgkim 2023-04-25 : query -> workbench 변경
import React from "react";
import PropTypes from "prop-types";
import Dropdown from "antd/lib/dropdown";
import Menu from "antd/lib/menu";
import Button from "antd/lib/button";
import PlainButton from "@/components/PlainButton";
import { clientConfig } from "@/services/auth";

import PlusCircleFilledIcon from "@ant-design/icons/PlusCircleFilled";
import ShareAltOutlinedIcon from "@ant-design/icons/ShareAltOutlined";
import FileOutlinedIcon from "@ant-design/icons/FileOutlined";
import FileExcelOutlinedIcon from "@ant-design/icons/FileExcelOutlined";
import EllipsisOutlinedIcon from "@ant-design/icons/EllipsisOutlined";

import WorkbenchResultsLink from "./WorkbenchResultsLink";

export default function WorkbenchControlDropdown(props) {
  const menu = (
    <Menu>
      {!props.workbench.isNew() && (!props.workbench.is_draft || !props.workbench.is_archived) && (
        <Menu.Item>
          <PlainButton onClick={() => props.openAddToDashboardForm(props.selectedTab)}>
            <PlusCircleFilledIcon /> Add to Dashboard
          </PlainButton>
        </Menu.Item>
      )}
      {!clientConfig.disablePublicUrls && !props.workbench.isNew() && (
        <Menu.Item>
          <PlainButton
            onClick={() => props.showEmbedDialog(props.workbench, props.selectedTab)}
            data-test="ShowEmbedDialogButton">
            <ShareAltOutlinedIcon /> Embed Elsewhere
          </PlainButton>
        </Menu.Item>
      )}
      <Menu.Item>
        <WorkbenchResultsLink
          fileType="csv"
          disabled={props.workbenchExecuting || !props.workbenchResult.getData || !props.workbenchResult.getData()}
          workbench={props.workbench}
          workbenchResult={props.workbenchResult}
          embed={props.embed}
          apiKey={props.apiKey}>
          <FileOutlinedIcon /> Download as CSV File
        </WorkbenchResultsLink>
      </Menu.Item>
      <Menu.Item>
        <WorkbenchResultsLink
          fileType="tsv"
          disabled={props.workbenchExecuting || !props.workbenchResult.getData || !props.workbenchResult.getData()}
          workbench={props.workbench}
          workbenchResult={props.workbenchResult}
          embed={props.embed}
          apiKey={props.apiKey}>
          <FileOutlinedIcon /> Download as TSV File
        </WorkbenchResultsLink>
      </Menu.Item>
      <Menu.Item>
        <WorkbenchResultsLink
          fileType="xlsx"
          disabled={props.workbenchExecuting || !props.workbenchResult.getData || !props.workbenchResult.getData()}
          workbench={props.workbench}
          workbenchResult={props.workbenchResult}
          embed={props.embed}
          apiKey={props.apiKey}>
          <FileExcelOutlinedIcon /> Download as Excel File
        </WorkbenchResultsLink>
      </Menu.Item>
    </Menu>
  );

  return (
    <Dropdown trigger={["click"]} overlay={menu} overlayClassName="workbench-control-dropdown-overlay">
      <Button data-test="WorkbenchControlDropdownButton">
        <EllipsisOutlinedIcon rotate={90} />
      </Button>
    </Dropdown>
  );
}

WorkbenchControlDropdown.propTypes = {
  workbench: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  workbenchResult: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  workbenchExecuting: PropTypes.bool.isRequired,
  showEmbedDialog: PropTypes.func.isRequired,
  embed: PropTypes.bool,
  apiKey: PropTypes.string,
  selectedTab: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  openAddToDashboardForm: PropTypes.func.isRequired,
};

WorkbenchControlDropdown.defaultProps = {
  workbenchResult: {},
  embed: false,
  apiKey: "",
  selectedTab: "",
};
