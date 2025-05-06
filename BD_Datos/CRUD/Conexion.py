import psycopg2

def obtener_conexion():
    return psycopg2.connect(
        user='postgres',
        password='password',
        host='127.0.0.1',
        port='5432',
        database='Proyecto_Gym'
    )
