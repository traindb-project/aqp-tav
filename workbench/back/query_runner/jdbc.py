import json
import logging
import os
import jaydebeapi

from redash.query_runner import *
from redash.settings import parse_boolean
from redash.utils import JSONEncoder

logger = logging.getLogger(__name__)
types_map = {
    jaydebeapi.STRING: TYPE_STRING,
    jaydebeapi.TEXT: TYPE_STRING,
    jaydebeapi.NUMBER: TYPE_INTEGER,
    jaydebeapi.FLOAT: TYPE_FLOAT,
    jaydebeapi.DECIMAL: TYPE_FLOAT,
    jaydebeapi.DATE: TYPE_DATE,
    jaydebeapi.DATETIME: TYPE_DATETIME,
    jaydebeapi.ROWID: TYPE_STRING,
}

class Jdbc(BaseSQLQueryRunner):
    noop_query = "SELECT 1"

    @classmethod
    def configuration_schema(cls):
        schema = {
            'type': 'object',
            'properties': {
                'driver': {
                    'type': 'string',
                    'default': 'org.postgresql.Driver',
                },
                'url': {
                    'type': 'string',
                    'default': 'jdbc:postgresql://172.19.0.9:5432/postgres',
                },
                'user': {
                    'type': 'string',
                    'default': 'postgres'
                },
                'password': {
                    'type': 'string',
                },
                'jdbc_driver': {
                    'type': 'string',
                    'default': '/app/db-lib/postgresql-42.2.27.jre7.jar'
                }

            },
            "order": ['driver', 'url', 'user', 'password', 'jdbc_driver'],
            'required': ['driver', 'url', 'user', 'password', 'jdbc_driver'],
            'secret': ['password']
        }

        return schema

    @classmethod
    def name(cls):
        return "jdbc"

    @classmethod
    def enabled(cls):
        try:
            import jaydebeapi
        except ImportError:
            return False

        return True

    def _get_tables(self, schema):
        return []


    def run_query(self, query, user):
        import jaydebeapi

        connection = None
        try:
            driver = self.configuration.get('driver', '')
            url = self.configuration.get('url', '')
            user = self.configuration.get('user', '')
            password = self.configuration.get('password', '')
            jdbc_driver = self.configuration.get('jdbc_driver', '')

            connection = jaydebeapi.connect(driver, url, [user, password], jdbc_driver)

            cursor = connection.cursor()
            logger.info("JDBC running query: %s", query)
            cursor.execute(query)

            data = cursor.fetchall()

            if cursor.description is not None:
                columns = self.fetch_columns([(i[0], types_map.get(i[1], None)) for i in cursor.description])
                rows = [dict(zip((c['name'] for c in columns), row)) for row in data]

                data = {'columns': columns, 'rows': rows}
                json_data = json.dumps(data, cls=JSONEncoder)
                error = None
            else:
                json_data = None
                error = "No data was returned."

            cursor.close()
        except jaydebeapi.Error as e:
            json_data = None
            error = str(e.message)
        except KeyboardInterrupt:
            cursor.close()
            error = "Query cancelled by user."
            json_data = None
        finally:
            if connection:
                connection.close()

        return json_data, error

register(Jdbc)