// Updated by wgkim 2023-04-26 : query -> workbench 변경
import PropTypes from "prop-types";
import React from "react";
import { registerComponent } from "@/components/DynamicComponent";
import { WorkbenchSourceTypeIcon } from "@/pages/tdb-workbenches/components/WorkbenchSourceTypeIcon";

export function WorkbenchSourceDropdownItem({ dataSource, children }) {
  return (
    <React.Fragment>
      <WorkbenchSourceTypeIcon type={dataSource.type} aria-label={dataSource.name} title={dataSource.name} />
      {children ? children : <span>{dataSource.name}</span>}
    </React.Fragment>
  );
}

WorkbenchSourceDropdownItem.propTypes = {
  dataSource: PropTypes.shape({
    name: PropTypes.string,
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    type: PropTypes.string,
  }).isRequired,
  children: PropTypes.element,
};

registerComponent("WorkbenchSourceDropdownItem", WorkbenchSourceDropdownItem);
