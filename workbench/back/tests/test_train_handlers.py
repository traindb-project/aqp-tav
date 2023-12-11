from tests import BaseTestCase

from redash.models import User, Organization

class TestTrainModelsResourceGet(BaseTestCase):

    def test_show_models(self):

        user_name = 'wgkim'
        org_name = 'BA'
        current_user = self.db.session.query(User).filter_by(name=user_name).first()
        current_org = self.db.session.query(Organization).filter_by(name=org_name).first()

        print(current_user)
        print(current_org)

        # When의 경우 주로 api 요청을 보냄
        rv = self.make_request("get", "/api/train_models", user=current_user, org=current_org)

        print(rv.json)
        
        # Then의 경우 기본 assert나 unittest라이브러리의 assertEqual과 같은 기능을 이용
        self.assertEqual(rv.status_code, 200)

class TestTrainModelsResourcePost(BaseTestCase):

    def test_train_models(self):

        user_name = 'wgkim'
        org_name = 'BA'
        current_user = self.db.session.query(User).filter_by(name=user_name).first()
        current_org = self.db.session.query(Organization).filter_by(name=org_name).first()

        rv = self.make_request(
            "post",
            "/api/train_models",
            data={
                "model_name": "tgan_bi_test",
                "model_type": "tablegan",
                "table_name": "instacart.order_products",
                "table_columns": ["reordered", "add_to_cart_order"],
                "options": ["'epochs' = 100"],
            },
            user=current_user,
            org=current_org
        )

        print(rv.json)

class TestTrainModelsResourceDelete(BaseTestCase):

    def test_train_models(self):

        user_name = 'wgkim'
        org_name = 'BA'
        current_user = self.db.session.query(User).filter_by(name=user_name).first()
        current_org = self.db.session.query(Organization).filter_by(name=org_name).first()

        model_name = "tgan_bi_test"
        rv = self.make_request("delete",
            "/api/train_models/{}".format(model_name),
            user=current_user,
            org=current_org
        )

        print(rv.json)

class TrainTargetPreviewResourceAPI(BaseTestCase):

    def test_execute_new_query(self):

        user_name = 'wgkim'
        org_name = 'BA'
        current_user = self.db.session.query(User).filter_by(name=user_name).first()
        current_org = self.db.session.query(Organization).filter_by(name=org_name).first()

        rv = self.make_request(
            "post",
            "/api/train_target_preview",
            data={
                "data_source_id": "3",
                "query": "select * from iris LIMIT 1000",
            },
            user=current_user,
            org=current_org
        )

        print(rv.json)
        
        self.assertEqual(rv.status_code, 200)
        self.assertIn("columns", rv.json)
        self.assertIn("rows", rv.json)