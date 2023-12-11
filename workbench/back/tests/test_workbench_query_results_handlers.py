from redash.query_runner import BaseSQLQueryRunner, BaseQueryRunner
from tests import BaseTestCase

from redash.models import db
from redash.utils import json_dumps
from redash.handlers.query_results import error_messages

from redash.models import User, Organization, Workbench


# Added by jscho 2023-04-27
class TestWorkbenchQueryResultsCacheHeaders(BaseTestCase):
    def test_uses_cache_headers_for_specific_result(self):

        user_name = 'wgkim'
        org_name = 'BA'
        current_user = self.db.session.query(User).filter_by(name=user_name).first()
        current_org = self.db.session.query(Organization).filter_by(name=org_name).first()

        workbench_query_id = 1
        workbench_query_result_id = 18
        
        rv = self.make_request(
            "get", "/api/workbenches/{}/results/{}.json".format(workbench_query_id, workbench_query_result_id),
            user=current_user, org=current_org
        )

        print(rv.json)

        #self.assertIn("Cache-Control", rv.headers)

# Added by jscho 2023-04-28
class WorkbenchQueryResultListAPI(BaseTestCase):

    def test_execute_new_query(self):

        user_name = 'wgkim'
        org_name = 'BA'
        current_user = self.db.session.query(User).filter_by(name=user_name).first()
        current_org = self.db.session.query(Organization).filter_by(name=org_name).first()

        id = 1
        workbench = self.db.session.query(Workbench).filter_by(id=id).first()

        rv = self.make_request(
            "post",
            "/api/workbench_results",
            data={
                "data_source_id": workbench.data_source_id,
                "workbench": workbench.query_text,
                "workbench_id": workbench.id,
                "max_age": 0,
            },
            user=current_user,
            org=current_org
        )

        print(rv.json)
        
        self.assertEqual(rv.status_code, 200)
        self.assertIn("workbench_query_result", rv.json)

