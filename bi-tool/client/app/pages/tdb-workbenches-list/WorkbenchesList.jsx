/* Created by wgkim 2023-04-12 */
import React, { useEffect, useRef } from "react";
import cx from "classnames";

import routeWithUserSession from "@/components/ApplicationArea/routeWithUserSession";
import Link from "@/components/Link";
import PageHeader from "@/components/PageHeader";
import Paginator from "@/components/Paginator";
import DynamicComponent from "@/components/DynamicComponent";

import { wrap as itemsList, ControllerType } from "@/components/items-list/ItemsList";
import useItemsListExtraActions from "@/components/items-list/hooks/useItemsListExtraActions";
import { ResourceItemsSource } from "@/components/items-list/classes/ItemsSource";
import { UrlStateStorage } from "@/components/items-list/classes/StateStorage";

import * as Sidebar from "@/components/items-list/components/Sidebar";
import ItemsTable, { Columns } from "@/components/items-list/components/ItemsTable";

// Updated by wgkim 2023-05-22 : 워크벤치를 위한 사이드바 
// import Layout from "@/components/layouts/ContentWithSidebar";
import Layout from "@/components/tdb-workbench-layouts/ContentWithSidebar";

// Updated by wgkim 2023-04-20 : 워크벤치 서비스 생성 쿼리 대신 워크벤치 불러옴
import { Workbench } from "@/services/workbench";
import { currentUser } from "@/services/auth";
import location from "@/services/location";
import routes from "@/services/routes";

import WorkbenchesListEmptyState from "./WorkbenchesListEmptyState";

import "./workbenches-list.css";

import Button from "antd/lib/button";

import ImportModelDialog from "@/components/tdb-workbenches/ImportModelDialog";
import RestOutlined from "@ant-design/icons/RestOutlined";
import RobotOutlined from "@ant-design/icons/RobotOutlined"
import ProfileOutlined from "@ant-design/icons/ProfileOutlined"
import SettingOutlined from "@ant-design/icons/SettingOutlined"
import Switch from "antd/lib/switch";

// Added by wgkim 2023-06-08 : 워크벤치 삭제 확인용 모달창
import Modal from "antd/lib/modal";
import notification from "@/services/notification";
import ButtonGroup from "antd/lib/button/button-group";
import { CloudUploadOutlined, DownloadOutlined, ExportOutlined, ImportOutlined } from "@ant-design/icons";
import navigateTo from "@/components/ApplicationArea/navigateTo";


const sidebarMenu = [
  {
    key: "all",
    href: "workbenches",
    title: "All Models",
    icon: () => <Sidebar.MenuIcon icon="fa fa-code" />,
  },
  {
    key: "my",
    href: "workbenches/my",
    title: "My Models",
    icon: () => <Sidebar.ProfileImage user={currentUser} />,
  },
];

// Updated by wgkim 2023-04-20 : 화면에서 리스트 뿌리는 부분의 헤더 및 컬럼과 기능을 담당하는 부분
// Updated by wgkim 2023-05-02 : api/workbenches의 정보에 맞게 변경 
function WorkbenchesListExtraActions(props) {
  return <DynamicComponent name="WorkbenchesList.Actions" {...props} />;
}

// Updated by wgkim 2023-05-02 : workbench 삭제 확인을 위한 모달 창
function deleteWorkbench(event, workbenchId, controller) {
  return (
    Modal.confirm({
      title: "Delete Workbench",
      content: "Are you sure you want to delete this workbench?",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk: () => {
        Workbench.delete(workbenchId).then(() => {
          notification.success("Workbench deleted successfully.");
          controller.updatePagination({ page: 1 });
          controller.update();
        });
      },
    })
  )
}



function WorkbenchesList({ controller }) {
  const listColumns = [
    // Columns.checkbox({ className: "p-r-0", onChange: handleCheckboxChange}),
    Columns.custom.sortable(
      (text, item) => (
        <React.Fragment>
          <Link className="table-main-title" href={"workbenches/" + item.id}>
            {item.name}
          </Link>
          {/* <WorkbenchTagsControl className="d-block" tags={item.tags} isDraft={item.is_draft} isArchived={item.is_archived} /> */}
        </React.Fragment>
      ),
      {
        title: "Name",
        field: "name",
        width: null,
      }
    ),
    Columns.custom.sortable((text, item) => text, {
      title: "Type",
      field: "modeltype_name",
      width: null,
    }),
    Columns.custom.sortable((text, item) => { return (item.schema_name ? item.schema_name + '.' + text : text) }, {
      title: "Target",
      field: "table_name",
      width: null,
    }),
    Columns.custom.sortable((text, item) => { return (text) }, {
      title: "Columns",
      field: "columns",
      width: null,
    }),
    Columns.custom.sortable((text, item) => { return (text ? (text / item.table_rows * 100).toFixed(2) + '% (' + text.toLocaleString('ko-KR') + '/' + item.table_rows.toLocaleString('ko-KR') + ')' : null) }, {
      title: "Sample Rate",
      field: "trained_rows",
      width: null,
    }),
    Columns.date.sortable({ title: "Trained at", field: "start_time", width: null }),
    Columns.custom.sortable((text, item) => item.user.name, { title: "Creator", width: null }),
    Columns.custom((text) => {
      return (
        <>
          <Button.Group>
            {/* <Button style={{width:"110px"}}>
              <Switch
                checkedChildren="enabled"
                unCheckedChildren="disabled"
              />
            </Button> */}
            <Button className="m-r-5">
              <DownloadOutlined /> Export
            </Button>
            <Button type="danger" onClick={event => deleteWorkbench(event, text, controller)}>
              <RestOutlined /> Remove
            </Button>
          </Button.Group>
        </>

      )
    }, {
      title: "Actions",
      field: "id",
      width: null,
    }),

  ];

  const controllerRef = useRef();
  controllerRef.current = controller;

  useEffect(() => {
    const unlistenLocationChanges = location.listen((unused, action) => {
      const searchTerm = location.search.q || "";
      if (action === "PUSH" && searchTerm !== controllerRef.current.searchTerm) {
        controllerRef.current.updateSearch(searchTerm);
      }
    });

    return () => {
      unlistenLocationChanges();
    };
  }, []);

  const {
    areExtraActionsAvailable,
    listColumns: tableColumns,
    Component: ExtraActionsComponent,
    selectedItems,
  } = useItemsListExtraActions(controller, listColumns, WorkbenchesListExtraActions);



  return (
    <div className="page-workbenches-list">
      <div className="container">
        <PageHeader
          title={controller.params.pageTitle}
          actions={
            <ButtonGroup >
              <Button className="m-r-5" type="primary" onClick={() => navigateTo("workbenches/new")}>
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
            <Sidebar.Menu items={sidebarMenu} selected={controller.params.currentPage} />
            {/* <Sidebar.Tags url="api/workbenches/tags" onChange={controller.updateSelectedTags} showUnselectAll /> */}
          </Layout.Sidebar>
          <Layout.Content>
            {controller.isLoaded && controller.isEmpty ? (
              <WorkbenchesListEmptyState
                page={controller.params.currentPage}
                searchTerm={controller.searchTerm}
              // selectedTags={controller.selectedTags}
              />
            ) : (
              <React.Fragment>
                <div className={cx({ "m-b-10": areExtraActionsAvailable })}>
                  <ExtraActionsComponent selectedItems={selectedItems} />
                </div>
                <div className="bg-white tiled table-responsive">
                  <ItemsTable
                    items={controller.pageItems}
                    loading={!controller.isLoaded}
                    columns={tableColumns}
                    orderByField={controller.orderByField}
                    orderByReverse={controller.orderByReverse}
                    toggleSorting={controller.toggleSorting}
                  />
                  <Paginator
                    showPageSizeSelect
                    totalCount={controller.totalItemsCount}
                    pageSize={controller.itemsPerPage}
                    onPageSizeChange={itemsPerPage => controller.updatePagination({ itemsPerPage })}
                    page={controller.page}
                    onChange={page => controller.updatePagination({ page })}
                  />
                </div>
              </React.Fragment>
            )}
          </Layout.Content>
        </Layout>
      </div>
    </div>
  );
}

WorkbenchesList.propTypes = {
  controller: ControllerType.isRequired,
};

const WorkbenchesListPage = itemsList(
  WorkbenchesList,
  () =>
    new ResourceItemsSource({
      getResource({ params: { currentPage } }) {
        return {
          all: Workbench.workbenches.bind(Workbench),
          my: Workbench.myWorkbenches.bind(Workbench),
        }[currentPage];
      },
      getItemProcessor() {
        return item => new Workbench(item);
      },
    }),
  () => new UrlStateStorage({ orderByField: "created_at", orderByReverse: true })
);

routes.register(
  "Workbenches.List",
  routeWithUserSession({
    path: "/workbenches",
    title: "Workbenches",
    render: pageProps => <WorkbenchesListPage {...pageProps} currentPage="all" />,
  })
);
routes.register(
  "Workbenches.My",
  routeWithUserSession({
    path: "/workbenches/my",
    title: "My Workbenches",
    render: pageProps => <WorkbenchesListPage {...pageProps} currentPage="my" />,
  })
);

