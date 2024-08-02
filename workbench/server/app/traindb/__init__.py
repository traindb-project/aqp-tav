import jaydebeapi
import os

jar_path = os.environ["TRAINDB_JAR_PATH"]
driver_class = "traindbs.jdbc.Driver"


class BaseDB(object):
    def __init__(self, host: str, port: int, user: str, password: str):
        self.host = host
        self.port = port
        self.user = user
        self.password = password

    def execute_query(self, query: str):
        with jaydebeapi.connect(driver_class, ) as conn:
            pass
