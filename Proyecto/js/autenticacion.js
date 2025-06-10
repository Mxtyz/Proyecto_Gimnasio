// js/autenticacion.js

document.addEventListener('DOMContentLoaded', () => {
    // Referencias a los formularios (ajustados a tus IDs HTML)
    const loginForm = document.getElementById('formulario-login');
    const registerForm = document.getElementById('formulario-registro');
    const forgotPasswordForm = document.getElementById('formulario-enviar-codigo'); // Este es el formulario de "enviar código" en la vista de recuperar

    // Referencias a las vistas (ajustadas a tus IDs HTML)
    const loginView = document.getElementById('vista-login');
    const registerView = document.getElementById('vista-registro');
    const forgotPasswordView = document.getElementById('vista-recuperar');

    // Referencias a los botones de navegación (ajustados a tus IDs HTML y clases)
    const showRegisterLink = document.getElementById('btn-registro'); // El botón para ir a registrarse
    const showForgotPasswordLink = document.getElementById('btn-olvide-password'); // El botón para ir a recuperar contraseña
    const backToLoginLink = document.querySelectorAll('.boton-volver'); // Tus botones de "Volver al inicio de sesión"


    const messageDiv = document.getElementById('mensaje-registro'); // Usaremos este para mensajes de registro
    const loginMessageDiv = document.getElementById('error-login'); // Para mensajes de login
    const recoverMessageDiv = document.getElementById('mensaje-recuperar'); // Para mensajes de recuperar

    // Función para mostrar una vista
    function showView(viewToShow) {
        loginView.classList.remove('activa');
        registerView.classList.remove('activa');
        forgotPasswordView.classList.remove('activa');

        // Limpiar todos los mensajes al cambiar de vista
        messageDiv.textContent = '';
        messageDiv.classList.add('oculto'); // Asumo que tienes una clase 'oculto' para esconder
        loginMessageDiv.textContent = '';
        loginMessageDiv.classList.add('oculto');
        recoverMessageDiv.textContent = '';
        recoverMessageDiv.classList.add('oculto');


        viewToShow.classList.add('activa');
    }

    // --- Lógica de Navegación entre Vistas ---
    if (showRegisterLink) {
        showRegisterLink.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Clic en "Registrarse"'); // Para depuración
            showView(registerView);
        });
    }

    if (showForgotPasswordLink) {
        showForgotPasswordLink.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Clic en "Olvidé contraseña"'); // Para depuración
            showView(forgotPasswordView);
        });
    }

    // `backToLoginLink` es una NodeList, necesitamos iterar sobre ella
    backToLoginLink.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Clic en "Volver al login"'); // Para depuración
            showView(loginView);
        });
    });

    // --- Lógica de Autenticación con el Backend ---
    const API_URL = 'http://localhost:3000/api'; // Asegúrate de que esta URL coincida con tu backend

    // Función para mostrar mensajes (adaptada para tus IDs de mensaje)
    function displayMessage(targetDiv, type, text) {
        targetDiv.classList.remove('mensaje-error', 'mensaje-exito', 'oculto');
        targetDiv.classList.add('mensaje', `mensaje-${type}`);
        targetDiv.textContent = text;
        if (type === 'error') {
            targetDiv.classList.remove('oculto'); // Asegúrate de que los errores se muestren
        }
        // Puedes agregar un timeout para ocultar mensajes de éxito si quieres
        if (type === 'exito') {
            setTimeout(() => {
                targetDiv.classList.add('oculto');
                targetDiv.textContent = '';
            }, 3000);
        }
    }


    // Manejar el envío del formulario de REGISTRO
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            // Asegúrate que estos IDs coincidan con tu HTML de registro
            const rut = document.getElementById('rut').value;
            const nombre = document.getElementById('nombre').value;
            const apellido = document.getElementById('apellido').value;
            const correo = document.getElementById('email-registro').value; // email-registro
            const contraseña = document.getElementById('password-registro').value; // password-registro
            const confirmarContraseña = document.getElementById('confirmar-password-registro').value; // nuevo
            const tipoUsuario = document.getElementById('tipo-usuario').value;
            const telefono = document.getElementById('telefono').value;

            if (contraseña !== confirmarContraseña) {
                displayMessage(messageDiv, 'error', 'Las contraseñas no coinciden.');
                return;
            }

            try {
                const response = await fetch(`${API_URL}/register`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ rut, nombre, apellido, correo, contraseña, tipoUsuario, telefono }),
                });

                const data = await response.json();

                if (response.ok) {
                    displayMessage(messageDiv, 'exito', data.message);
                    registerForm.reset(); // Limpiar el formulario
                    setTimeout(() => showView(loginView), 2000); // Volver al login después de 2 segundos
                } else {
                    displayMessage(messageDiv, 'error', data.message || 'Error en el registro.');
                }
            } catch (error) {
                console.error('Error de red al registrar:', error);
                displayMessage(messageDiv, 'error', 'Error al conectar con el servidor. Inténtalo de nuevo.');
            }
        });
    }

    // Manejar el envío del formulario de LOGIN
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            // Asegúrate que estos IDs coincidan con tu HTML de login
            const nombre_usuario = document.getElementById('email-login').value; // Ahora usas email-login
            const contraseña = document.getElementById('password-login').value; // password-login

            try {
                const response = await fetch(`${API_URL}/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ nombre_usuario, contraseña }),
                });

                const data = await response.json();

                if (response.ok) {
                    displayMessage(loginMessageDiv, 'exito', data.message);
                    localStorage.setItem('accessToken', data.accessToken);
                    localStorage.setItem('tipoUsuario', data.tipoUsuario);
                    localStorage.setItem('userRut', data.rut);
                    localStorage.setItem('userName', data.nombre);

                    // --- CAMBIO HECHO AQUÍ ---
                    window.location.href = 'tablero.html';
                    // --------------------------

                } else {
                    displayMessage(loginMessageDiv, 'error', data.message || 'Error de inicio de sesión.');
                }
            } catch (error) {
                console.error('Error de red al iniciar sesión:', error);
                displayMessage(loginMessageDiv, 'error', 'Error al conectar con el servidor al iniciar sesión.');
            }
        });
    }

    // Lógica para el formulario de recuperación de contraseña (formulario-enviar-codigo)
    // No se implementa la parte del backend para esto, solo el feedback visual
    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener('submit', (e) => {
            e.preventDefault();
            // Lógica para enviar solicitud de recuperación
            const emailRecuperar = document.getElementById('email-recuperar').value;
            document.getElementById('email-enviado').textContent = emailRecuperar; // Mostrar el email
            displayMessage(recoverMessageDiv, 'exito', 'Si tu correo está registrado, recibirás un enlace para restablecer tu contraseña.');

            // Opcional: Avanzar al siguiente paso (verificar código)
            document.getElementById('paso-enviar-codigo').classList.remove('activo');
            document.getElementById('paso-verificar-codigo').classList.add('activo');
            // Nota: Aquí se asume que tienes manejo de pasos en tu HTML para la recuperación
            // Es decir, divs con IDs paso-enviar-codigo, paso-verificar-codigo, paso-nueva-password
        });
    }

    // Lógica para el botón "Volver al inicio de sesión" dentro del formulario de recuperación
    const btnVolverLoginRecuperar = document.getElementById('btn-volver-login');
    if (btnVolverLoginRecuperar) {
        btnVolverLoginRecuperar.addEventListener('click', (e) => {
            e.preventDefault();
            showView(loginView);
        });
    }
    // Lógica para el botón "Volver al inicio de sesión" dentro del formulario de registro
    const btnVolverLoginRegistro = document.getElementById('btn-volver-login-registro');
    if (btnVolverLoginRegistro) {
        btnVolverLoginRegistro.addEventListener('click', (e) => {
            e.preventDefault();
            showView(loginView);
        });
    }
});