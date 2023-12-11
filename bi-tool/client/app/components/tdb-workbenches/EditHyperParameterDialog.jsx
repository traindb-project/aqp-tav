// Created by wgkim 2023-05-03
import React, { useEffect, useState } from "react";
import Modal from "antd/lib/modal";

import DynamicComponent from "@/components/DynamicComponent";
import { wrap as wrapDialog, DialogPropType } from "@/components/DialogWrapper";
import axios from "axios";
import Table from "antd/lib/table";
import Radio from "antd/lib/radio";
import Input from "antd/lib/input";


function EditHyperParameterDialog({ dialog, defaultHyperParameters, changedHyperParameters}) {
  const [hyperParameters, setHyperParameters] = useState({});

  function handleCellEdit(value, record, dataIndex){
    const updatedParameters = hyperParameters.map(item => {
      if (item.hyperparameter_name === record.hyperparameter_name) {
        return {...item, [dataIndex]: value}
      }
      return item;
    })
    setHyperParameters(updatedParameters);
  }

  function renderColumns(data){
    if (data.length === 0) {
      return [];
    }

    const columns = Object.keys(data[0]).map(key => ({
      dataIndex: key,
      key: key,
      title: key === "default_value"? "value" : key,
      editable: key === "default_value"? true : false,
      render: (text, record) =>
        key === "default_value" ? (
          <Input value={text} onChange={e => handleCellEdit(e.target.value, record, key)} />
        ) : (
          text
        ),
    }));

    return columns;
  };

  const next = () => {
    const changedItems = hyperParameters.reduce((result, item) => {
      const { modeltype_name, hyperparameter_name, default_value, value_type } = item;
  
      // 값의 타입에 따라 변환하여 저장
      let convertedValue;
      if (value_type === 'int') {
        convertedValue = parseInt(default_value, 10);
      } else if (value_type === 'float') {
        convertedValue = parseFloat(default_value);
      } else {
        convertedValue = default_value;
      }
  
      if (
        !defaultHyperParameters.find(
          defaultItem => defaultItem.hyperparameter_name === hyperparameter_name && defaultItem.default_value === default_value
        )
      ) {
        const convertedKey = "'" + hyperparameter_name + "'"
        result[convertedKey] = convertedValue;
      }
      return result;
    }, {});
  
    console.log('changedItems:', changedItems);
    dialog.close(changedItems);
  };
  
  

  useEffect(() => {
    // 초기 렌더링 시에 defaultHyperParameters를 복사하여 설정
    setHyperParameters([...defaultHyperParameters]);
  }, [defaultHyperParameters]);

  return (
    <Modal
      {...dialog.props}
      title="Edit Hyperparameters"
      okText="Save"
      cancelText="Cancel"
      onOk={next}
      closable
      maskClosable
      width={1000}
      bodyStyle={{overflowX: 'auto'}}
    >      
      <DynamicComponent name="EditHyperParameterDialogExtra">
        <Table 
          columns={renderColumns(defaultHyperParameters)} 
          dataSource={hyperParameters} 
          rowKey="hyperparameter_name" 
          pagination={false} 
        />
      </DynamicComponent>
    </Modal>
  );
}

EditHyperParameterDialog.propTypes = {
  dialog: DialogPropType.isRequired,
};

export default wrapDialog(EditHyperParameterDialog);
