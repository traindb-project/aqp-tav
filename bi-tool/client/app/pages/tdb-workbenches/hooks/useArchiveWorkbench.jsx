// Updated by wgkim 2023-04-25 : query -> workbench 변경
import { extend } from "lodash";
import React, { useCallback } from "react";
import Modal from "antd/lib/modal";
import { Workbench } from "@/services/workbench";
import notification from "@/services/notification";
import useImmutableCallback from "@/lib/hooks/useImmutableCallback";

function confirmArchive() {
  return new Promise((resolve, reject) => {
    Modal.confirm({
      title: "Archive Workbench",
      content: (
        <React.Fragment>
          <div className="m-b-5">Are you sure you want to archive this workbench?</div>
          <div>All alerts and dashboard widgets created with its visualizations will be deleted.</div>
        </React.Fragment>
      ),
      okText: "Archive",
      okType: "danger",
      onOk: () => {
        resolve();
      },
      onCancel: () => {
        reject();
      },
      maskClosable: true,
      autoFocusButton: null,
    });
  });
}

function doArchiveWorkbench(workbench) {
  return Workbench.delete({ id: workbench.id })
    .then(() => {
      return extend(workbench.clone(), { is_archived: true, schedule: null });
    })
    .catch(error => {
      notification.error("Workbench could not be archived.");
      return Promise.reject(error);
    });
}

export default function useArchiveWorkbench(workbench, onChange) {
  const handleChange = useImmutableCallback(onChange);

  return useCallback(() => {
    confirmArchive()
      .then(() => doArchiveWorkbench(workbench))
      .then(handleChange);
  }, [workbench, handleChange]);
}
