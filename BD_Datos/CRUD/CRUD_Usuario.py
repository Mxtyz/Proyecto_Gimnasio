from Conexion import obtener_conexion

def crear_usuario(rut, nombre, apellido, correo, contrasena, tipo, telefono):
    conexion = obtener_conexion()
    cursor = conexion.cursor()
    try:
        cursor.execute("""
            INSERT INTO Usuario (Rut, Nombre, Apellido, Correo, Contraseña, TipoUsuario, Telefono)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (rut, nombre, apellido, correo, contrasena, tipo, telefono))
        conexion.commit()
        print("Usuario creado correctamente.")
    except Exception as e:
        print("Error al crear usuario:", e)
    finally:
        cursor.close()
        conexion.close()

def leer_usuario(rut):
    conexion = obtener_conexion()
    cursor = conexion.cursor()
    try:
        cursor.execute("SELECT * FROM Usuario WHERE Rut = %s", (rut,))
        usuario = cursor.fetchone()
        if usuario:
            print("👤 Usuario encontrado:", usuario)
        else:
            print("⚠️ Usuario no encontrado.")
    except Exception as e:
        print("Error al leer usuario:", e)
    finally:
        cursor.close()
        conexion.close()

def actualizar_usuario(rut, telefono=None, contrasena=None):
    conexion = obtener_conexion()
    cursor = conexion.cursor()
    try:
        if telefono:
            cursor.execute("UPDATE Usuario SET Telefono = %s WHERE Rut = %s", (telefono, rut))
        if contrasena:
            cursor.execute("UPDATE Usuario SET Contraseña = %s WHERE Rut = %s", (contrasena, rut))
        conexion.commit()
        print("Usuario actualizado.")
    except Exception as e:
        print("Error al actualizar usuario:", e)
    finally:
        cursor.close()
        conexion.close()

def eliminar_usuario(rut):
    conexion = obtener_conexion()
    cursor = conexion.cursor()
    try:
        cursor.execute("DELETE FROM Usuario WHERE Rut = %s", (rut,))
        conexion.commit()
        print("🗑️ Usuario eliminado.")
    except Exception as e:
        print("Error al eliminar usuario:", e)
    finally:
        cursor.close()
        conexion.close()
