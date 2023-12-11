from tests import BaseTestCase

import jaydebeapi
import os

class TestTrainDBConnect(BaseTestCase):
   def __init__(self, methodName: str = "runTest") -> None:
      super().__init__(methodName)

      self.driver = os.environ.get('TRAINDB_DRIVER')
      self.url = os.environ.get('TRAINDB_URL')
      self.user = os.environ.get('TRAINDB_USER')
      self.password = os.environ.get('TRAINDB_PW')
      self.jdbc_driver = os.environ.get('TRAINDB_JDBC_DRIVER')

      self.test_query = 'SHOW TABLES;'

   def test_traindb(self):
      try:
         # Updated by wgkim 2023-07-26 : 환경변수를 통해 데이터를 얻어오도록 변경
         conn = jaydebeapi.connect(
            self.driver,
            self.url,
            [self.user, self.password],
            self.jdbc_driver
         )
         curs = conn.cursor()

         curs.execute(self.test_query)
         rs = curs.fetchall()
         print(rs)

      finally:
         curs.close()
         conn.close()
