// Updated by wgkim 2023-04-26 : query -> workbench 변경
import PropTypes from "prop-types";
import React from "react";

export function WorkbenchSourceTypeIcon(props) {
  return <img src={`static/images/db-logos/${props.type}.png`} width="20" alt={props.alt} />;
}

WorkbenchSourceTypeIcon.propTypes = {
  type: PropTypes.string,
  alt: PropTypes.string,
};
