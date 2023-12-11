from tests import BaseTestCase
#from redash import models
from redash.models import db

from redash.models import User, Organization, Query

# Added by jscho 2023-04-24
class TestWorkbenchListResourceGet(BaseTestCase):

    def test_get_all_workbenches(self):

        user_name = 'wgkim'
        org_name = 'BA'
        current_user = self.db.session.query(User).filter_by(name=user_name).first()
        current_org = self.db.session.query(Organization).filter_by(name=org_name).first()

        print(current_user)
        print(current_org)

        # When의 경우 주로 api 요청을 보냄
        rv = self.make_request("get", "/api/workbenches", user=current_user, org=current_org)

        print(rv.json)
        
        # Then의 경우 기본 assert나 unittest라이브러리의 assertEqual과 같은 기능을 이용
        self.assertEqual(rv.status_code, 200)
        self.assertEqual(len(rv.json["results"]), 1)

    def test_get_query_result(self):
        pass

    def test_get_job(self):
        pass


class TestWorkbenchListResourcePost(BaseTestCase):
    def test_insert_workbench(self):

        user_name = 'wgkim'
        org_name = 'BA'
        current_user = self.db.session.query(User).filter_by(name=user_name).first()
        current_org = self.db.session.query(Organization).filter_by(name=org_name).first()

        rv = self.make_request(
            "post",
            "/api/workbenches",
            data = {
                "name": "Testing",
                "query": "SELECT 1 FROM IRIS LIMIT 1",
                "data_source_id": 3,
                "table_name": "Ttable",
                "column_name": "tcol",
                "train_model_type_id": "T1",
                "train_status_cd": "OK"
            },
            user=current_user,
            org=current_org
        )

        self.assertEqual(rv.status_code, 200)


class TestWorkbenchResourcePost(BaseTestCase):
     def test_update_workbench(self):

        user_name = 'wgkim'
        org_name = 'BA'
        current_user = self.db.session.query(User).filter_by(name=user_name).first()
        current_org = self.db.session.query(Organization).filter_by(name=org_name).first()

        id = 1
        column_name = 'PETAL_WIDTH'
        rv = self.make_request(
            "post",
            "/api/workbenches/{}".format(id),
            data={
                "query": "select * from iris LIMIT 20",
                "workbench_id": id,
                "column_name": column_name
            },
            user=current_user,
            org=current_org
        )

        print(rv.json)
        
        self.assertEqual(rv.status_code, 200)

class TestWorkbenchResourceDelete(BaseTestCase):
     def test_delete_workbench(self):

        user_name = 'wgkim'
        org_name = 'BA'
        current_user = self.db.session.query(User).filter_by(name=user_name).first()
        current_org = self.db.session.query(Organization).filter_by(name=org_name).first()

        id = 5
        rv = self.make_request(
            "delete",
            "/api/workbenches/{}".format(id),
            user=current_user,
            org=current_org
        )

        print(rv)
        
        self.assertEqual(rv.status_code, 200)
