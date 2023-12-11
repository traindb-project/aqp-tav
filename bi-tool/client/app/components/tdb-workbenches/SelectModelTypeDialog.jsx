// Created by wgkim 2023-05-03
import React, { useEffect, useState } from "react";
import Modal from "antd/lib/modal";

import DynamicComponent from "@/components/DynamicComponent";
import { wrap as wrapDialog, DialogPropType } from "@/components/DialogWrapper";
import { axios } from "@/services/axios";
import Table from "antd/lib/table";
import Radio from "antd/lib/radio";


function SelectModelTypeDialog({ dialog }) {
  const [modelTypes, setModelTypes] = useState([]);
  const [hyperParameters, setHyperParameters] = useState({});
  const [selectedKey, setSelectedKey] = useState([]);
  const [selectedModelType, setSelectedModelType] = useState([]);
  const [selectedHyperParams, setSelectedHyperParams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchModelTypeData();
  }, [])

  async function fetchModelTypeData(){
    try {
      setLoading(true)
      const [response_modeltypes, response_parameters] = await Promise.all([
        axios.get('api/train_model_types'),
        axios.get('api/hyperparameters')
      ]);
      setLoading(false)

      setModelTypes(response_modeltypes.results)
      setHyperParameters(response_parameters.results)

    } catch(error) {
      setLoading(false)
      console.error('Failed to fetch ModelTypes & HyperParameters data :', error)
    }
  }

  function renderColumns(data){
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

  const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      setSelectedKey(selectedRowKeys)
      setSelectedModelType(selectedRows)
      const filtered = hyperParameters.filter(item => item.modeltype_name === selectedRowKeys[0])
      setSelectedHyperParams(filtered)
    },
    getCheckboxProps: (record) => ({
      name: record.name,
    })
  }

  function next() {
    dialog.close([selectedModelType, selectedHyperParams])
  }

  return (
    <Modal
      {...dialog.props}
      title="Select a Model Type"
      okText="Save"
      cancelText="Cancel"
      okButtonProps={{
        disabled: selectedModelType.length === 0,
      }}
      onOk={next}
      closable
      maskClosable
      width={1000}
      bodyStyle={{overflowX: 'auto'}}
    >      
      <DynamicComponent name="SelectModelTypeDialogExtra">
        {!loading && 
          <Table 
            rowSelection={{type: "radio", ...rowSelection}}  
            columns={renderColumns(modelTypes)} 
            dataSource={modelTypes} 
            rowKey="modeltype_name" 
            pagination={false} 
          />
        }
      </DynamicComponent>
    </Modal>
  );
}

SelectModelTypeDialog.propTypes = {
  dialog: DialogPropType.isRequired,
};

export default wrapDialog(SelectModelTypeDialog);
