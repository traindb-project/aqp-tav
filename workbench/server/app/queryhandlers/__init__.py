from typing import List

import jaydebeapi
from fastapi import HTTPException, status

from env import TRAINDB_DRIVER_PATH


class BaseQueryHandler(object):
    def __init__(
            self,
            scheme: str,
            host: str,
            port: int | str,
            username: str | None,
            password: str | None,
            server_host: str | None = None,
            server_port: int | str | None = None,
    ):
        self.scheme = scheme
        self.host = host
        self.port = port
        self.driver_class = "traindb.jdbc.Driver"
        self.username = username
        self.password = password
        self.server_host = server_host
        self.server_port = server_port

    def make_connect_query(self):
        queries: List[str] = []
        if self.server_host is not None:
            queries.append(f"server.host={self.server_host}")
        if self.server_port is not None:
            queries.append(f"server.port={self.server_port}")
        return "&".join(queries)

    def make_base_url(self):
        return f"{self.scheme}://{self.host}:{self.port}"

    def make_connect_url(self):
        url = self.make_base_url()
        queries = self.make_connect_query()
        if queries:
            url += f"?{queries}"
        return url

    def connect(self):
        url = self.make_connect_url()
        print("Connecting to", url)
        driver_args = [self.username, self.password] if self.username and self.password else None
        return jaydebeapi.connect(
            self.driver_class,
            url,
            driver_args,
            str(TRAINDB_DRIVER_PATH)
        )

    def test_connection(self) -> bool:
        try:
            self.execute_query("SELECT 1")
            return True
        except Exception as e:
            print(e)
            return False

    def execute_query(self, query: str):
        try:
            with self.connect() as conn:
                with conn.cursor() as cursor:
                    print("EXECUTE QUERY:", query)
                    cursor.execute(query)
                    return cursor.fetchall()
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

    def execute_query_and_fetch_one(self, query: str):
        try:
            with self.connect() as conn:
                with conn.cursor() as cursor:
                    print("EXECUTE QUERY:", query)
                    cursor.execute(query)
                    return cursor.fetchone()
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

    def execute_query_and_description(self, query: str):
        try:
            with self.connect() as conn:
                with conn.cursor() as cursor:
                    print("EXECUTE QUERY:", query)
                    columns = []
                    types = []
                    cursor.execute(query)
                    meta = cursor._rs.getMetaData()
                    col_count = meta.getColumnCount()
                    for i in range(1, col_count + 1):
                        columns.append(meta.getColumnName(i))
                        types.append(meta.getColumnTypeName(i))
                    data = cursor.fetchall()
                    return {
                        "columns": columns,
                        "types": types,
                        "data": data,
                    }
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

    def execute_statement(self, query: str, *args, **kwargs):
        try:
            with self.connect() as conn:
                with conn.jconn.createStatement() as stmt:
                    print(f"EXECUTE STATEMENT: {query}")
                    stmt.execute(query, *args, **kwargs)
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

    def show_modeltypes(self):
        return self.execute_query("SHOW MODELTYPES")

    def show_models(self):
        return self.execute_query("SHOW MODELS")

    def show_trainings(self):
        return self.execute_query("SHOW TRAININGS")

    def show_hyperparameters(self):
        return self.execute_query("SHOW HYPERPARAMETERS")

    def show_dbs(self):
        return self.execute_query("SHOW DATABASES")

    def show_synopses(self):
        return self.execute_query("SHOW SYNOPSES")

    def show_tables(self):
        return self.execute_query("SHOW TABLES")

    def describe_table(self, schema: str, table: str):
        return self.execute_query(f"DESCRIBE {schema}.{table}")


class TrainDBQueryHandler(BaseQueryHandler):
    def __init__(self, host: str, port: int | str, username: str | None, password: str | None):
        super().__init__("jdbc:traindb", host, port, username, password)


class DatabaseQueryHandler(BaseQueryHandler):
    def __init__(
            self,
            dbms: str,
            host: str,
            port: int | str,
            username: str | None,
            password: str | None,
            server_host: str | None,
            server_port: int | str | None
    ):
        super().__init__(f"jdbc:traindb:{dbms}", host, port, username, password, server_host, server_port)
        self.dbms = dbms

    def make_base_url(self):
        if self.dbms == 'kairos':
            return super().make_base_url() + '/nam'
        return super().make_base_url()
