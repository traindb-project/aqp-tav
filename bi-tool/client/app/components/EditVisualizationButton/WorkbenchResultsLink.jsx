// Updated by wgkim 2023-04-25 : query -> workbench 변경
import React from "react";
import PropTypes from "prop-types";
import Link from "@/components/Link";

export default function WorkbenchResultsLink(props) {
  let href = "";

  const { workbench, workbenchResult, fileType } = props;
  const resultId = workbenchResult.getId && workbenchResult.getId();
  const resultData = workbenchResult.getData && workbenchResult.getData();

  if (resultId && resultData && workbench.name) {
    if (workbench.id) {
      href = `api/workbenches/${workbench.id}/results/${resultId}.${fileType}${props.embed ? `?api_key=${props.apiKey}` : ""}`;
    } else {
      href = `api/workbench_results/${resultId}.${fileType}`;
    }
  }

  return (
    <Link target="_blank" rel="noopener noreferrer" disabled={props.disabled} href={href} download>
      {props.children}
    </Link>
  );
}

WorkbenchResultsLink.propTypes = {
  workbench: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  workbenchResult: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  fileType: PropTypes.string,
  disabled: PropTypes.bool.isRequired,
  embed: PropTypes.bool,
  apiKey: PropTypes.string,
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]).isRequired,
};

WorkbenchResultsLink.defaultProps = {
  workbenchResult: {},
  fileType: "csv",
  embed: false,
  apiKey: "",
};
