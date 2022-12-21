import cx_Oracle

connection = cx_Oracle.connect('RND', 'RND', 'ba.bimatrix.co.kr:1521/XE')
cursor = connection.cursor()


def query(query: str):
    cursor.execute(query)
    datas = cursor.fetchall()
    names = [row[0] for row in cursor.description]
    return {'names': names, 'datas': datas}


def close():
    cursor.close()
    connection.close()


if __name__ == '__main__':
    print(query('select * from iris'))
    close()
