// Created by wgkim 2023-05-03

import { trim } from "lodash";
import React, { useCallback, useEffect, useState } from "react";
import Modal from "antd/lib/modal";
import Input from "antd/lib/input";
import Select from "antd/lib/select";
import JSZip from "jszip"

import DynamicComponent from "@/components/DynamicComponent";
import { wrap as wrapDialog, DialogPropType } from "@/components/DialogWrapper";
import navigateTo from "@/components/ApplicationArea/navigateTo";
import { useDropzone } from "react-dropzone";
import ImportModelTable from "./ImportModelTable";
import { axios } from "@/services/axios";
import notification from "@/services/notification";

function ImportModelDialog({ dialog }) {
  const [isValid, setIsValid] = useState(false);
  const [nextInProgress, setNextInProgress] = useState(false);
  const [modalWidth, setModalWidth] = useState(1000)
  const [modalHeight, setModalHeight] = useState(550)

  const [modelName, setModelName] = useState('')
  const [newModelName, setNewModelName] = useState('')
  const [metaJson, setMetaJson] = useState(null)
  const [hexString, setHexString] = useState(null)

  useEffect(() => {
    function handleResize() {
      const newModalWidth = Math.min(1000, window.innerWidth - 50)
      const newModalHeight = Math.min(550, window.innerHeight - 300)
      setModalWidth(newModalWidth)
      setModalHeight(newModalHeight)
    }

    handleResize()

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  useEffect(() =>{
    if (newModelName !== null && metaJson !== null){
      setIsValid(true)
    } else {
      setIsValid(false)
    }
  }, [newModelName, metaJson])

  const onDrop = useCallback(acceptedFiles => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader()
      reader.onabort = () => console.log('file reading was aborted')
      reader.onerror = () => console.log('file reading has failed')
      reader.onload = () => {
        const resultBuffer = new Uint8Array(reader.result)
        const resultHex = buf2hex(resultBuffer)
        setHexString(resultHex)    

        const zip = new JSZip()
        zip.loadAsync(reader.result)
          .then(zip => {
            zip.file('export_metadata.json')
              .async('text')
              .then(content => {
                setMetaJson(splitMetaData(content))              
              }).catch(error => {
                console.error("error at reading ZIP file :", error)
              })
          })
          .catch(error => {
            console.error('error at loading ZIP file :', error)
          })
      }
      reader.readAsArrayBuffer(file)
    })
  }, [setMetaJson])
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

  function splitMetaData(jsonString) {
    const jsonData = JSON.parse(jsonString)
    setModelName(jsonData.modelName)

    let hyperparameterData = {}
    if (jsonData.modeltype.hyperparameters) {
      const hyperparameterArray = JSON.parse(jsonData.modeltype.hyperparameters)
      hyperparameterData = hyperparameterArray.reduce((result, item) => {
        result[item.name] = item.defaultValue
        return result
      }, {})
    }

    if (jsonData.modelOptions) {
      const modelOptions = JSON.parse(jsonData.modelOptions)
      Object.keys(modelOptions).forEach((key) => {
        hyperparameterData[key] = modelOptions[key]
      })
    }

    const modeltypeData = jsonData.modeltype || {}
    delete modeltypeData.hyperparameters

    const targetData = { ...jsonData }
    delete targetData.modeltype
    delete targetData.modelOptions
    delete targetData.modelName

    return {
      target: targetData,
      modeltype: modeltypeData,
      hyperparameter: hyperparameterData,
    }

  }

  function buf2hex(buffer) {
    return [...new Uint8Array(buffer)]
      .map(x => x.toString(16).padStart(2, '0'))
      .join('')
  }

  const dropzoneStyle = {
    border: isDragActive ? "2px dotted #007bff" : "2px dashed #ccc",
    padding: "20px",
    textAlign: "center",
    height: "calc(100% - 200px)",
  }

  const alignStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  }

  function next() {
    axios.post("/api/migration/import", {
      model_name: newModelName,
      hex_string: hexString,
    }).then(function () {
      notification.success(`${newModelName} has been imported successfully`)
    }).catch(function (error) {
      console.log(error)
    })
    setNextInProgress(true);
    dialog.close();
  }

  return (
    <Modal
      {...dialog.props}
      title="Import Model"
      okText="Import"
      cancelText="Cancel"
      okButtonProps={{
        disabled: !isValid || nextInProgress,
        loading: nextInProgress,
      }}
      cancelButtonProps={{
        disabled: nextInProgress,
      }}
      onOk={next}
      closable={!nextInProgress}
      maskClosable={false}
      width={modalWidth}
      bodyStyle={{ height: modalHeight, overflowY: 'auto' }}

    >

      <h3>Model name</h3>
      <input className="m-b-20" value={newModelName} onChange={(e) => setNewModelName(e.target.value)} placeholder="Set Model Name" style={{width: "100%", border: '1px solid #ccc', padding: '8px'}}/>

      <h3>Model file</h3>
      {!metaJson
        ? <div {...getRootProps()} style={dropzoneStyle}>
          <input {...getInputProps()} />
          {
            isDragActive
              ? <div style={alignStyle}><p>Drop the model.zip file here ...</p></div>
              : <div style={alignStyle}><p><i className="fa fa-upload m-r-5" aria-hidden="true" /> Click here to model.zip file or Drag & drop some model.zip file here</p></div>
          }
        </div>
        : <div>
          <ImportModelTable jsonData={metaJson} />
        </div>

      }

    </Modal>
  );
}

ImportModelDialog.propTypes = {
  dialog: DialogPropType.isRequired,
};

export default wrapDialog(ImportModelDialog);
