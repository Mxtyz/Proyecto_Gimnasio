from CRUD_Usuario import crear_usuario, leer_usuario, actualizar_usuario, eliminar_usuario

def menu():
    while True:
        print("\n--- MENÚ USUARIO ---")
        print("1. Crear usuario")
        print("2. Leer usuario")
        print("3. Actualizar usuario")
        print("4. Eliminar usuario")
        print("5. Salir")
        opcion = input("Seleccione una opción: ")

        if opcion == "1":
            rut = input("RUT: ")
            nombre = input("Nombre: ")
            apellido = input("Apellido: ")
            correo = input("Correo: ")
            contrasena = input("Contraseña: ")
            tipo = input("Tipo de usuario: ")
            telefono = input("Teléfono: ")
            crear_usuario(rut, nombre, apellido, correo, contrasena, tipo, telefono)

        elif opcion == "2":
            rut = input("RUT del usuario a buscar: ")
            leer_usuario(rut)

        elif opcion == "3":
            rut = input("RUT del usuario a actualizar: ")
            telefono = input("Nuevo teléfono (deja en blanco si no se cambia): ")
            contrasena = input("Nueva contraseña (deja en blanco si no se cambia): ")
            actualizar_usuario(rut, telefono if telefono else None, contrasena if contrasena else None)

        elif opcion == "4":
            rut = input("RUT del usuario a eliminar: ")
            eliminar_usuario(rut)

        elif opcion == "5":
            print("Saliendo del programa...")
            break

        else:
            print("Opción inválida.")

if __name__ == "__main__":
    menu()
