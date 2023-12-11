// Updated by wgkim 2023-04-26 : query -> workbench 변경
import Select from "antd/lib/select";
import { map } from "lodash";
import DynamicComponent, { registerComponent } from "@/components/DynamicComponent";
import PropTypes from "prop-types";
import React from "react";

import "./WorkbenchSourceDropdownItem"; // register WorkbenchSourceDropdownItem

export function WorkbenchSourceDropdown(props) {
  return (
    <Select
      className="w-100"
      data-test="SelectDataSource"
      placeholder="Choose data source..."
      value={props.value}
      disabled={props.disabled}
      loading={props.loading}
      optionFilterProp="data-name"
      showSearch
      onChange={props.onChange}>
      {map(props.dataSources, ds => (
        <Select.Option key={`ds-${ds.id}`} value={ds.id} data-name={ds.name} data-test={`SelectDataSource${ds.id}`}>
          <DynamicComponent name={"WorkbenchSourceDropdownItem"} dataSource={ds} />
        </Select.Option>
      ))}
    </Select>
  );
}

WorkbenchSourceDropdown.propTypes = {
  dataSources: PropTypes.any,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  onChange: PropTypes.func,
};

registerComponent("WorkbenchSourceDropdown", WorkbenchSourceDropdown);
