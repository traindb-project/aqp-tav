import "./home/Home";

import "./admin/Jobs";
import "./admin/OutdatedQueries";
import "./admin/SystemStatus";

import "./alerts/AlertsList";
import "./alert/Alert";

import "./dashboards/DashboardList";
import "./dashboards/DashboardPage";
import "./dashboards/PublicDashboardPage";

import "./data-sources/DataSourcesList";
import "./data-sources/EditDataSource";

import "./destinations/DestinationsList";
import "./destinations/EditDestination";

import "./groups/GroupsList";
import "./groups/GroupDataSources";
import "./groups/GroupMembers";

import "./queries-list/QueriesList";
import "./queries/QuerySource";
import "./queries/QueryView";
import "./queries/VisualizationEmbed";

// UPDATE wgkim 2023-04-13 : 라우트 객체가 URL 등록을 위해 routes.register가 존재하는 컴포넌트 파일 경로에 대한 import 필요
// 신규 URL 생성시 'import "<폴더명>/<컴포넌트(jsx 없이)>"' 작성
import "./tdb-workbenches/WorkbenchSource";
import "./tdb-workbenches/WorkbenchView";
import "./tdb-workbenches-list/WorkbenchesList";

import "./tdb-workbenches-list/TrainModelList"
import "./tdb-workbenches/TrainModelSource"

import "./query-snippets/QuerySnippetsList";

import "./settings/OrganizationSettings";

import "./users/UsersList";
import "./users/UserProfile";
