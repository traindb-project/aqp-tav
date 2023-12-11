/* Created by wgkim 2023-04-12 */
import React from "react";
import PropTypes from "prop-types";
import Link from "@/components/Link";
import BigMessage from "@/components/BigMessage";
import NoTaggedObjectsFound from "@/components/NoTaggedObjectsFound";
import EmptyState, { EmptyStateHelpMessage } from "@/components/empty-state/EmptyState";
import DynamicComponent from "@/components/DynamicComponent";
// import { currentUser } from "@/services/auth";
import HelpTrigger from "@/components/HelpTrigger";

export default function WorkbenchesListEmptyState({ page, searchTerm, selectedTags }) {
  if (searchTerm !== "") {
    return <BigMessage message="Sorry, we couldn't find anything." icon="fa-search" />;
  }
  if (selectedTags.length > 0) {
    return <NoTaggedObjectsFound objectType="workbenches" tags={selectedTags} />;
  }
  switch (page) {
    case "favorites":
      return <BigMessage message="Mark workbenches as Favorite to list them here." icon="fa-star" />;
    case "archive":
      return <BigMessage message="Archived workbenches will be listed here." icon="fa-archive" />;
    case "my":
      const my_msg =  (
        <span>
          <Link.Button href="workbenches/new" type="primary" size="small">
            Create your first workbench!
          </Link.Button>{" "}
          <HelpTrigger className="f-13" type="WORKBENCHES" showTooltip={false}>
            Need help?
          </HelpTrigger>
        </span>
      );
      return <BigMessage icon="fa-search">{my_msg}</BigMessage>;
    default:
      return (
        <DynamicComponent name="WorkbenchesList.EmptyState">
          <EmptyState
            icon="fa fa-code"
            illustration="workbench"
            description="Getting the data from your datasources."
            helpMessage={<EmptyStateHelpMessage helpTriggerType="WORKBENCHES" />}
          />
        </DynamicComponent>
      );
  }
}

WorkbenchesListEmptyState.propTypes = {
  page: PropTypes.string.isRequired,
  searchTerm: PropTypes.string.isRequired,
  selectedTags: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
};
