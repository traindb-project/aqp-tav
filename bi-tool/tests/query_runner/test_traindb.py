from unittest import TestCase
import os

from redash.query_runner import (
    get_configuration_schema_for_query_runner_type,
    query_runners,
    NotSupported,
    get_query_runner
)

from redash.query_runner.traindb import TrainDB


class TestTrainDBSchema(TestCase):
    def test_get_schema(self):
       schema = 'instacart'
       configuration = {'driver': os.environ.get('TRAINDB_DRIVER'),
                    'url': os.environ.get('TRAINDB_URL'),
                    'user': os.environ.get('TRAINDB_USER'),
                    'password': os.environ.get('TRAINDB_PW'),
                    'schema': schema,
                    'jdbc_driver': os.environ.get('TRAINDB_JDBC_DRIVER')
                }
       runner = get_query_runner('traindb', configuration)

       print(runner.get_schema())

class TestTrainDB(TestCase):
    def test_run_query(self):
        schema = 'instacart'
        configuration = {'driver': os.environ.get('TRAINDB_DRIVER'),
                    'url': os.environ.get('TRAINDB_URL'),
                    'user': os.environ.get('TRAINDB_USER'),
                    'password': os.environ.get('TRAINDB_PW'),
                    'schema': schema,
                    'jdbc_driver': os.environ.get('TRAINDB_JDBC_DRIVER')
                }
        runner = get_query_runner('traindb', configuration)

        query = 'bypass select * from instacart.order_products limit 100'
        print(runner.run_query(query, None))

