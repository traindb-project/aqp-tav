from tests import BaseTestCase

from redash.models import DataSource, WorkbenchQueryResult


class WorkbenchQueryResultTest(BaseTestCase):

    def test_get_latest_returns_when_found(self):
        data_source_name = 'BA30'
        current_data_source = self.db.session.query(DataSource).filter_by(name=data_source_name).first()

        found_workbench_query_result = WorkbenchQueryResult.get_latest(
            current_data_source, "select * from iris LIMIT 1000", 1000000000
        )

        print(found_workbench_query_result)

        self.assertIsNotNone(found_workbench_query_result)