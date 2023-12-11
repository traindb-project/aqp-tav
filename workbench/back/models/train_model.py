import os
import logging
import jaydebeapi
import binascii
import jpype
from pathlib import Path

logger = logging.getLogger(__name__)

class TrainModel():

    @classmethod
    def show_modeltypes(cls):
        return cls._execute_query("SHOW MODELTYPES;")

    @classmethod
    def show_models(cls):
        return cls._execute_query("SHOW MODELS;")

    @classmethod
    def show_hyperparameters(cls):
        return cls._execute_query("SHOW HYPERPARAMETERS;")

    @classmethod
    def show_trainings(cls):
        return cls._execute_query("SHOW TRAININGS;")
    
    @classmethod
    def show_synopses(cls):
        return cls._execute_query("SHOW SYNOPSES;")

    @classmethod
    def show_schemas(cls):
        return cls._execute_query("SHOW SCHEMAS;")

    @classmethod
    def show_tables(cls):
        return cls._execute_query("SHOW TABLES;")

    @classmethod
    def show_querylogs(cls):
        return cls._execute_query("SHOW QUERYLOGS;")

    @classmethod
    def show_tasks(cls):
        return cls._execute_query("SHOW TASKS;")

    @classmethod
    def train_model(cls, **kwargs):
        target = kwargs["table_name"].replace(' ', '_') + "( "+ ", ".join(kwargs["table_columns"]) +" )"
        sql = "TRAIN MODEL  "+ kwargs["model_name"] + \
                " MODELTYPE "+ kwargs["model_type"] + \
                "    ON     "+ target + \
                " OPTIONS ('epochs' = 1)"
                # " OPTIONS ( "+ ", ".join(kwargs["options"]) +" )"

        # sql = "TRAIN MODEL New_Model MODELTYPE remote_tablegan ON instacart_small.order_products( reordered ) OPTIONS ('epochs' = 1)"

        logger.debug(f'wgkim sql : {sql}')
        return cls._execute(sql)

    @classmethod
    def drop_model(cls, model_name):
        sql = "DROP MODEL "+ model_name +";"

        print(sql)

        return cls._execute(sql)
    
    # Updated by wgkim 2023-09-20 : 마이그레이션 가져오기 연동을 위한 구조 bind_vars 부분 추가
    @classmethod
    def _execute(cls, sql, hex_string=None):
        connection = None
        cursor = None
        try:
            connection = TrainDBDataSource.get_connection()

            with connection.cursor() as cursor:
                bind_vars = None
                if hex_string:
                    ByteArray = jpype.JArray(jpype.JByte)
                    model_bytes = ByteArray(binascii.unhexlify(hex_string))
                    bind_vars = [model_bytes]

                cursor.execute(sql, bind_vars)

                if sql.split()[0].lower() == 'export':
                    result_byte_array = cursor.fetchone()[0]
                    result_hex = binascii.hexlify(result_byte_array).decode('utf-8')
                    return result_hex

            return cursor.rowcount
        
        except Exception as e:
            logger.debug("Exception occured in _execute function")
            return -1
        finally :
            try:
                if cursor is not None:
                    cursor.close()
            except:
                pass
            try:
                if connection is not None:
                    TrainDBDataSource.close_connection(connection)
            except:
                pass

    @classmethod
    def _to_dict(cls, rows, description):
        columns = [c[0] for c in description] 

        ret = []
        for row in rows :
            one = {}
            for i in range(len(row)):
                one[columns[i]] = row[i]
            ret.append(one)
        return ret

    @classmethod
    def _execute_query(cls, query, ):
        connection = None
        cursor = None
        try:
            connection = TrainDBDataSource.get_connection()

            with connection.cursor() as cursor:
                cursor.execute(query)
                rows = cls._to_dict(cursor.fetchall(), cursor.description)
    
            return rows
        except Exception as e:
            logger.debug("Exception occured in _execute_query function")            
            return None
        finally :
            try:
                if cursor is not None:
                    cursor.close()
            except:
                pass
            try:
                if connection is not None:
                    TrainDBDataSource.close_connection(connection)
            except:
                pass

    # Added by wgkim 2023-09-07 : 마이그레이션 가져오기/내보내기 추가
    @classmethod
    def export_model(cls, model_name):
        sql = f"EXPORT MODEL {model_name}"
        print(sql)
        rs = cls._execute(sql)
        return rs 

    @classmethod
    def import_model(cls, model_name, hex_string):
        sql = f"IMPORT MODEL {model_name} FROM ?"    
        results = cls._execute(sql, hex_string)

        return results

class TrainDBDataSource():

    @classmethod
    def get_connection(cls):
        logger.debug("get_connection entered")
        driver = os.environ.get('TRAINDB_DRIVER')
        url = os.environ.get('TRAINDB_URL')
        user = os.environ.get('TRAINDB_USER')
        password = os.environ.get('TRAINDB_PW')
        jdbc_driver = os.environ.get('TRAINDB_JDBC_DRIVER')
        
        return jaydebeapi.connect(driver, url, [user, password], jdbc_driver)

    @classmethod
    def close_connection(cls, conn):
        conn.close()
