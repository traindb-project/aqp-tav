// /* Created by wgkim 2023-04-12 */
// import React, { useState, useEffect, useRef } from "react";
// import cx from "classnames";

// import routeWithUserSession from "@/components/ApplicationArea/routeWithUserSession";
// import Link from "@/components/Link";
// import PageHeader from "@/components/PageHeader";
// import Paginator from "@/components/Paginator";
// import DynamicComponent from "@/components/DynamicComponent";

// import { wrap as itemsList, ControllerType } from "@/components/items-list/ItemsList";
// import useItemsListExtraActions from "@/components/items-list/hooks/useItemsListExtraActions";
// import { ResourceItemsSource } from "@/components/items-list/classes/ItemsSource";
// import { UrlStateStorage } from "@/components/items-list/classes/StateStorage";

// import * as Sidebar from "@/components/items-list/components/Sidebar";
// import ItemsTable, { Columns } from "@/components/items-list/components/ItemsTable";

// // Updated by wgkim 2023-05-22 : 워크벤치를 위한 사이드바 
// // import Layout from "@/components/layouts/ContentWithSidebar";
// import Layout from "@/components/tdb-workbench-layouts/ContentWithSidebar";

// // Updated by wgkim 2023-04-20 : 워크벤치 서비스 생성 쿼리 대신 워크벤치 불러옴
// import { Workbench } from "@/services/workbench";
// import { currentUser } from "@/services/auth";
// import location from "@/services/location";
// import routes from "@/services/routes";

// import WorkbenchesListEmptyState from "./WorkbenchesListEmptyState";

// import "./workbenches-list.css";

// import Button from "antd/lib/button";

// import CreateWorkbenchDialog from "@/components/tdb-workbenches/CreateWorkbenchDialog";
// import CheckOutlined from "@ant-design/icons/CheckOutlined";
// // import LoadingOutlined from "@ant-design/icons/LoadingOutlined";
// import ClockCircleOutlined from "@ant-design/icons/ClockCircleOutlined";
// import MinusOutlined from "@ant-design/icons/MinusOutlined";

// import PlayCircleTwoTone from "@ant-design/icons/PlayCircleTwoTone"
// import PauseCircleTwoTone from "@ant-design/icons/PauseCircleTwoTone";


// const sidebarMenu = [
//   {
//     key: "all",
//     href: "workbenches",
//     title: "All Workbenches",
//     icon: () => <Sidebar.MenuIcon icon="fa fa-code" />,
//   },
//   {
//     key: "my",
//     href: "workbenches/my",
//     title: "My Workbenches",
//     icon: () => <Sidebar.ProfileImage user={currentUser} />,
//   },
// ];

// // Updated by wgkim 2023-04-20 : 화면에서 리스트 뿌리는 부분의 헤더 및 컬럼과 기능을 담당하는 부분
// // Updated by wgkim 2023-05-02 : api/workbenches의 정보에 맞게 변경 

// function WorkbenchesListExtraActions(props) {
//   return <DynamicComponent name="WorkbenchesList.Actions" {...props} />;
// }

// function WorkbenchesList({ controller }) {
//   const listColumns = [
//     Columns.checkbox({ className: "p-r-0", onChange: handleCheckboxChange}),
//     Columns.custom.sortable(
//       (text, item) => (
//         <React.Fragment>
//           <Link className="table-main-title" href={"workbenches/" + item.id}>
//             {item.name}
//           </Link>
//           {/* <WorkbenchTagsControl className="d-block" tags={item.tags} isDraft={item.is_draft} isArchived={item.is_archived} /> */}
//         </React.Fragment>
//       ),
//       {
//         title: "Name",
//         field: "name",
//         width: null,
//       }
//     ),
//     Columns.custom.sortable((text, item) => {return(text + '/' + item.column_name)}, {
//       title: "Target",
//       field: "table_name",
//       width: "1%",
//     }),
//     Columns.custom.sortable((text, item) => text, {
//       title: "Model Type",
//       field: "train_model_type_id",
//       width: "1%",
//     }),
//     Columns.custom((text, item) => <Button>Edit</Button>, {
//       title: "Param Info",
//       width: "1%",
//     }),
//     Columns.date.sortable({ title: "Created at", field: "created_at", width: "1%" }),
//     Columns.date.sortable({ title: "Trained at", field: "retrieved_at", orderByField: "executed_at", width: "1%", }),
//     Columns.custom((text, item) => item.user.name, { title: "Creator", width: "1%" }),
//     Columns.custom((text, item) => {
//       if (text === 'INITIAL' ||  text === 'CANCELED') {
//         return ( <><MinusOutlined/> {text}</> )
//       }
//       else if (text === 'QUEUED' || text === 'RUNNING') {
//         return (<><ClockCircleOutlined/> {text}</>)
//       }
//       else {  // if (text === 'END')
//         return ( <><CheckOutlined/> {text}</> )
//       }  
//     }, {
//       title: "Train Status",
//       field: "train_status_cd",
//       width: "1%",
//     }),
//     Columns.custom((text, item) => { 
//       return (
//         <>
//           {(text === 'INITIAL' ||  text === 'CANCLED' || text === 'END') ? (
//             <h3><PlayCircleTwoTone/></h3>
//           ) : (  // else if (text === 'QUEUED' || text === 'RUNNING') 
//             <h3><PauseCircleTwoTone/></h3>
//           )}
//         </>
//     )}, {
//       title: " ",
//       field: "train_status_cd",
//       width: "1%",
//     }),
//   ];
  
//   const controllerRef = useRef();
//   controllerRef.current = controller;

//   useEffect(() => {
//     const unlistenLocationChanges = location.listen((unused, action) => {
//       const searchTerm = location.search.q || "";
//       if (action === "PUSH" && searchTerm !== controllerRef.current.searchTerm) {
//         controllerRef.current.updateSearch(searchTerm);
//       }
//     });

//     return () => {
//       unlistenLocationChanges();
//     };
//   }, []);

//   const {
//     areExtraActionsAvailable,
//     listColumns: tableColumns,
//     Component: ExtraActionsComponent,
//     selectedItems,
//   } = useItemsListExtraActions(controller, listColumns, WorkbenchesListExtraActions);

//   const [isDeleteAble, setIsDeleteAble] = useState(true);
//   function handleCheckboxChange(checked) {
//       setIsDeleteAble(checked)
//   }

//   return (
//     <div className="page-workbenches-list">
//       <div className="container">
//         <PageHeader
//           title={controller.params.pageTitle}
//           actions={
//               // <Link.Button block type="primary" href="workbenches/new">
//               //   <i className="fa fa-plus m-r-5" aria-hidden="true" />
//               //   New Model
//               // </Link.Button>
//               <>
//                 <Link.Button block type="primary" onClick={() => CreateWorkbenchDialog.showModal()} style={{ display: 'inline-block' }}>
//                   <i className="fa fa-plus m-r-5" aria-hidden="true" /> New WB
//                 </Link.Button>
//                 <Link.Button block className={isDeleteAble? "ant-btn ant-btn-danger" : "ant-btn"} onClick={() => CreateWorkbenchDialog.showModal()} style={{ display: 'inline-block'}}>
//                   <i className="fa fa-minus m-r-5" aria-hidden="true" /> Delete WB
//                 </Link.Button>
//               </>
//           }
//         />
//         <Layout>
//           <Layout.Sidebar className="m-b-0">
//             <Sidebar.SearchInput
//               placeholder="Search Workbenches..."
//               label="Search workbenches"
//               value={controller.searchTerm}
//               onChange={controller.updateSearch}
//             />
//             <Sidebar.Menu items={sidebarMenu} selected={controller.params.currentPage} />
//             {/* <Sidebar.Tags url="api/workbenches/tags" onChange={controller.updateSelectedTags} showUnselectAll /> */}
//           </Layout.Sidebar>
//           <Layout.Content>
//             {controller.isLoaded && controller.isEmpty ? (
//               <WorkbenchesListEmptyState
//                 page={controller.params.currentPage}
//                 searchTerm={controller.searchTerm}
//                 // selectedTags={controller.selectedTags}
//               />
//             ) : (
//               <React.Fragment>
//                 <div className={cx({ "m-b-10": areExtraActionsAvailable })}>
//                   <ExtraActionsComponent selectedItems={selectedItems} />
//                 </div>
//                 <div className="bg-white tiled table-responsive">
//                   <ItemsTable
//                     items={controller.pageItems}
//                     loading={!controller.isLoaded}
//                     columns={tableColumns}
//                     orderByField={controller.orderByField}
//                     orderByReverse={controller.orderByReverse}
//                     toggleSorting={controller.toggleSorting}
//                   />
//                   <Paginator
//                     showPageSizeSelect
//                     totalCount={controller.totalItemsCount}
//                     pageSize={controller.itemsPerPage}
//                     onPageSizeChange={itemsPerPage => controller.updatePagination({ itemsPerPage })}
//                     page={controller.page}
//                     onChange={page => controller.updatePagination({ page })}
//                   />
//                 </div>
//               </React.Fragment>
//             )}
//           </Layout.Content>
//         </Layout>
//       </div>
//     </div>
//   );
// }

// WorkbenchesList.propTypes = {
//   controller: ControllerType.isRequired,
// };

// const WorkbenchesListPage = itemsList(
//   WorkbenchesList,
//   () =>
//     new ResourceItemsSource({
//       getResource({ params: { currentPage } }) {
//         return {
//           all: Workbench.workbenches.bind(Workbench),
//           my: Workbench.myWorkbenches.bind(Workbench),
//           favorites: Workbench.favorites.bind(Workbench),
//           archive: Workbench.archive.bind(Workbench),
//         }[currentPage];
//       },
//       getItemProcessor() {
//         return item => new Workbench(item);
//       },
//     }),
//   () => new UrlStateStorage({ orderByField: "created_at", orderByReverse: true })
// );

// routes.register(
//   "Workbenches.List",
//   routeWithUserSession({
//     path: "/workbenches",
//     title: "Workbenches",
//     render: pageProps => <WorkbenchesListPage {...pageProps} currentPage="all" />,
//   })
// );
// routes.register(
//   "Workbenches.Favorites",
//   routeWithUserSession({
//     path: "/workbenches/favorites",
//     title: "Favorite Workbenches",
//     render: pageProps => <WorkbenchesListPage {...pageProps} currentPage="favorites" />,
//   })
// );
// routes.register(
//   "Workbenches.Archived",
//   routeWithUserSession({
//     path: "/workbenches/archive",
//     title: "Archived Workbenches",
//     render: pageProps => <WorkbenchesListPage {...pageProps} currentPage="archive" />,
//   })
// );
// routes.register(
//   "Workbenches.My",
//   routeWithUserSession({
//     path: "/workbenches/my",
//     title: "My Workbenches",
//     render: pageProps => <WorkbenchesListPage {...pageProps} currentPage="my" />,
//   })
// );

