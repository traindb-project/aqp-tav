import logging
import os

from redash.query_runner import (
    TYPE_FLOAT,
    TYPE_INTEGER,
    TYPE_DATETIME,
    TYPE_STRING,
    TYPE_DATE,
    BaseSQLQueryRunner,
    InterruptException,
    JobTimeoutException,
    register,
)
from redash.settings import parse_boolean
from redash.utils import json_dumps, json_loads

# Updated by wgkim 2023-08-18
import jaydebeapi

enabled = True
# try:
#     import jaydebeapi

#     enabled = True
# except ImportError:
#     enabled = False

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

class TrainDB(BaseSQLQueryRunner):
    noop_query = "SELECT 1"

    @classmethod
    def configuration_schema(cls):
        schema = {
            'type': 'object',
            'properties': {
                'driver': {'type': 'string','default': 'traindb.jdbc.Driver'},
                'url': {'type': 'string','default': 'jdbc:traindb:mysql://'},
                'user': {'type': 'string'},
                'password': {'type': 'string'},
                'schema': {'type': 'string','default': 'instacart'},
                'jdbc_driver': {'type': 'string','default': 'traindb.jar'}
            },
            "order": ['driver', 'url', 'user', 'password', 'jdbc_driver'],
            'required': ['driver', 'url', 'user', 'password', 'jdbc_driver'],
            'secret': ['password']
        }

        return schema

    @classmethod
    def name(cls):
        return "TrainDB"

    @classmethod
    def enabled(cls):
        return enabled

    def _connection(self):
        driver = self.configuration.get('driver', '')
        url = self.configuration.get('url', '')
        user = self.configuration.get('user', '')
        password = self.configuration.get('password', '')
        jdbc_driver = self.configuration.get('jdbc_driver', '')

        connection = jaydebeapi.connect(driver, url, [user, password], jdbc_driver)
        
        return connection

    def _execute(self, connection, query, user):
        cursor = None
        try:
            with connection.cursor() as cursor:
                return cursor.execute(query)

        except Exception as e:
            raise e
        finally :
            try:
                if cursor is not None:
                    cursor.close()
            except:
                pass
        
    def _run_query(self, connection, query, user):
        with connection.cursor() as cursor:
            desc = None
            
            cursor.execute(query)

            data = cursor.fetchall()
            desc = cursor.description

            if desc is not None:
                columns = self.fetch_columns([(i[0], types_map.get(i[1], None)) for i in desc])
                rows = [dict(zip((c['name'] for c in columns), row)) for row in data]

                data = {'columns': columns, 'rows': rows}
                json_data = json_dumps(data)
                error = None
            else:
                json_data = None
                error = "No data was returned."

        return json_data, error

    def _get_tables(self, schema):
        connection = None

        try:
            connection = self._connection()

            schema_name = self.configuration.get('schema', '')

            query = "SHOW COLUMNS"
            if schema_name != '':
                query = query + " WHERE schema_name = '" + schema_name + "'"
            results, error = self._run_query(connection, query, None)

            if error is not None:
                raise Exception("Failed getting table columns.")

            results = json_loads(results)

            for row in results["rows"]:
                table_name = "{}.{}".format(row["schema_name"], row["table_name"])
                if table_name not in schema:
                    schema[table_name] = {"name": table_name, "columns": []}

                schema[table_name]["columns"].append({ "name" : row["column_name"], "type" : row["type_name"]})

            return schema
            
        except Exception as e:
            raise e
        finally:
            try:
                if connection is not None:
                    connection.close()
            except:
                pass

    def run_query(self, query, user):
        connection = None
        cursor = None
        try:
            
            connection = self._connection()

            with connection.cursor() as cursor:
                logger.debug(f"wgkim TrainDB running connection: {connection}")
                logger.debug(f"wgkim TrainDB running query: {query}")
                logger.debug(f"wgkim TrainDB running user: {user}")

                json_data, error = self._run_query(connection, query, user)

        except jaydebeapi.Error as e:
            if not hasattr(e, 'message'):
                pass
            json_data = None
            error = f"{e}"
        except InterruptException:
            json_data = None
            error = "Query cancelled by user."
        except JobTimeoutException:
            json_data = None
            error = "Time out during execution."
        except Exception as e:
            json_data = None
            error = str(e.message)
        finally :
            try:
                if cursor is not None:
                    cursor.close()
            except:
                pass
            try:
                if connection is not None:
                    connection.close()
            except:
                pass

        return json_data, error

register(TrainDB)
