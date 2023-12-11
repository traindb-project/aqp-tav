// Updated by wgkim 2023-04-25 : query -> workbench 변경
import { isNil, isObject, extend, keys, map, omit, pick, uniq, get } from "lodash";
import React, { useCallback } from "react";
import Modal from "antd/lib/modal";
import { Workbench } from "@/services/workbench";
import notification from "@/services/notification";
import useImmutableCallback from "@/lib/hooks/useImmutableCallback";
import { policy } from "@/services/policy";

class SaveWorkbenchError extends Error {
  constructor(message, detailedMessage = null) {
    super(message);
    this.detailedMessage = detailedMessage;
  }
}

class SaveWorkbenchConflictError extends SaveWorkbenchError {
  constructor() {
    super(
      "Changes not saved",
      <React.Fragment>
        <div className="m-b-5">It seems like the workbench has been modified by another user.</div>
        <div>Please copy/backup your changes and reload this page.</div>
      </React.Fragment>
    );
  }
}

function confirmOverwrite() {
  return new Promise((resolve, reject) => {
    Modal.confirm({
      title: "Overwrite Workbench",
      content: (
        <React.Fragment>
          <div className="m-b-5">It seems like the workbench has been modified by another user.</div>
          <div>Are you sure you want to overwrite the workbench with your version?</div>
        </React.Fragment>
      ),
      okText: "Overwrite",
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

function doSaveWorkbench(data, { canOverwrite = false } = {}) {
  // omit parameter properties that don't need to be stored
  if (isObject(data.options) && data.options.parameters) {
    data.options = {
      ...data.options,
      parameters: map(data.options.parameters, p => p.toSaveableObject()),
    };
  }

  return Workbench.save(data).catch(error => {
    if (get(error, "response.status") === 409) {
      if (canOverwrite) {
        return confirmOverwrite()
          .then(() => Workbench.save(omit(data, ["version"])))
          .catch(() => Promise.reject(new SaveWorkbenchConflictError()));
      }
      return Promise.reject(new SaveWorkbenchConflictError());
    }
    return Promise.reject(new SaveWorkbenchError("Workbench could not be saved"));
  });
}

export default function useUpdateWorkbench(workbench, onChange) {
  const handleChange = useImmutableCallback(onChange);

  // Updated by wgkim 2023-05-04 : workbench -> query
  return useCallback(
    (data = null, { successMessage = 'Train Requested'} = {}) => {
      if (isObject(data)) {
        // Don't save new model with partial data
        if (workbench.isNew()) {
          handleChange(extend(workbench.clone(), data));
          return;
        }
        data = { ...data, id: workbench.id, version: workbench.version };
      } else {
        data = pick(workbench, [
          "id",
          "version",
          "schedule",
          "query",
          "description",
          "name",
          "data_source_id",
          "options",
          "latest_workbench_data_id",
          "is_draft",
          "tags",

          // Added by wgkim 2023-08-17
          "table_name",
          "columns",
          "modeltype_name",
          "model_options",
        ]);
      }

      const parsedColumns = JSON.parse(data.columns);
      // const columnsString = `(${parsedColumns.map(column => `"${column}"`).join(', ')})`;
      const train_data = {
        "table_name": data.table_name, 
        "table_columns": parsedColumns, 
        "model_name": data.name,
        "model_type": data.modeltype_name, 
        "options": data.model_options, 
      }            
      // const sql = `TRAIN MODEL ${data.name} MODELTYPE ${data.modeltype_name} ON ${data.table_name} ${columnsString} OPTIONS ({})`

      // Updated by wgkim 2023-10-17 : TrainDB로 학습요청 정보 전송
      Workbench.train(train_data).then(result => {
        notification.success(`Training for the ${data.name} has been requested`);
      }).catch(error => {
        notification.error(`Training for the ${data.name} has failed.`);
      })


      return doSaveWorkbench(data, { canOverwrite: policy.canEdit(workbench) })
        .then(updatedWorkbench => {
          if (!isNil(successMessage)) {
            // successMessage += `| Query : TRAIN MODEL ${data.name} MODELTYPE ${data.modeltype_name} ON ${data.table_name} ${columnsString} OPTIONS ({})`
            // notification.success(successMessage);
          }
          handleChange(
            extend(
              workbench.clone(),
              // if server returned completely new object (currently possible only when saving new model) -
              // update all fields; otherwise pick only changed fields
              updatedWorkbench.id !== workbench.id ? updatedWorkbench : pick(updatedWorkbench, uniq(["id", "version", ...keys(data)]))
            )
          );
        })
        .catch(error => {
          const notificationOptions = {};
          if (error instanceof SaveWorkbenchConflictError) {
            notificationOptions.duration = null;
          }
          // notification.error(error.message, error.detailedMessage, notificationOptions);
        });
    },
    [workbench, handleChange]
  );
}
