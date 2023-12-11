// Updated by wgkim 2023-04-25 : query -> workbench 변경
import { extend, map, filter, reduce } from "lodash";
import React, { useMemo } from "react";
import PropTypes from "prop-types";
import Button from "antd/lib/button";
import Dropdown from "antd/lib/dropdown";
import Menu from "antd/lib/menu";
import EllipsisOutlinedIcon from "@ant-design/icons/EllipsisOutlined";
import useMedia from "use-media";
import Link from "@/components/Link";
import EditInPlace from "@/components/EditInPlace";
import FavoritesControl from "@/components/FavoritesControl";
import { WorkbenchTagsControl } from "@/components/tags-control/TagsControl";
import getTags from "@/services/getTags";
import { clientConfig } from "@/services/auth";
import useWorkbenchFlags from "../hooks/useWorkbenchFlags";
import useArchiveWorkbench from "../hooks/useArchiveWorkbench";
import usePublishWorkbench from "../hooks/usePublishWorkbench";
import useUnpublishWorkbench from "../hooks/useUnpublishWorkbench";
import useUpdateWorkbenchTags from "../hooks/useUpdateWorkbenchTags";
import useRenameWorkbench from "../hooks/useRenameWorkbench";
import useDuplicateWorkbench from "../hooks/useDuplicateWorkbench";
import useApiKeyDialog from "../hooks/useApiKeyDialog";
import usePermissionsEditorDialog from "../hooks/usePermissionsEditorDialog";

import "./WorkbenchPageHeader.less";

function getWorkbenchTags() {
  return getTags("api/workbenches/tags").then(tags => map(tags, t => t.name));
}

function createMenu(menu) {
  const handlers = {};

  const groups = map(menu, group =>
    filter(
      map(group, (props, key) => {
        props = extend({ isAvailable: true, isEnabled: true, onClick: () => {} }, props);
        if (props.isAvailable) {
          handlers[key] = props.onClick;
          return (
            <Menu.Item key={key} disabled={!props.isEnabled}>
              {props.title}
            </Menu.Item>
          );
        }
        return null;
      })
    )
  );

  return (
    <Menu onClick={({ key }) => handlers[key]()}>
      {reduce(
        filter(groups, group => group.length > 0),
        (result, items, key) => {
          const divider = result.length > 0 ? <Menu.Divider key={`divider${key}`} /> : null;
          return [...result, divider, ...items];
        },
        []
      )}
    </Menu>
  );
}

export default function WorkbenchPageHeader({
  workbench,
  dataSource,
  sourceMode,
  selectedVisualization,
  headerExtra,
  tagsExtra,
  onChange,
}) {
  const isDesktop = useMedia({ minWidth: 768 });
  const workbenchFlags = useWorkbenchFlags(workbench, dataSource);
  const updateName = useRenameWorkbench(workbench, onChange);
  const updateTags = useUpdateWorkbenchTags(workbench, onChange);
  const archiveWorkbench = useArchiveWorkbench(workbench, onChange);
  const publishWorkbench = usePublishWorkbench(workbench, onChange);
  const unpublishWorkbench = useUnpublishWorkbench(workbench, onChange);
  const [isDuplicating, duplicateWorkbench] = useDuplicateWorkbench(workbench);
  const openApiKeyDialog = useApiKeyDialog(workbench, onChange);
  const openPermissionsEditorDialog = usePermissionsEditorDialog(workbench);

  const moreActionsMenu = useMemo(
    () =>
      createMenu([
        {
          fork: {
            isEnabled: !workbenchFlags.isNew && workbenchFlags.canFork && !isDuplicating,
            title: (
              <React.Fragment>
                Fork <i className="fa fa-external-link m-l-5" aria-hidden="true" />
                <span className="sr-only">(opens in a new tab)</span>
              </React.Fragment>
            ),
            onClick: duplicateWorkbench,
          },
        },
        {
          archive: {
            isAvailable: !workbenchFlags.isNew && workbenchFlags.canEdit && !workbenchFlags.isArchived,
            title: "Archive",
            onClick: archiveWorkbench,
          },
          managePermissions: {
            isAvailable:
              !workbenchFlags.isNew && workbenchFlags.canEdit && !workbenchFlags.isArchived && clientConfig.showPermissionsControl,
            title: "Manage Permissions",
            onClick: openPermissionsEditorDialog,
          },
          publish: {
            isAvailable:
              !isDesktop && workbenchFlags.isDraft && !workbenchFlags.isArchived && !workbenchFlags.isNew && workbenchFlags.canEdit,
            title: "Publish",
            onClick: publishWorkbench,
          },
          unpublish: {
            isAvailable: !clientConfig.disablePublish && !workbenchFlags.isNew && workbenchFlags.canEdit && !workbenchFlags.isDraft,
            title: "Unpublish",
            onClick: unpublishWorkbench,
          },
        },
        {
          showAPIKey: {
            isAvailable: !clientConfig.disablePublicUrls && !workbenchFlags.isNew,
            title: "Show API Key",
            onClick: openApiKeyDialog,
          },
        },
      ]),
    [
      workbenchFlags.isNew,
      workbenchFlags.canFork,
      workbenchFlags.canEdit,
      workbenchFlags.isArchived,
      workbenchFlags.isDraft,
      isDuplicating,
      duplicateWorkbench,
      archiveWorkbench,
      openPermissionsEditorDialog,
      isDesktop,
      publishWorkbench,
      unpublishWorkbench,
      openApiKeyDialog,
    ]
  );

  return (
    <div className="workbench-page-header">
      <div className="title-with-tags">
        <div className="page-title">
          <div className="d-flex align-items-center">
            {!workbenchFlags.isNew && <FavoritesControl item={workbench} />}
            <h3>
              <EditInPlace isEditable={workbenchFlags.canEdit} onDone={updateName} ignoreBlanks value={workbench.name} />
            </h3>
          </div>
        </div>
        <div className="workbench-tags">
          <WorkbenchTagsControl
            tags={workbench.tags}
            isDraft={workbenchFlags.isDraft}
            isArchived={workbenchFlags.isArchived}
            canEdit={workbenchFlags.canEdit}
            getAvailableTags={getWorkbenchTags}
            onEdit={updateTags}
            tagsExtra={tagsExtra}
          />
        </div>
      </div>
      <div className="header-actions">
        {headerExtra}
        {isDesktop && workbenchFlags.isDraft && !workbenchFlags.isArchived && !workbenchFlags.isNew && workbenchFlags.canEdit && (
          <Button className="m-r-5" onClick={publishWorkbench}>
            <i className="fa fa-paper-plane m-r-5" aria-hidden="true" /> Publish
          </Button>
        )}

        {!workbenchFlags.isNew && workbenchFlags.canViewSource && (
          <span>
            {!sourceMode && (
              <Link.Button className="m-r-5" href={workbench.getUrl(true, selectedVisualization)}>
                <i className="fa fa-pencil-square-o" aria-hidden="true" />
                <span className="m-l-5">Edit Source</span>
              </Link.Button>
            )}
            {sourceMode && (
              <Link.Button
                className="m-r-5"
                href={workbench.getUrl(false, selectedVisualization)}
                data-test="WorkbenchPageShowResultOnly">
                <i className="fa fa-table" aria-hidden="true" />
                <span className="m-l-5">Show Results Only</span>
              </Link.Button>
            )}
          </span>
        )}

        {!workbenchFlags.isNew && (
          <Dropdown overlay={moreActionsMenu} trigger={["click"]}>
            <Button data-test="WorkbenchPageHeaderMoreButton" aria-label="More actions">
              <EllipsisOutlinedIcon rotate={90} aria-hidden="true" />
            </Button>
          </Dropdown>
        )}
      </div>
    </div>
  );
}

WorkbenchPageHeader.propTypes = {
  workbench: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    name: PropTypes.string,
    tags: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  dataSource: PropTypes.object,
  sourceMode: PropTypes.bool,
  selectedVisualization: PropTypes.number,
  headerExtra: PropTypes.node,
  tagsExtra: PropTypes.node,
  onChange: PropTypes.func,
};

WorkbenchPageHeader.defaultProps = {
  dataSource: null,
  sourceMode: false,
  selectedVisualization: null,
  headerExtra: null,
  tagsExtra: null,
  onChange: () => {},
};
