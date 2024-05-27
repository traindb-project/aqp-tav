// Updated by wgkim 2023-04-26 : query -> workbench 변경
import { extend, find, includes, isEmpty, map } from "lodash";
import React, { useCallback, useEffect, useRef, useState, useMemo, useContext } from "react";
import PropTypes from "prop-types";
import cx from "classnames";
import { useDebouncedCallback } from "use-debounce";
import useMedia from "use-media";
import Button from "antd/lib/button";
import CloseCircleOutlined from "@ant-design/icons/CloseCircleOutlined"
import EllipsisOutlinedIcon from "@ant-design/icons/EllipsisOutlined";
import routeWithUserSession from "@/components/ApplicationArea/routeWithUserSession";
import Resizable from "@/components/Resizable";
import Parameters from "@/components/Parameters";
import EditInPlace from "@/components/EditInPlace";
import DynamicComponent from "@/components/DynamicComponent";
import recordEvent from "@/services/recordEvent";
import { ExecutionStatus } from "@/services/workbench-result";
import routes from "@/services/routes";
import notification from "@/services/notification";
import * as workbenchFormat from "@/lib/workbenchFormat";

import WorkbenchPageHeader from "./components/WorkbenchPageHeader";
import WorkbenchMetadata from "./components/WorkbenchMetadata";
import WorkbenchVisualizationTabs from "./components/WorkbenchVisualizationTabs";
import WorkbenchExecutionStatus from "./components/WorkbenchExecutionStatus";
import WorkbenchSourceAlerts from "./components/WorkbenchSourceAlerts";
import wrapWorkbenchPage from "./components/wrapWorkbenchPage";
import WorkbenchExecutionMetadata from "./components/WorkbenchExecutionMetadata";

import { getEditorComponents } from "@/components/tdb-workbenches/editor-components";
import useWorkbench from "./hooks/useWorkbench";
import useVisualizationTabHandler from "./hooks/useVisualizationTabHandler";
import useAutocompleteFlags from "./hooks/useAutocompleteFlags";
import useAutoLimitFlags from "./hooks/useAutoLimitFlags";
import useWorkbenchExecute from "./hooks/useWorkbenchExecute";
import useWorkbenchResultData from "@/lib/useWorkbenchResultData";
import useWorkbenchDataSources from "./hooks/useWorkbenchDataSources";
import useWorkbenchFlags from "./hooks/useWorkbenchFlags";
import useWorkbenchParameters from "./hooks/useWorkbenchParameters";
import useAddNewParameterDialog from "./hooks/useAddNewParameterDialog";
import useEditScheduleDialog from "./hooks/useEditScheduleDialog";
import useAddVisualizationDialog from "./hooks/useAddVisualizationDialog";
import useEditVisualizationDialog from "./hooks/useEditVisualizationDialog";
import useDeleteVisualization from "./hooks/useDeleteVisualization";
import useUpdateWorkbench from "./hooks/useUpdateWorkbench";
import useUpdateWorkbenchDescription from "./hooks/useUpdateWorkbenchDescription";
import useUnsavedChangesAlert from "./hooks/useUnsavedChangesAlert";


import SelectModelTypeDialog from "@/components/tdb-workbenches/SelectModelTypeDialog";


import Dropdown from "antd/lib/dropdown";

import "./components/WorkbenchSourceDropdown"; // register WorkbenchSourceDropdown
import "./WorkbenchSource.less";
// import { Tags } from "@/components/items-list/components/Sidebar";
import Tag from "antd/lib/tag";
import Badge from "antd/lib/badge";
import Space from "antd/lib/space";
import Table from "antd/lib/table";
import Form from "antd/lib/form"
import Input from "antd/lib/input"
import { FieldNumberOutlined, LayoutOutlined, QuestionCircleOutlined, TableOutlined } from "@ant-design/icons";
import EditHyperParameterDialog from "@/components/tdb-workbenches/EditHyperParameterDialog";

// import queryString from 'query-string';

function chooseDataSourceId(dataSourceIds, availableDataSources) {
  availableDataSources = map(availableDataSources, ds => ds.id);
  return find(dataSourceIds, id => includes(availableDataSources, id)) || null;
}

function WorkbenchSource(props) {
  // Added by wgkim 2023-08-16 : 모델타입, 하이퍼파라미터 결과 추가
  const [targetSchema, setTargetSchema] = useState('')
  const [targetTable, setTargetTable] = useState('')
  const [targetColumns, setTargetColumns] = useState([])
  // const [modelTypes, setModelTypes] = useState([[]])
  const [modelTypes, setModelTypes] = useState([])
  const [defaultHyperParameters, setDefaultHyperParameters] = useState([])
  const [changedHyperParameters, setChangedHyperParameters] = useState({})

  // Added by wgkim 2023-08-16 : 모델타입 및 하이퍼파리미터 표 출력을 위한 렌더링 함수
  function renderModelTypeColumns(data){
    if (data.length === 0) {
      return [];
    }

    const columns = Object.keys(data[0]).map(key => ({
      title: key,
      dataIndex: key,
      key: key,
    }));

    return columns;
  };

  // FIXME
  function renderHyperParameterValues(data, changedData){
    if (data.length === 0) {
      return [];
    }

    const values = [{}]
    data.forEach(item => {
      const key = item.hyperparameter_name
      const changedValue = changedData.hasOwnProperty(`'${key}'`) ? changedData[`'${key}'`] : undefined;
      const cleanedValue = changedValue !== undefined ? changedValue : undefined;
      values[0][key] = cleanedValue !== undefined ? cleanedValue : item.default_value;
    })
    // console.log('data :', data)
    // console.log('values :', values)
    // console.log('changedData :', changedData)
    return values;
  };

  function renderHyperParameterColumns(data){
    if (data.length === 0) {
      return [];
    }

    const columns = []
    data.forEach(item => {
      columns.push({
        title: item.hyperparameter_name,
        dataIndex: item.hyperparameter_name,
        key: item.hyperparameter_name,
      })
    })

    return columns;
  };

  function removeTargetColumn(columnName){
    const removedColumns = targetColumns.filter(col => col !== columnName)
    setTargetColumns(removedColumns)
  }
  
  const { workbench, setWorkbench, isDirty, saveWorkbench } = useWorkbench(props.workbench);
  const { dataSourcesLoaded, dataSources, dataSource } = useWorkbenchDataSources(workbench);
  const [schema, setSchema] = useState([]);

  const workbenchFlags = useWorkbenchFlags(workbench, dataSource);
  const [parameters, areParametersDirty, updateParametersDirtyFlag] = useWorkbenchParameters(workbench);
  const [selectedVisualization, setSelectedVisualization] = useVisualizationTabHandler(workbench.visualizations);
  const { WorkbenchEditor, SchemaBrowser } = getEditorComponents(dataSource && dataSource.type);
  const isMobile = !useMedia({ minWidth: 768 });

  useUnsavedChangesAlert(isDirty);

  const {
    workbenchResult,
    isExecuting: isWorkbenchExecuting,
    executionStatus,
    executeWorkbench,
    error: executionError,
    cancelCallback: cancelExecution,
    isCancelling: isExecutionCancelling,
    updatedAt,
    loadedInitialResults,
  } = useWorkbenchExecute(workbench);

  const workbenchResultData = useWorkbenchResultData(workbenchResult);

  const editorRef = useRef(null);
  const [autocompleteAvailable, autocompleteEnabled, toggleAutocomplete] = useAutocompleteFlags(schema);
  const [autoLimitAvailable, autoLimitChecked, setAutoLimit] = useAutoLimitFlags(dataSource, workbench, setWorkbench);

  // Updated by wgkim 2023-05-04 : workbench -> query
  // const [handleWorkbenchEditorChange] = useDebouncedCallback(workbenchText => {
  //   setWorkbench(extend(workbench.clone(), { workbench: workbenchText }));
  // }, 100);
  const [handleWorkbenchEditorChange] = useDebouncedCallback(workbenchText => {
    setWorkbench(extend(workbench.clone(), { query: workbenchText }));
  }, 100);

  // Added by wgkim 2023-08-17 : 컬럼 및 하이퍼파라미터 변경시 workbench 업데이트
  useEffect(() => {
    let updates = {
      table_name: targetTable,
      // modeltype_name: modelTypes[0].modeltype_name,
      columns: JSON.stringify(targetColumns),
      model_options: JSON.stringify(changedHyperParameters),
    };
    updates.modeltype_name = modelTypes.length > 0 ? modelTypes[0].modeltype_name : null;

    setWorkbench(extend(workbench.clone(), updates));
    updateWorkbench(updates, { successMessage: null }); // show message only on error

  }, [targetTable, targetColumns, modelTypes, defaultHyperParameters, changedHyperParameters])

  useEffect(() => {
    // TODO: ignore new pages?
    recordEvent("view_source", "workbench", workbench.id);
  }, [workbench.id]);

  useEffect(() => {
    // const urlParams = queryString.parse(window.location.search)
    // const urlName = urlParams.workbench_name
    // const urlType = urlParams.model_type
    // if (urlName) {
    //   workbench.name = urlName
    // }
    // if (urlType) {
    //   // setModelType(urlType)
    // }

    document.title = workbench.name;
  }, [workbench.name]);

  const updateWorkbench = useUpdateWorkbench(workbench, setWorkbench);
  const updateWorkbenchDescription = useUpdateWorkbenchDescription(workbench, setWorkbench);
  const workbenchSyntax = dataSource ? dataSource.syntax || "sql" : null;
  const isFormatWorkbenchAvailable = workbenchFormat.isFormatWorkbenchAvailable(workbenchSyntax);
  const formatWorkbench = () => {
    try {
      const formattedWorkbenchText = workbenchFormat.formatWorkbench(workbench.query, workbenchSyntax);
      setWorkbench(extend(workbench.clone(), { workbench: formattedWorkbenchText }));
    } catch (err) {
      notification.error(String(err));
    }
  };

  const handleDataSourceChange = useCallback(
    dataSourceId => {
      if (dataSourceId) {
        try {
          localStorage.setItem("lastSelectedDataSourceId", dataSourceId);
        } catch (e) {
          // `localStorage.setItem` may throw exception if there are no enough space - in this case it could be ignored
        }
      }
      if (workbench.data_source_id !== dataSourceId) {
        recordEvent("update_data_source", "workbench", workbench.id, { dataSourceId });
        const updates = {
          data_source_id: dataSourceId,
          latest_workbench_data_id: null,
          latest_workbench_data: null,
        };
        setWorkbench(extend(workbench.clone(), updates));
        updateWorkbench(updates, { successMessage: null }); // show message only on error
      }
    },
    [workbench, setWorkbench, updateWorkbench]
  );

  useEffect(() => {
    // choose data source id for new models
    if (dataSourcesLoaded && workbenchFlags.isNew) {
      const firstDataSourceId = dataSources.length > 0 ? dataSources[0].id : null;
      handleDataSourceChange(
        chooseDataSourceId(
          [workbench.data_source_id, localStorage.getItem("lastSelectedDataSourceId"), firstDataSourceId],
          dataSources
        )
      );
    }
  }, [workbench.data_source_id, workbenchFlags.isNew, dataSourcesLoaded, dataSources, handleDataSourceChange]);

  const editSchedule = useEditScheduleDialog(workbench, setWorkbench);
  const openAddNewParameterDialog = useAddNewParameterDialog(workbench, (newWorkbench, param) => {
    if (editorRef.current) {
      editorRef.current.paste(param.toWorkbenchTextFragment());
      editorRef.current.focus();
    }
    setWorkbench(newWorkbench);
  });

  const [selectedText, setSelectedText] = useState(null);

  const doExecuteWorkbench = useCallback(
    // Updated by wgkim 2023-04-27 : 클릭시 바로 쿼리문 실행되도록 실행가능 상태인지 조건부분 변경
    (skipParametersDirtyFlag = false, auto_text=null) => {
      if (!skipParametersDirtyFlag && (areParametersDirty || isWorkbenchExecuting)) {
        return;
      }
      if (isDirty || !isEmpty(selectedText)) {
        executeWorkbench(null, () => {
          return workbench.getWorkbenchResultByText(0, selectedText);
        });
      }
      else if (auto_text) {
        executeWorkbench(null, () => {
          return workbench.getWorkbenchResultByText(0, auto_text);
        });
      }
    },
    [workbench, areParametersDirty, isWorkbenchExecuting, isDirty, selectedText, executeWorkbench]
  );

  const handleSchemaItemSelect = useCallback((schemaItem) => {
    if (editorRef.current) {
      // Updated by wgkim 2023-04-27 : 클릭시 바로 쿼리문 실행되도록 함수실행부분 추가
      // Updated by wgkim 2023-04-27 : 컬럼정보도 전달되도록 변경

      let auto_text = editorRef.current.paste(schemaItem)
      // doExecuteWorkbench(true, auto_text)
    }
  }, [doExecuteWorkbench]);

  const [isWorkbenchSaving, setIsWorkbenchSaving] = useState(false);

  const doSaveWorkbench = useCallback(() => {
    if (!isWorkbenchSaving) {
      setIsWorkbenchSaving(true);
      saveWorkbench().finally(() => setIsWorkbenchSaving(false));
    }
  }, [isWorkbenchSaving, saveWorkbench]);

  const addVisualization = useAddVisualizationDialog(workbench, workbenchResult, doSaveWorkbench, (newWorkbench, visualization) => {
    setWorkbench(newWorkbench);
    setSelectedVisualization(visualization.id);
  });
  const editVisualization = useEditVisualizationDialog(workbench, workbenchResult, newWorkbench => setWorkbench(newWorkbench));
  const deleteVisualization = useDeleteVisualization(workbench, setWorkbench);

  const moreActionsMenu = useMemo(
    () => (
      <WorkbenchEditor.Controls
        autoLimitCheckboxProps={{
          available: autoLimitAvailable,
          checked: autoLimitChecked,
          onChange: setAutoLimit,
        }}
      />
    )
  )



  // FIXME
  const EditableContect = React.createContext(null)

  function EditableRow({index, ...props}){
    const {form} = Form.useForm()
    return (<Form form={form} component={false}>
      <EditableContect.Provider value={form}>
        <tr {...props} />
      </EditableContect.Provider>
    </Form>)
  }

  function EditableCell({title, editable, children, dataIndex, record, handleSave, ...restProps}){
    const [editing, setEditing] = useState(false);
    const inputRef = useRef(null);
    const form = useContext(EditableContect);

    useEffect(() => {
      if (editing) {
        inputRef.current.focus();
      }
    }, [editing]);

    const toggleEdit = () => {
      setEditing(!editing);
      form.setFieldsValue({[dataIndex]: record[dataIndex],});
    };

    async function save(){
      try {
        const values = await form.validateFields();
        toggleEdit();
        handleSave({...record, ...values,});
      } catch (errInfo) {
        console.log('Save failed:', errInfo);
      }
    };

    let childNode = children;
    if (editable) {
      childNode = editing ? (
        <Form.Item style={{margin: 0,}} name={dataIndex} rules={[{required: true, message: `${title} is required.`,},]}>
          <Input ref={inputRef} onPressEnter={save} onBlur={save} />
        </Form.Item>
      ) : (
        <div className="editable-cell-value-wrap" style={{paddingRight: 24,}} onClick={toggleEdit}>
          {children}
        </div>
      );
    }

    return <td {...restProps}>{childNode}</td>;
  };

  const components = {body: {row: EditableRow, cell: EditableCell,},};


  return (
    <div className={cx("workbench-page-wrapper", { "workbench-fixed-layout": !isMobile })}>
      <WorkbenchSourceAlerts workbench={workbench} dataSourcesAvailable={!dataSourcesLoaded || dataSources.length > 0} />
      <div className="container w-100 p-b-10">
        <WorkbenchPageHeader
          workbench={workbench}
          dataSource={dataSource}
          sourceMode
          selectedVisualization={selectedVisualization}
          headerExtra={
            <div>
              <DynamicComponent name="WorkbenchSource.HeaderExtra" workbench={workbench} />
          </div>
          }
          onChange={setWorkbench}
        />
      </div>
      <main className="workbench-fullscreen">
        <Resizable direction="horizontal" sizeAttribute="flex-basis" toggleShortcut="Alt+Shift+D, Alt+D">
          <nav>
            {dataSourcesLoaded && (
              <div className="editor__left__data-source">
                <DynamicComponent
                  name={"WorkbenchSourceDropdown"}
                  dataSources={dataSources}
                  value={dataSource ? dataSource.id : undefined}
                  disabled={!workbenchFlags.canEdit || !dataSourcesLoaded || dataSources.length === 0}
                  loading={!dataSourcesLoaded}
                  onChange={handleDataSourceChange}
                />
              </div>
            )}
            <div className="editor__left__schema">
              <SchemaBrowser
                dataSource={dataSource}
                options={workbench.options.schemaOptions}
                onOptionsUpdate={schemaOptions =>
                  setWorkbench(extend(workbench.clone(), { options: { ...workbench.options, schemaOptions } }))
                }
                onSchemaUpdate={setSchema}
                onItemSelect={handleSchemaItemSelect}

                targetTable={targetTable}
                setTargetTable={setTargetTable}
                targetColumns={targetColumns}
                setTargetColumns={setTargetColumns}
              />
            </div>

            {!workbench.isNew() && (
              <div className="workbench-page-workbench-description">
                <EditInPlace
                  isEditable={workbenchFlags.canEdit}
                  markdown
                  ignoreBlanks={false}
                  placeholder="Add description"
                  value={workbench.description}
                  onDone={updateWorkbenchDescription}
                  multiline
                />
              </div>
            )}

            {!workbench.isNew() && <WorkbenchMetadata layout="table" workbench={workbench} onEditSchedule={editSchedule} />}
          </nav>
        </Resizable>

        <div className="content">
          <div className="flex-fill p-relative">
            <div className="p-absolute d-flex flex-column p-l-15 p-r-15" style={{ left: 0, top: 0, right: 0, bottom: 0, overflow: "auto" }}>
              <Resizable direction="vertical" sizeAttribute="flex-basis">
                <section className="workbench-results-wrapper">
                  <h4>Data Preview <WorkbenchEditor.Controls
                    executeButtonProps={{
                      // Updated by wgkim 2023-04-27 : 버튼활성화
                      disabled: !workbenchFlags.canExecute || isWorkbenchExecuting || areParametersDirty,
                      shortcut: "mod+enter, alt+enter, ctrl+enter, shift+enter",
                      onClick: doExecuteWorkbench,
                      text: (
                        <span className="hidden-xs">{selectedText === null ? "Preview" : "Execute Selected"}</span>
                      ),
                    }}
                    dataSourceSelectorProps={
                      dataSource
                        ? {
                            disabled: !workbenchFlags.canEdit,
                            value: dataSource.id,
                            onChange: handleDataSourceChange,
                            options: map(dataSources, ds => ({ value: ds.id, label: ds.name })),
                          }
                        : false
                    }
                  />
                  </h4>
                  
                  
                  <div className="workbench-parameters-wrapper">
                    <Parameters editable={workbenchFlags.canEdit} sortable={workbenchFlags.canEdit} disableUrlUpdate={workbenchFlags.isNew} parameters={parameters} 
                      onPendingValuesChange={() => 
                        updateParametersDirtyFlag()
                      }
                      onValuesChange={() => {
                        updateParametersDirtyFlag(false);
                        doExecuteWorkbench(true);
                      }}
                      onParametersEdit={() => {
                        if (!isDirty) {
                          saveWorkbench();
                        }
                      }}
                    />
                  </div>

                  {(executionError || isWorkbenchExecuting) && (
                    <div className="workbench-alerts">
                      <WorkbenchExecutionStatus status={executionStatus} updatedAt={updatedAt} error={executionError} isCancelling={isExecutionCancelling} onCancel={cancelExecution} />
                    </div>
                  )}

                  <React.Fragment>
                    {workbenchResultData.log.length > 0 && (
                      <div className="workbench-results-log">
                        <p>Log Information:</p>
                        {map(workbenchResultData.log, (line, index) => (
                          <p key={`log-line-${index}`} className="workbench-log-line">
                            {line}
                          </p>
                        ))}
                      </div>
                    )}
                    {loadedInitialResults && !(workbenchFlags.isNew && !workbenchResult) && (
                      <WorkbenchVisualizationTabs workbenchResult={workbenchResult} visualizations={workbench.visualizations} showNewVisualizationButton={false} canDeleteVisualizations={workbenchFlags.canEdit} selectedTab={selectedVisualization} onChangeTab={setSelectedVisualization} onAddVisualization={addVisualization} onDeleteVisualization={deleteVisualization}
                        refreshButton={
                          <Button type="primary" disabled={!workbenchFlags.canExecute || areParametersDirty} loading={isWorkbenchExecuting} onClick={doExecuteWorkbench}> {!isWorkbenchExecuting && <i className="zmdi zmdi-refresh m-r-5" aria-hidden="true" />} Refresh Now </Button>
                        }
                      />
                    )}
                  </React.Fragment>

                  {workbenchResult && (
                    <div className="bottom-controller-container">
                      <WorkbenchExecutionMetadata workbench={workbench} workbenchResult={workbenchResult} selectedVisualization={selectedVisualization} isWorkbenchExecuting={isWorkbenchExecuting} showEditVisualizationButton={!workbenchFlags.isNew && workbenchFlags.canEdit} onEditVisualization={editVisualization} />
                    </div>
                  )}

                </section>
              </Resizable>

              <div className="row">
                <div className="col p-15">
                  <h4>Target</h4>
                  {targetTable && <Tag color="#87d068" style={{fontSize:15}}> {targetTable} </Tag>}
                  {targetColumns.map((columnName) => (
                    <Tag key={columnName} closable color="#2db7f5" style={{ fontSize: 15 }} onClose={() => removeTargetColumn(columnName)}>{columnName}</Tag>
                  ))}

                </div>
                <section className="workbench-editor-wrapper col" data-test="WorkbenchEditor" style={{display:'none'}}>
                  <h4>Raw Query</h4>
                  <WorkbenchEditor ref={editorRef} data-executing={isWorkbenchExecuting ? "true" : null} syntax={dataSource ? dataSource.syntax : null} value={workbench.query} schema={schema} autocompleteEnabled={autocompleteAvailable && autocompleteEnabled} onChange={handleWorkbenchEditorChange} onSelectionChange={setSelectedText} />
                </section>
                <div className="col p-15">
                  <h4>Model Type Info
                    <Button type="primary" className="m-r-5 m-l-5" onClick={() => {SelectModelTypeDialog.showModal().onClose((selected) => {setModelTypes(selected[0]); setDefaultHyperParameters(selected[1])})}}>
                      <i className="fa fa-pencil-square-o" aria-hidden="true" /><span className="m-l-5">Select</span>
                    </Button> 
                  </h4>
                  <Table dataSource={modelTypes} columns={renderModelTypeColumns(modelTypes)} rowKey="modeltype_name" pagination={false} showHeader={true} scroll={{y:30}} />
                </div>
                <div className="col p-15">
                  {/* FIXME */}
                  <h4>Hyper Parameter
                    <Button className="m-r-5 m-l-5" onClick={() => EditHyperParameterDialog.showModal({'defaultHyperParameters':defaultHyperParameters, 'changedHyperParameters':changedHyperParameters}).onClose((changedItems) => {setChangedHyperParameters(changedItems)})}>
                      <QuestionCircleOutlined /><span className="m-l-5">Detail</span>
                    </Button> 
                  </h4>
                  <Table dataSource={renderHyperParameterValues(defaultHyperParameters, changedHyperParameters)} columns={renderHyperParameterColumns(defaultHyperParameters)} rowKey="epochs" pagination={false} showHeader={true} scroll={{y:30}}/>
                </div>
              </div>
              {!workbenchFlags.isNew && <WorkbenchMetadata layout="horizontal" workbench={workbench} onEditSchedule={editSchedule} />}


            </div>
          </div>
            <div className="bottom-controller-container p-15 mb-10">
              <WorkbenchEditor.Controls
              saveButtonProps={
                {
                  text: (
                    <React.Fragment>
                      <span className="hidden-xs">Train</span> {isDirty && !isWorkbenchSaving ? "*" : null}
                      {/* 
                        Updated by wgkim 2023-08-10
                        
                        학습(저장) 과정은 다음과같은 호출스택을 가짐
                        saveButton.onClick -> 
                        WorkbenchSource.jsx -> doSaveWorkbench
                        useWorkbench.js -> saveWorkbench
                        useUpdateWorkbench.jsx -> doSaveWorkbench
                        workbench.js -> save -> saveOrCreateUrl

                        WorkbenchSource.jsx 의 정보들을
                        useUpdateWorkbench.jsx 로 전달하여 data 변수에 할당해야 함

                       */}
                    </React.Fragment>
                  ),
                  shortcut: "mod+s",
                  onClick: doSaveWorkbench,
                  loading: isWorkbenchSaving,
                }
              }
              />
            </div>
        </div>
      </main>
    </div>
  );
}

WorkbenchSource.propTypes = {
  workbench: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

const WorkbenchSourcePage = wrapWorkbenchPage(WorkbenchSource);

routes.register(
  "Workbench.New",
  routeWithUserSession({
    path: "/workbench/new",
    render: pageProps => <WorkbenchSourcePage {...pageProps} />,
    bodyClass: "fixed-layout",
  })
);
routes.register(
  "Workbench.Edit",
  routeWithUserSession({
    path: "/workbench/:workbenchId",
    render: pageProps => <WorkbenchSourcePage {...pageProps} />,
    bodyClass: "fixed-layout",
  })
);
