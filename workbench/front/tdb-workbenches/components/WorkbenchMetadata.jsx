// Updated by wgkim 2023-04-25 : query -> workbench 변경
// Updated by wgkim 2023-04-28 : workbenches/1 접속이 안되는 이슈
import { isFunction, has } from "lodash";
import React from "react";
import PropTypes from "prop-types";
import cx from "classnames";
import { Moment } from "@/components/proptypes";
import TimeAgo from "@/components/TimeAgo";
import SchedulePhrase from "@/components/tdb-workbenches/SchedulePhrase";
import { IMG_ROOT } from "@/services/data-source";

import "./WorkbenchMetadata.less";

export default function WorkbenchMetadata({ workbench, dataSource, layout, onEditSchedule }) {
  return (
    <div className={`workbench-metadata workbench-metadata-${layout}`}>
      <div className="workbench-metadata-item">
        <img className="profile__image_thumb" src={workbench.user.profile_image_url} alt="Avatar" />
        <div className="workbench-metadata-property">
          <strong className={cx("workbench-metadata-label", {"text-muted": workbench.user.is_disabled})}>
            {workbench.user.name}
          </strong>
          <span className="workbench-metadata-value">
            created{" "}
            <strong>
              <TimeAgo date={workbench.created_at} />
            </strong>
          </span>
        </div>
      </div>
      <div className="workbench-metadata-item">
        <img className="profile__image_thumb" src={workbench.last_modified_by.profile_image_url} alt="Avatar" />
        <div className="workbench-metadata-property">
          <strong className={cx("workbench-metadata-label", { "text-muted": workbench.last_modified_by.is_disabled })}>
            {workbench.last_modified_by.name}
          </strong>
          <span className="workbench-metadata-value">
            updated{" "}
            <strong>
              <TimeAgo date={workbench.updated_at} />
            </strong>
          </span>
        </div>
      </div>
      <div className="workbench-metadata-space" />
      {has(dataSource, "name") && has(dataSource, "type") && (
        <div className="workbench-metadata-item">
          Data Source:
          <img src={`${IMG_ROOT}/${dataSource.type}.png`} width="20" alt={dataSource.type} />
          <div className="workbench-metadata-property">
            <div className="workbench-metadata-label">{dataSource.name}</div>
          </div>
        </div>
      )}
      <div className="workbench-metadata-item">
        <div className="workbench-metadata-property">
          <span className="workbench-metadata-label">
            <span className="zmdi zmdi-refresh m-r-5" />
            Refresh Schedule
          </span>
          <span className="workbench-metadata-value">
            <SchedulePhrase
              isLink={isFunction(onEditSchedule)}
              isNew={workbench.isNew()}
              schedule={workbench.schedule}
              onClick={onEditSchedule}
            />
          </span>
        </div>
      </div>
    </div>
  );
}

// Updated by wgkim 2023-04-28 : workbenches/1 접속이 안되는 이슈
WorkbenchMetadata.propTypes = {
  layout: PropTypes.oneOf(["table", "horizontal"]),
  workbench: PropTypes.shape({
    created_at: PropTypes.oneOfType([PropTypes.string, Moment]).isRequired,
    updated_at: PropTypes.oneOfType([PropTypes.string, Moment]).isRequired,
    user: PropTypes.shape({
      name: PropTypes.string.isRequired,
      profile_image_url: PropTypes.string.isRequired,
      is_disabled: PropTypes.bool,
    }).isRequired,
    last_modified_by: PropTypes.shape({
      name: PropTypes.string.isRequired,
      profile_image_url: PropTypes.string.isRequired,
      is_disabled: PropTypes.bool,
    }).isRequired,
    schedule: PropTypes.object,
  }).isRequired,
  dataSource: PropTypes.shape({
    type: PropTypes.string,
    name: PropTypes.string,
  }),
  onEditSchedule: PropTypes.func,
};

WorkbenchMetadata.defaultProps = {
  layout: "table",
  dataSource: null,
  onEditSchedule: null,
};
