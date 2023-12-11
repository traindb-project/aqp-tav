import "./train-model-list.css"

import React from "react"
import { CloudUploadOutlined, DownloadOutlined, RestFilled } from "@ant-design/icons"
import Button from "antd/lib/button"
import ButtonGroup from "antd/lib/button/button-group"

import routes from "@/services/routes"
import { TrainModel } from "@/services/train-model"

import PageHeader from "@/components/PageHeader"
import BigMessage from "@/components/BigMessage"
import Paginator from "@/components/Paginator"
import Link from "@/components/Link"

import navigateTo from "@/components/ApplicationArea/navigateTo"
import routeWithUserSession from "@/components/ApplicationArea/routeWithUserSession"

import { wrap as itemList, ControllerType } from "@/components/items-list/ItemsList"
import { ResourceItemsSource } from "@/components/items-list/classes/ItemsSource"
import { UrlStateStorage } from "@/components/items-list/classes/StateStorage"
import * as Sidebar from "@/components/items-list/components/Sidebar"
import ItemsTable, { Columns } from "@/components/items-list/components/ItemsTable"

import Layout from "@/components/tdb-workbench-layouts/ContentWithSidebar"
import ImportModelDialog from "@/components/tdb-workbenches/ImportModelDialog"
import Modal from "antd/lib/modal"
import notification from "@/services/notification"


function TrainModelList({ controller }) {
  const tableColumns = [
    Columns.custom.sortable(
      (text, _item) => (<Link className="table-main-title" href={"workbenches/" + text}>{text}</Link>),
      { title: "Model Name", field: "model_name" }
    ),
    Columns.custom.sortable(
      (text, _item) => text,
      { title: "Type", field: "modeltype_name" }
    ),
    Columns.custom.sortable(
      (_text, item) => `${item.schema_name}.${item.table_name}`,
      { title: "Target" }
    ),
    Columns.custom.sortable(
      (text, _item) => text,
      { title: "Columns", field: "columns" }
    ),
    Columns.custom.sortable(
      (_text, item) => `${item.trained_rows ? (item.trained_rows / item.table_rows * 100).toFixed(2) + '% (' + item.table_rows.toLocaleString('ko-KR') + '/' + item.table_rows.toLocaleString('ko-KR') + ')' : null}`,
      { title: "Sample Rate" }
    ),
    Columns.custom.sortable(
      (text, _item) => text,
      { title: "Training Server", field: "model_server" }
    ),
    Columns.date.sortable(
      { title: "Date", field: "start_time" }
    ),
    Columns.custom.sortable(
      (text, _item) => text,
      { title: "Status", field: "status" }
    ),
    Columns.custom((_text, item) => <>
      <Button.Group>
        <Button className="m-r-5" disabled={item.status === null || item.status === undefined} onClick={() => exportTrainModel(item.model_name)}>
          <DownloadOutlined /> Export
        </Button>
        <Button type="danger" onClick={event => deleteTrainModel(event, item.model_name, controller)}>
          <RestFilled /> Remove
        </Button>
      </Button.Group>
    </>,
      { title: "Actions" }
    )
  ]

  return (
    <div className="page-train-model-list">
      <div className="container">
        <PageHeader
          title={controller.params.pageTitle}
          actions={
            <ButtonGroup>
              <Button className="m-r-5" type="primary" onClick={() => navigateTo("workbench/new")}>
                <i className="fa fa-plus m-r-5" aria-hidden="true" /> New
              </Button>
              <Button block type="primary" onClick={() => ImportModelDialog.showModal()} >
                <CloudUploadOutlined /> Import
              </Button>
            </ButtonGroup>
          }
        />

        <Layout>
          <Layout.Sidebar className="m-b-0">
            <Sidebar.SearchInput
              placeholder="Search models..."
              label="Search models"
              value={controller.searchTerm}
              onChange={controller.updateSearch}
            />
          </Layout.Sidebar>
          <Layout.Content>
            {/* {controller.isLoaded && controller.isEmpty */}
            {false
              ? (
                <BigMessage message="Sorry, we couldn't find anything." icon="fa-search" />
              ) : (
                <div className="bg-white tiled table-responsive">
                  <ItemsTable
                    columns={tableColumns}

                    items={controller.pageItems}
                    loading={!controller.isLoaded}
                    orderByField={controller.orderByField}
                    orderByReverse={controller.orderByReverse}
                    toggleSorting={controller.toggleSorting}
                  />
                  <Paginator
                    showPageSizeSelect

                    totalCount={controller.totalItemsCount}
                    pageSize={controller.itemsPerPage}
                    page={controller.page}
                    onPageSizeChange={itemsPerPage => controller.updatePagination({ itemsPerPage })}
                    onChange={page => controller.updatePagination({ page })}
                  />
                </div>
              )}
          </Layout.Content>
        </Layout>
      </div>
    </div>
  )
}

function hexStringToByteArray(hexString) {
  const byteArray = new Uint8Array(hexString.length / 2)
  for (let i = 0; i < byteArray.length; i++) {
    byteArray[i] = parseInt(hexString.substr(i * 2, 2), 16)
  }
  return byteArray
}

function exportTrainModel(modelName) {
  TrainModel.export(modelName).then((data) => {
    const blobData = hexStringToByteArray(data.results)
    
    const a = document.createElement('a')
    a.download = `${modelName}.zip`
    const file = new Blob([blobData], {type: 'application/zip'})
    a.href = window.URL.createObjectURL(file)

    document.body.appendChild(a)
    a.click()

  })
}

function deleteTrainModel(_event, modelName, controller) {
  return (
    Modal.confirm({
      title: "Delete TrainModel",
      content: "Are you sure you want to delete this model?",
      okText: "yes",
      okType: "danger",
      cancelText: "No",
      onOk: () => {
        TrainModel.delete(modelName).then(() => {
          notification.success("TrainModel deleted successfully")
          controller.updatePagination({ page: 1 })
          controller.update()
        })
      }
    })
  )
}

const TrainModelListPage = itemList(
  TrainModelList,
  () => new ResourceItemsSource({
    getResource({ }) {
      return TrainModel.trainModel
    }
  }),
  () => new UrlStateStorage({})
)

routes.register(
  "Workbench.List",
  routeWithUserSession({
    path: "/workbench",
    title: "Workbench",
    render: pageProps => <TrainModelListPage {...pageProps} currentPage="workbench" />,
  })
)
