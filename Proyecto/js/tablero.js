// Variables globales
let tabActiva = 'clases';
let usuarioActual = null;
let menuMovilAbierto = false;

// Define la URL de la API
const API_URL = 'http://localhost:3000/api'; // Asegúrate de que coincida con la URL de tu API de backend

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    verificarSesion();
    inicializarEventListeners();
    // No cargamos contenido aquí directamente, sino después de verificar la sesión y el rol
    // El 'cambiarTab' inicial se encargará de cargar los datos
});

// Función de ayuda para solicitudes fetch autenticadas
async function fetchAuthenticated(url, options = {}) {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
        // Redirigir al login si no se encuentra el token
        mostrarNotificacion('Sesión expirada o no iniciada. Por favor, inicia sesión de nuevo.', 'error');
        cerrarSesion();
        throw new Error('No se encontró el token de acceso.');
    }

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        ...options.headers // Permite sobrescribir o añadir más encabezados
    };

    const response = await fetch(url, { ...options, headers });

    if (response.status === 401 || response.status === 403) {
        // No autorizado o Prohibido - probable token expirado o permisos inválidos
        mostrarNotificacion('Acceso no autorizado. Por favor, inicia sesión de nuevo.', 'error');
        cerrarSesion();
        throw new Error('Acceso no autorizado o prohibido.');
    }

    return response;
}

function verificarSesion() {
    const accessToken = localStorage.getItem('accessToken');
    const userRut = localStorage.getItem('userRut'); // Usando rut como identificador único para la información del usuario
    const userName = localStorage.getItem('userName');
    const userEmail = localStorage.getItem('userEmail');
    const tipoUsuario = localStorage.getItem('tipoUsuario');

    if (!accessToken || !userRut || !userName || !tipoUsuario) {
        // Si falta algún dato esencial de la sesión, redirigir al login
        mostrarNotificacion('Sesión no válida. Por favor, inicia sesión.', 'error');
        window.location.href = 'index.html';
        return;
    }

    // Rellenar usuarioActual desde localStorage
    usuarioActual = {
        rut: userRut,
        nombre: userName,
        email: userEmail,
        tipoUsuario: tipoUsuario
        // Añadir otros detalles del usuario si los almacenas en localStorage
    };
    
    actualizarInterfazSegunUsuario();
    mostrarInfoUsuario();
    // Cargar contenido inicial después de que la información del usuario esté disponible
    cambiarTab(tabActiva); // Carga 'clases' por defecto o la última pestaña activa
}

function mostrarInfoUsuario() {
    const infoUsuario = document.getElementById('info-usuario');
    // Asegurarse de que usuarioActual no sea nulo antes de continuar
    if (!usuarioActual) {
        infoUsuario.innerHTML = '<i class="fas fa-user"></i> <span>Cargando...</span>';
        return;
    }
    
    const badgeRol = usuarioActual.tipoUsuario === 'entrenador' ? 'admin' : 'usuario';
    const textoRol = usuarioActual.tipoUsuario === 'entrenador' ? 'Admin' : 'Usuario';
    
    infoUsuario.innerHTML = `
        <i class="fas fa-user"></i>
        <span>${usuarioActual.nombre}</span>
        <span class="badge-rol ${badgeRol}">${textoRol}</span>
    `;
}

function inicializarEventListeners() {
    // Menú móvil
    document.getElementById('btn-menu-movil').addEventListener('click', toggleMenuMovil);
    
    // Pestañas de navegación
    const tabBotones = document.querySelectorAll('.tab-boton, .tab-boton-movil');
    tabBotones.forEach(boton => {
        boton.addEventListener('click', (e) => {
            const tab = e.currentTarget.dataset.tab;
            cambiarTab(tab);
            if (menuMovilAbierto) {
                toggleMenuMovil();
            }
        });
    });
    
    // Botones de cerrar sesión
    document.getElementById('btn-cerrar-sesion').addEventListener('click', mostrarConfirmacionCerrarSesion);
    document.getElementById('btn-cerrar-sesion-movil').addEventListener('click', mostrarConfirmacionCerrarSesion);
    
    // Botones de agregar (solo admin)
    const botones = ['btn-agregar-clase', 'btn-agregar-entrenador', 'btn-agregar-cliente'];
    botones.forEach(btnId => {
        const btn = document.getElementById(btnId);
        if (btn) {
            btn.addEventListener('click', () => {
                const tipo = btnId.replace('btn-agregar-', '');
                mostrarModalAgregar(tipo);
            });
        }
    });
    
    // Formulario nueva reserva (asumiendo que es un formulario en el HTML)
    const formNuevaReserva = document.getElementById('form-nueva-reserva');
    if (formNuevaReserva) {
        formNuevaReserva.addEventListener('submit', manejarConfirmarReservaForm);
    }
}

function actualizarInterfazSegunUsuario() {
    // Asegurarse de que usuarioActual esté lleno antes de llamar a esto
    if (!usuarioActual) return; 

    const esAdmin = usuarioActual.tipoUsuario === 'entrenador';
    
    // Mostrar/ocultar elementos según el rol
    const elementosAdmin = document.querySelectorAll('.solo-admin');
    const elementosUsuario = document.querySelectorAll('.solo-usuario');
    
    elementosAdmin.forEach(el => {
        if (esAdmin) {
            el.classList.remove('oculto');
        } else {
            el.classList.add('oculto');
        }
    });
    
    elementosUsuario.forEach(el => {
        if (!esAdmin) {
            el.classList.remove('oculto');
        } else {
            el.classList.add('oculto');
        }
    });
    
    // Añadir pestaña de clientes solo para admin, si aún no se ha añadido
    if (esAdmin && !document.getElementById('tab-clientes')) {
        agregarTabClientes();
    }
}

function agregarTabClientes() {
    const navegacionPrincipal = document.querySelector('.navegacion-principal');
    const navegacionMovil = document.querySelector('.navegacion-movil');
    
    // Comprobar si la pestaña ya existe para evitar duplicados
    if (document.querySelector('.tab-boton[data-tab="clientes"]')) {
        return;
    }

    // Pestaña para navegación principal
    const tabClientes = document.createElement('button');
    tabClientes.className = 'tab-boton';
    tabClientes.dataset.tab = 'clientes';
    tabClientes.innerHTML = '<i class="fas fa-users"></i><span>Clientes</span>';
    
    // Pestaña para navegación móvil
    const tabClientesMovil = document.createElement('button');
    tabClientesMovil.className = 'tab-boton-movil';
    tabClientesMovil.dataset.tab = 'clientes';
    tabClientesMovil.innerHTML = '<i class="fas fa-users"></i><span>Clientes</span>';
    
    // Insertar antes del botón de cerrar sesión
    const btnCerrarSesion = document.getElementById('btn-cerrar-sesion');
    const btnCerrarSesionMovil = document.getElementById('btn-cerrar-sesion-movil');
    
    if (navegacionPrincipal && btnCerrarSesion) {
        navegacionPrincipal.insertBefore(tabClientes, btnCerrarSesion);
    }
    if (navegacionMovil && btnCerrarSesionMovil) {
        navegacionMovil.insertBefore(tabClientesMovil, btnCerrarSesionMovil);
    }
    
    // Crear contenido de la pestaña
    const contenidoPrincipal = document.querySelector('.contenido-principal');
    const tabClientes_contenido = document.createElement('div');
    tabClientes_contenido.id = 'tab-clientes';
    tabClientes_contenido.className = 'contenido-tab';
    tabClientes_contenido.innerHTML = `
        <div class="grid-clientes" id="grid-clientes">
            </div>
    `;
    
    if (contenidoPrincipal) {
        contenidoPrincipal.appendChild(tabClientes_contenido);
    }
}

function toggleMenuMovil() {
    const menuMovil = document.getElementById('menu-movil');
    const btnMenu = document.getElementById('btn-menu-movil');
    
    menuMovilAbierto = !menuMovilAbierto;
    
    if (menuMovilAbierto) {
        menuMovil.classList.remove('oculto');
        btnMenu.innerHTML = '<i class="fas fa-times"></i>';
    } else {
        menuMovil.classList.add('oculto');
        btnMenu.innerHTML = '<i class="fas fa-bars"></i>';
    }
}

async function cambiarTab(nuevaTab) {
    // Actualizar botones activos
    const todosBotones = document.querySelectorAll('.tab-boton, .tab-boton-movil');
    todosBotones.forEach(boton => {
        boton.classList.remove('activo');
        if (boton.dataset.tab === nuevaTab) {
            boton.classList.add('activo');
        }
    });
    
    // Actualizar contenido
    const todosContenidos = document.querySelectorAll('.contenido-tab');
    todosContenidos.forEach(contenido => {
        contenido.classList.remove('activo');
    });
    
    const tabContenido = document.getElementById(`tab-${nuevaTab}`);
    if (tabContenido) {
        tabContenido.classList.add('activo');
    }
    
    // Actualizar título y botones
    const titulos = {
        'clases': 'Clases y Actividades',
        'reservas': 'Gestión de Reservas',
        'entrenadores': 'Equipo de Entrenadores',
        'clientes': 'Gestión de Clientes'
    };
    
    document.getElementById('titulo-seccion').textContent = titulos[nuevaTab] || 'Tablero';
    
    // Mostrar/ocultar botones según la pestaña y el rol
    actualizarBotonesSegunTab(nuevaTab);
    
    tabActiva = nuevaTab;
    
    // Cargar contenido específico para la pestaña activa (ahora con llamadas a la API)
    try {
        switch (nuevaTab) {
            case 'clases':
                await cargarClases();
                break;
            case 'reservas':
                await cargarReservas();
                await cargarOpcionesReserva(); // Necesario para el formulario de nueva reserva
                break;
            case 'entrenadores':
                await cargarEntrenadores();
                break;
            case 'clientes':
                if (usuarioActual.tipoUsuario === 'entrenador') {
                    await cargarClientes();
                } else {
                    mostrarNotificacion('Acceso no autorizado para ver clientes.', 'error');
                }
                break;
        }
    } catch (error) {
        console.error(`Error al cargar la pestaña ${nuevaTab}:`, error);
        mostrarNotificacion(`No se pudo cargar la información de ${nuevaTab}.`, 'error');
    }
}

function actualizarBotonesSegunTab(tab) {
    const botones = ['btn-agregar-clase', 'btn-agregar-entrenador', 'btn-agregar-cliente'];
    
    botones.forEach(btnId => {
        const btn = document.getElementById(btnId);
        if (btn) btn.classList.add('oculto');
    });
    
    if (usuarioActual.tipoUsuario === 'entrenador') {
        const btnMap = {
            'clases': 'btn-agregar-clase',
            'entrenadores': 'btn-agregar-entrenador',
            'clientes': 'btn-agregar-cliente'
        };
        
        const btnMostrar = document.getElementById(btnMap[tab]);
        if (btnMostrar) btnMostrar.classList.remove('oculto');
    }
}

async function cargarClases() {
    const gridClases = document.getElementById('grid-clases');
    if (!gridClases) return;
    
    gridClases.innerHTML = '<p class="loading-message">Cargando clases...</p>'; // Indicador de carga
    
    try {
        const response = await fetchAuthenticated(`${API_URL}/clases`);
        const clases = await response.json();
        
        gridClases.innerHTML = ''; // Limpiar mensaje de carga
        if (clases && clases.length > 0) {
            clases.forEach(clase => {
                const tarjetaClase = crearTarjetaClase(clase);
                gridClases.appendChild(tarjetaClase);
            });
        } else {
            gridClases.innerHTML = '<p class="no-data-message">No hay clases disponibles.</p>';
        }
    } catch (error) {
        console.error('Error al cargar clases:', error);
        gridClases.innerHTML = '<p class="error-message">Error al cargar clases. Inténtalo de nuevo.</p>';
    }
}

function crearTarjetaClase(clase) {
    const tarjeta = document.createElement('div');
    tarjeta.className = 'tarjeta-clase fade-in';
    
    const esAdmin = usuarioActual.tipoUsuario === 'entrenador';
    
    const accionesHTML = esAdmin ? `
        <div class="acciones-clase">
            <button class="boton-accion" onclick="editarClase(${clase.id})" title="Editar clase">
                <i class="fas fa-edit"></i>
            </button>
            <button class="boton-accion" onclick="eliminarClase(${clase.id})" title="Eliminar clase">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    ` : '';
    
    const botonReservarHTML = !esAdmin ? `
        <button class="boton-reservar" onclick="prepararReservaClase(${clase.id})">
            <i class="fas fa-calendar-plus"></i> Reservar Clase
        </button>
    ` : `
        <div class="detalle-clase">
            <span class="etiqueta">Capacidad:</span> <span class="valor">${clase.capacidad} personas</span>
        </div>
    `;
    
    tarjeta.innerHTML = `
        <div class="encabezado-clase">
            <div class="info-clase">
                <h3>${clase.nombre}</h3>
                <p><i class="fas fa-user-tie"></i> ${clase.instructor_nombre}</p> </div>
            ${accionesHTML}
        </div>
        <div class="cuerpo-clase">
            <p class="descripcion-clase">${clase.descripcion}</p>
            <div class="detalle-clase">
                <span class="etiqueta">Nivel:</span> <span class="valor">${clase.nivel}</span>
            </div>
            <div class="detalle-clase">
                <span class="etiqueta">Duración:</span> <span class="valor">${clase.duracion}</span>
            </div>
            <div class="horarios-clase">
                <span class="etiqueta">Horarios disponibles:</span>
                <ul>
                    ${clase.horarios.map(horario => `<li><i class="fas fa-clock"></i> ${horario}</li>`).join('')}
                </ul>
            </div>
            ${botonReservarHTML}
        </div>
    `;
    
    return tarjeta;
}

async function cargarReservas() {
    const cuerpoTabla = document.getElementById('cuerpo-tabla-reservas');
    if (!cuerpoTabla) return;
    
    cuerpoTabla.innerHTML = '<tr><td colspan="7"><p class="loading-message">Cargando reservas...</p></td></tr>';
    
    try {
        const esAdmin = usuarioActual.tipoUsuario === 'entrenador';
        let url = `${API_URL}/reservas`;
        if (!esAdmin) {
            // Si no es admin, buscar solo las reservas del usuario basadas en su RUT/ID
            url = `${API_URL}/reservas/usuario/${usuarioActual.rut}`; // Ajusta si tu backend usa ID
        }

        const response = await fetchAuthenticated(url);
        const reservas = await response.json();
        
        cuerpoTabla.innerHTML = ''; // Limpiar mensaje de carga
        if (reservas && reservas.length > 0) {
            reservas.forEach(reserva => {
                const fila = crearFilaReserva(reserva);
                cuerpoTabla.appendChild(fila);
            });
        } else {
            cuerpoTabla.innerHTML = '<tr><td colspan="7"><p class="no-data-message">No hay reservas registradas.</p></td></tr>';
        }
    } catch (error) {
        console.error('Error al cargar reservas:', error);
        cuerpoTabla.innerHTML = '<tr><td colspan="7"><p class="error-message">Error al cargar reservas. Inténtalo de nuevo.</p></td></tr>';
    }
}

function crearFilaReserva(reserva) {
    const fila = document.createElement('tr');
    fila.className = 'fade-in';
    
    const estadoClase = {
        'confirmada': 'estado-confirmada',
        'pendiente': 'estado-pendiente',
        'cancelada': 'estado-cancelada'
    }[reserva.estado];
    
    const estadoTexto = {
        'confirmada': 'Confirmada',
        'pendiente': 'Pendiente',
        'cancelada': 'Cancelada'
    }[reserva.estado];
    
    const esAdmin = usuarioActual.tipoUsuario === 'entrenador';
    
    let accionHTML = '';
    if (esAdmin) {
        if (reserva.estado === 'pendiente') {
            accionHTML = `
                <button class="boton-tabla exito" onclick="confirmarReservaAdmin(${reserva.id})" title="Confirmar reserva">
                    <i class="fas fa-check"></i> Confirmar
                </button>
                <button class="boton-tabla peligro" onclick="rechazarReservaAdmin(${reserva.id})" title="Rechazar reserva">
                    <i class="fas fa-times"></i> Rechazar
                </button>
            `;
        } else {
            accionHTML = `<button class="boton-tabla" onclick="gestionarReserva(${reserva.id})">Gestionar</button>`;
        }
    } else {
        if (reserva.estado !== 'cancelada' && reserva.estado !== 'confirmada') { // Solo permitir cancelar si no está confirmada/cancelada
            accionHTML = `<button class="boton-tabla peligro" onclick="cancelarReservaUsuario(${reserva.id})">Cancelar</button>`;
        }
    }
    
    let nombreUsuarioCol = '';
    if (esAdmin) {
        // Asumiendo que tu objeto de reserva del backend podría tener user_name o similar
        nombreUsuarioCol = `<td>${reserva.usuario_nombre || 'N/A'} (RUT: ${reserva.usuario_rut || 'N/A'})</td>`; 
    }
    
    fila.innerHTML = `
        <td><i class="fas fa-dumbbell"></i> ${reserva.clase_nombre}</td> <td><i class="fas fa-calendar"></i> ${formatearFecha(reserva.fecha)}</td>
        <td><i class="fas fa-clock"></i> ${reserva.hora}</td>
        <td><i class="fas fa-user-tie"></i> ${reserva.instructor_nombre}</td> ${esAdmin ? nombreUsuarioCol : ''}
        <td><span class="estado-reserva ${estadoClase}">${estadoTexto}</span></td>
        <td>${accionHTML}</td>
    `;
    
    return fila;
}

async function cargarEntrenadores() {
    const gridEntrenadores = document.getElementById('grid-entrenadores');
    if (!gridEntrenadores) return;
    
    gridEntrenadores.innerHTML = '<p class="loading-message">Cargando entrenadores...</p>';
    
    try {
        const response = await fetchAuthenticated(`${API_URL}/entrenadores`);
        const entrenadores = await response.json();
        
        gridEntrenadores.innerHTML = '';
        if (entrenadores && entrenadores.length > 0) {
            entrenadores.forEach(entrenador => {
                const tarjetaEntrenador = crearTarjetaEntrenador(entrenador);
                gridEntrenadores.appendChild(tarjetaEntrenador);
            });
        } else {
            gridEntrenadores.innerHTML = '<p class="no-data-message">No hay entrenadores registrados.</p>';
        }
    } catch (error) {
        console.error('Error al cargar entrenadores:', error);
        gridEntrenadores.innerHTML = '<p class="error-message">Error al cargar entrenadores. Inténtalo de nuevo.</p>';
    }
}

function crearTarjetaEntrenador(entrenador) {
    const tarjeta = document.createElement('div');
    tarjeta.className = 'tarjeta-entrenador fade-in';
    
    tarjeta.innerHTML = `
        <div class="header-entrenador">
            <h3>${entrenador.nombre || 'Nombre no disponible'} ${entrenador.apellido || ''}</h3>
            <div class="acciones-entrenador">
                <button class="boton-accion" onclick="editarEntrenador('${entrenador.rut}')" title="Editar entrenador">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="boton-accion" onclick="eliminarEntrenador('${entrenador.rut}')" title="Eliminar entrenador">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
        <div class="cuerpo-cliente"> <p><i class="fas fa-id-card"></i> **RUT:** ${entrenador.rut || 'N/A'}</p>
            <p><i class="fas fa-envelope"></i> **Correo:** ${entrenador.email || 'No disponible'}</p>
            <p><i class="fas fa-phone"></i> **Teléfono:** ${entrenador.telefono || 'No disponible'}</p>
        </div>
    `;
    
    // (Mantén tus event listeners si los usas en lugar de onclick)
    return tarjeta;
}
function crearTarjetaCliente(cliente) {
    const tarjeta = document.createElement('div');
    tarjeta.className = 'tarjeta-cliente fade-in';
    
    // Asegúrate de que las propiedades (cliente.rut, cliente.nombre, etc.)
    // coincidan exactamente con las que tu API envía en el objeto de usuario.
    tarjeta.innerHTML = `
        <div class="header-cliente">
            <h3>${cliente.nombre || 'Nombre no disponible'} ${cliente.apellido || ''}</h3>
            ${usuarioActual && usuarioActual.tipoUsuario === 'entrenador' ? `
                <div class="acciones-cliente">
                    <button class="boton-accion" onclick="editarCliente(${cliente.id || cliente.rut})" title="Editar cliente">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="boton-accion" onclick="eliminarCliente(${cliente.id || cliente.rut})" title="Eliminar cliente">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            ` : ''}
        </div>
        <div class="cuerpo-cliente">
            <p><i class="fas fa-id-card"></i> **RUT:** ${cliente.rut || 'N/A'}</p>
            <p><i class="fas fa-envelope"></i> **Correo:** ${cliente.email || 'No disponible'}</p>
            <p><i class="fas fa-phone"></i> **Teléfono:** ${cliente.telefono || 'No disponible'}</p>
            </div>
    `;
    return tarjeta;
}

// En tablero.js, busca la función cargarClientes
async function cargarClientes() {
    const gridClientes = document.getElementById('grid-clientes');
    gridClientes.innerHTML = 'Cargando clientes...'; // Mensaje provisional

    try {
        // --- ¡AQUÍ ESTÁ EL CAMBIO CLAVE! ---
        // Debes usar fetchAuthenticated y la variable API_URL
        const response = await fetchAuthenticated(`${API_URL}/usuarios`); 
        // Lo anterior reemplaza:
        // const response = await fetch('/api/usuarios', {
        //     method: 'GET',
        //     headers: {
        //         'Authorization': `Bearer ${localStorage.getItem('token')}`
        //     }
        // });
        // La función fetchAuthenticated ya maneja el método GET por defecto y los headers.

        if (!response.ok) {
            // No necesitas un catch tan elaborado aquí, ya que fetchAuthenticated
            // ya maneja los 401/403 y lanza un error. Si hay otros errores de red o servidor,
            // se capturarán en el catch externo.
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al obtener usuarios');
        }

        const usuarios = await response.json();

        // --- AÑADIENDO TUS CONSOLE.LOGS DE NUEVO ---
        console.log("Datos recibidos de /api/usuarios:", usuarios);

        // Verifica el tipo de 'usuarios'
        if (!Array.isArray(usuarios)) {
            console.error("Error: La respuesta de /api/usuarios no es un array.", usuarios);
            gridClientes.innerHTML = 'Error al cargar clientes: Datos inválidos.';
            return;
        }

        // Muestra el tipousuario de cada usuario
        usuarios.forEach(user => {
            console.log(`Usuario RUT: ${user.rut}, Tipo: ${user.tipousuario}`);
        });
        // --- FIN DE CONSOLE.LOGS ---

        const clientes = usuarios.filter(u => u.tipousuario === 'usuario');

        console.log("Clientes después del filtro:", clientes); // Este también es importante

        gridClientes.innerHTML = ''; // Limpia el mensaje de carga

        if (clientes.length === 0) {
            gridClientes.innerHTML = '<p>No hay clientes registrados.</p>';
        } else {
            clientes.forEach(cliente => {
                const tarjetaCliente = crearTarjetaCliente(cliente);
                gridClientes.appendChild(tarjetaCliente);
            });
        }

    } catch (error) {
        console.error('Error al cargar clientes:', error.message);
        gridClientes.innerHTML = `<p>Error al cargar clientes: ${error.message}</p>`;
    }
}
async function prepararReservaClase(claseId) {
    const claseResponse = await fetchAuthenticated(`${API_URL}/clases/${claseId}`);
    const clase = await claseResponse.json();

    if (!clase) {
        mostrarNotificacion('Clase no encontrada.', 'error');
        return;
    }

    // Prellenar el formulario de reserva si existe
    document.getElementById('select-clase').value = clase.id;
    // Establecer una fecha por defecto (ej., mañana) si se desea, o dejar en blanco para que el usuario la introduzca
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    document.getElementById('fecha-reserva').value = tomorrow.toISOString().split('T')[0];
    
    // Cambiar a la pestaña de reservas para que el usuario pueda completar el formulario
    cambiarTab('reservas');
    mostrarNotificacion(`Formulario de reserva precargado para ${clase.nombre}. Por favor, selecciona fecha y hora.`, 'info');
}

async function manejarConfirmarReservaForm(e) {
    e.preventDefault();

    const claseId = document.getElementById('select-clase').value;
    const fecha = document.getElementById('fecha-reserva').value;
    const hora = document.getElementById('select-hora').value;
    
    if (!claseId || !fecha || !hora) {
        mostrarNotificacion('Por favor, complete todos los campos para la reserva.', 'error');
        return;
    }

    try {
        const response = await fetchAuthenticated(`${API_URL}/reservas`, { // Asumiendo /reservas para nuevas reservas
            method: 'POST',
            body: JSON.stringify({
                usuario_rut: usuarioActual.rut, // Enviar el RUT del usuario para que el backend lo vincule
                clase_id: parseInt(claseId),
                fecha: fecha,
                hora: hora,
                estado: 'pendiente' // Las nuevas reservas suelen estar pendientes
            })
        });

        const data = await response.json();

        if (response.ok) {
            // Limpiar formulario
            document.getElementById('form-nueva-reserva').reset(); 
            mostrarNotificacion(data.message || 'Reserva creada correctamente. Esperando confirmación.', 'exito');
            cargarReservas(); // Recargar la lista de reservas
        } else {
            mostrarNotificacion(data.message || 'Error al crear reserva.', 'error');
        }
    } catch (error) {
        console.error('Error al manejar reserva:', error);
        mostrarNotificacion('Error al conectar con el servidor para crear reserva.', 'error');
    }
}

async function editarClase(claseId) {
    try {
        const response = await fetchAuthenticated(`${API_URL}/clases/${claseId}`);
        const clase = await response.json();
        if (clase) {
            // Deberás implementar un formulario modal para la edición
            mostrarModalEditar('clase', clase);
        } else {
            mostrarNotificacion('Clase no encontrada.', 'error');
        }
    } catch (error) {
        console.error('Error al obtener clase para editar:', error);
        mostrarNotificacion('Error al cargar datos de la clase.', 'error');
    }
}

async function eliminarClase(claseId) {
    mostrarModalConfirmacion(
        `¿Estás seguro de que quieres eliminar esta clase?`,
        async () => {
            try {
                const response = await fetchAuthenticated(`${API_URL}/clases/${claseId}`, {
                    method: 'DELETE'
                });

                if (response.ok) {
                    mostrarNotificacion('Clase eliminada correctamente', 'exito');
                    cargarClases(); // Recargar la lista
                } else {
                    const data = await response.json();
                    mostrarNotificacion(data.message || 'Error al eliminar clase.', 'error');
                }
            } catch (error) {
                console.error('Error al eliminar clase:', error);
                mostrarNotificacion('Error al conectar con el servidor para eliminar clase.', 'error');
            }
        }
    );
}

async function confirmarReservaAdmin(reservaId) {
    mostrarModalConfirmacion(
        `¿Estás seguro de que quieres confirmar esta reserva?`,
        async () => {
            try {
                const response = await fetchAuthenticated(`${API_URL}/reservas/${reservaId}/confirmar`, {
                    method: 'PUT' // O POST, dependiendo de tu API
                });

                const data = await response.json();
                if (response.ok) {
                    mostrarNotificacion(data.message || 'Reserva confirmada correctamente', 'exito');
                    cargarReservas();
                } else {
                    mostrarNotificacion(data.message || 'Error al confirmar reserva.', 'error');
                }
            } catch (error) {
                console.error('Error al confirmar reserva:', error);
                mostrarNotificacion('Error al conectar con el servidor para confirmar reserva.', 'error');
            }
        }
    );
}

async function rechazarReservaAdmin(reservaId) {
    mostrarModalConfirmacion(
        `¿Estás seguro de que quieres rechazar esta reserva?`,
        async () => {
            try {
                const response = await fetchAuthenticated(`${API_URL}/reservas/${reservaId}/rechazar`, {
                    method: 'PUT' // O POST, dependiendo de tu API
                });

                const data = await response.json();
                if (response.ok) {
                    mostrarNotificacion(data.message || 'Reserva rechazada', 'info');
                    cargarReservas();
                } else {
                    mostrarNotificacion(data.message || 'Error al rechazar reserva.', 'error');
                }
            } catch (error) {
                console.error('Error al rechazar reserva:', error);
                mostrarNotificacion('Error al conectar con el servidor para rechazar reserva.', 'error');
            }
        }
    );
}

async function cancelarReservaUsuario(reservaId) {
    mostrarModalConfirmacion(
        `¿Estás seguro de que quieres cancelar esta reserva?`,
        async () => {
            try {
                const response = await fetchAuthenticated(`${API_URL}/reservas/${reservaId}/cancelar`, {
                    method: 'PUT' // O POST, dependiendo de tu API
                });

                const data = await response.json();
                if (response.ok) {
                    mostrarNotificacion(data.message || 'Reserva cancelada correctamente', 'info');
                    cargarReservas();
                } else {
                    mostrarNotificacion(data.message || 'Error al cancelar reserva.', 'error');
                }
            } catch (error) {
                console.error('Error al cancelar reserva:', error);
                mostrarNotificacion('Error al conectar con el servidor para cancelar reserva.', 'error');
            }
        }
    );
}

function gestionarReserva(reservaId) {
    // Esto típicamente significa mostrar un modal para editar los detalles de una reserva específica
    // Primero deberías obtener los detalles de la reserva y luego pasarlos al modal
    mostrarNotificacion(`La funcionalidad de gestionar reserva ${reservaId} se implementará`, 'info');
    // Ejemplo:
    // const reserva = await (await fetchAuthenticated(`${API_URL}/reservas/${reservaId}`)).json();
    // if (reserva) mostrarModalEditar('reserva', reserva);
}

async function editarEntrenador(entrenadorId) {
    try {
        const response = await fetchAuthenticated(`${API_URL}/entrenadores/${entrenadorId}`);
        const entrenador = await response.json();
        if (entrenador) {
            mostrarModalEditar('entrenador', entrenador);
        } else {
            mostrarNotificacion('Entrenador no encontrado.', 'error');
        }
    } catch (error) {
        console.error('Error al obtener entrenador para editar:', error);
        mostrarNotificacion('Error al cargar datos del entrenador.', 'error');
    }
}

async function eliminarEntrenador(entrenadorId) {
    mostrarModalConfirmacion(
        `¿Estás seguro de que quieres eliminar a este entrenador?`,
        async () => {
            try {
                const response = await fetchAuthenticated(`${API_URL}/entrenadores/${entrenadorId}`, {
                    method: 'DELETE'
                });

                if (response.ok) {
                    mostrarNotificacion('Entrenador eliminado correctamente', 'exito');
                    cargarEntrenadores();
                } else {
                    const data = await response.json();
                    mostrarNotificacion(data.message || 'Error al eliminar entrenador.', 'error');
                }
            } catch (error) {
                console.error('Error al eliminar entrenador:', error);
                mostrarNotificacion('Error al conectar con el servidor para eliminar entrenador.', 'error');
            }
        }
    );
}

async function verHorarios(entrenadorId) {
    try {
        const entrenadorResponse = await fetchAuthenticated(`${API_URL}/entrenadores/${entrenadorId}`);
        const entrenador = await entrenadorResponse.json();

        if (!entrenador) {
            mostrarNotificacion('Entrenador no encontrado.', 'error');
            return;
        }

        // Asumiendo que tienes un endpoint para obtener clases por instructor
        const clasesResponse = await fetchAuthenticated(`${API_URL}/clases/instructor/${entrenador.id}`); // Ajusta el endpoint
        const clasesEntrenador = await clasesResponse.json();
        
        let horariosHTML = '<h4>Horarios de ' + entrenador.nombre + ':</h4>';
        if (clasesEntrenador.length > 0) {
            clasesEntrenador.forEach(clase => {
                horariosHTML += `<div style="margin-bottom: 1rem;">
                    <strong>${clase.nombre}</strong><br>
                    ${clase.horarios.join('<br>')}
                </div>`;
            });
        } else {
            horariosHTML += '<p>No tiene clases asignadas actualmente.</p>';
        }
        
        mostrarModalInfo('Horarios del Entrenador', horariosHTML);
    } catch (error) {
        console.error('Error al ver horarios del entrenador:', error);
        mostrarNotificacion('Error al cargar horarios del entrenador.', 'error');
    }
}

async function verDetalleCliente(clienteId) {
    try {
        const response = await fetchAuthenticated(`${API_URL}/usuarios/${clienteId}`); // Asumiendo que puedes obtener un solo usuario por ID
        const cliente = await response.json();

        if (!cliente || cliente.tipo_usuario !== 'usuario') { // Asegurarse de que sea realmente un cliente
            mostrarNotificacion('Cliente no encontrado o tipo de usuario incorrecto.', 'error');
            return;
        }

        const reservasClienteResponse = await fetchAuthenticated(`${API_URL}/reservas/usuario/${cliente.rut}`); // Obtener las reservas del cliente
        const reservasCliente = await reservasClienteResponse.json();
        
        let detalleHTML = `
            <div style="text-align: left;">
                <h4>${cliente.nombre} ${cliente.apellido}</h4>
                <p><strong>Email:</strong> ${cliente.correo}</p>
                <p><strong>Teléfono:</strong> ${cliente.telefono}</p>
                <p><strong>RUT:</strong> ${cliente.rut}</p>
                <p><strong>Miembro desde:</strong> ${formatearFecha(cliente.fecha_registro)}</p>
                
                <h5 style="margin-top: 1.5rem;">Historial de Reservas:</h5>
        `;
        
        if (reservasCliente.length > 0) {
            reservasCliente.forEach(reserva => {
                detalleHTML += `
                    <div style="background: #f8fafc; padding: 0.5rem; margin: 0.5rem 0; border-radius: 6px;">
                        <strong>${reserva.clase_nombre}</strong> - ${formatearFecha(reserva.fecha)} 
                        <span class="estado-reserva ${reserva.estado === 'confirmada' ? 'estado-confirmada' : reserva.estado === 'pendiente' ? 'estado-pendiente' : 'estado-cancelada'}">${reserva.estado}</span>
                    </div>
                `;
            });
        } else {
            detalleHTML += '<p>No tiene reservas registradas.</p>';
        }
        
        detalleHTML += '</div>';
        
        mostrarModalInfo('Detalle del Cliente', detalleHTML);
    } catch (error) {
        console.error('Error al ver detalle del cliente:', error);
        mostrarNotificacion('Error al cargar detalle del cliente.', 'error');
    }
}

async function editarCliente(clienteId) {
    try {
        const response = await fetchAuthenticated(`${API_URL}/usuarios/${clienteId}`);
        const cliente = await response.json();
        if (cliente && cliente.tipo_usuario === 'usuario') {
            mostrarModalEditar('cliente', cliente);
        } else {
            mostrarNotificacion('Cliente no encontrado o no es un usuario regular.', 'error');
        }
    } catch (error) {
        console.error('Error al obtener cliente para editar:', error);
        mostrarNotificacion('Error al cargar datos del cliente.', 'error');
    }
}

async function eliminarCliente(clienteId) {
    mostrarModalConfirmacion(
        `¿Estás seguro de que quieres eliminar a este cliente? Esto eliminará también sus reservas.`,
        async () => {
            try {
                const response = await fetchAuthenticated(`${API_URL}/usuarios/${clienteId}`, {
                    method: 'DELETE'
                });

                if (response.ok) {
                    mostrarNotificacion('Cliente eliminado correctamente', 'exito');
                    cargarClientes(); // Recargar lista
                } else {
                    const data = await response.json();
                    mostrarNotificacion(data.message || 'Error al eliminar cliente.', 'error');
                }
            } catch (error) {
                console.error('Error al eliminar cliente:', error);
                mostrarNotificacion('Error al conectar con el servidor para eliminar cliente.', 'error');
            }
        }
    );
}

function mostrarModalAgregar(tipo) {
    if (tipo === 'clase') {
        mostrarModalInfo('Agregar Nueva Clase', `
            <form id="form-agregar-clase" class="formulario-modal form-grid">
                <div class="form-grupo full-width">
                    <label for="nombre-clase">Nombre de la Clase:</label>
                    <input type="text" id="nombre-clase" name="nombre" required>
                </div>
                <div class="form-grupo full-width">
                    <label for="descripcion-clase">Descripción:</label>
                    <textarea id="descripcion-clase" name="descripcion" rows="3"></textarea>
                </div>
                <div class="form-grupo">
                    <label for="duracion-clase">Duración (minutos):</label>
                    <input type="number" id="duracion-clase" name="duracion" required min="15" step="5" placeholder="Ej: 45">
                </div>
                <div class="form-grupo">
                    <label for="capacidad-clase">Cupos (Capacidad Máxima):</label>
                    <input type="number" id="capacidad-clase" name="capacidad" min="1" value="10" required>
                </div>

                <div class="modal-footer full-width">
                    <button type="submit" class="boton-primario">Agregar Clase</button>
                    <button type="button" class="boton-secundario" onclick="cerrarModal(this)">Cancelar</button>
                </div>
            </form>
        `);
        // Asocia el manejador de envío al formulario
        document.getElementById('form-agregar-clase').addEventListener('submit', manejarAgregarClase);

    } else if (tipo === 'entrenador') {
        mostrarModalInfo('Agregar Nuevo Entrenador', `
            <form id="form-agregar-entrenador" class="formulario-modal form-grid">
                <div class="form-grupo">
                    <label for="nombre-entrenador">Nombre:</label>
                    <input type="text" id="nombre-entrenador" name="nombre" required>
                </div>
                <div class="form-grupo">
                    <label for="apellido-entrenador">Apellido:</label>
                    <input type="text" id="apellido-entrenador" name="apellido" required>
                </div>
                <div class="form-grupo">
                    <label for="email-entrenador">Email:</label>
                    <input type="email" id="email-entrenador" name="correo" required>
                </div>
                <div class="form-grupo">
                    <label for="telefono-entrenador">Teléfono:</label>
                    <input type="tel" id="telefono-entrenador" name="telefono" placeholder="+56912345678" required>
                </div>
                <div class="form-grupo">
                    <label for="rut-entrenador">RUT:</label>
                    <input type="text" id="rut-entrenador" name="rut" placeholder="12345678-9" required pattern="[0-9]{7,8}-[0-9Kk]{1}" title="Formato RUT: XXXXXXXX-X">
                </div>
                <div class="form-grupo">
                    <label for="especialidad-entrenador">Especialidad:</label>
                    <input type="text" id="especialidad-entrenador" name="especialidad" required>
                </div>
                <div class="form-grupo">
                    <label for="experiencia-entrenador">Experiencia (años):</label>
                    <input type="number" id="experiencia-entrenador" name="experiencia" min="0">
                </div>
                <div class="form-grupo">
                    <label for="certificaciones-entrenador">Certificaciones (separadas por coma):</label>
                    <input type="text" id="certificaciones-entrenador" name="certificaciones">
                </div>
                <div class="form-grupo full-width">
                    <label for="descripcion-entrenador">Descripción:</label>
                    <textarea id="descripcion-entrenador" name="descripcion" rows="3"></textarea>
                </div>
                <div class="modal-footer full-width">
                    <button type="submit" class="boton-primario">Agregar Entrenador</button>
                    <button type="button" class="boton-secundario" onclick="cerrarModal(this)">Cancelar</button>
                </div>
            </form>
        `);
        document.getElementById('form-agregar-entrenador').addEventListener('submit', manejarAgregarEntrenador);

    } else if (tipo === 'cliente') {
        mostrarModalInfo('Agregar Nuevo Cliente', `
            <form id="form-agregar-cliente" class="formulario-modal form-grid">
                <div class="form-grupo">
                    <label for="nombre-cliente">Nombre:</label>
                    <input type="text" id="nombre-cliente" name="nombre" required>
                </div>
                <div class="form-grupo">
                    <label for="apellido-cliente">Apellido:</label>
                    <input type="text" id="apellido-cliente" name="apellido" required>
                </div>
                <div class="form-grupo">
                    <label for="email-cliente">Email:</label>
                    <input type="email" id="email-cliente" name="correo" required>
                </div>
                <div class="form-grupo">
                    <label for="telefono-cliente">Teléfono:</label>
                    <input type="tel" id="telefono-cliente" name="telefono" placeholder="+56912345678" required>
                </div>
                <div class="form-grupo">
                    <label for="rut-cliente">RUT:</label>
                    <input type="text" id="rut-cliente" name="rut" placeholder="12345678-9" required pattern="[0-9]{7,8}-[0-9Kk]{1}" title="Formato RUT: XXXXXXXX-X">
                </div>
                <div class="form-grupo">
                    <label for="password-cliente">Contraseña Inicial:</label>
                    <input type="password" id="password-cliente" name="contraseña" required>
                </div>
                <div class="modal-footer full-width">
                    <button type="submit" class="boton-primario">Agregar Cliente</button>
                    <button type="button" class="boton-secundario" onclick="cerrarModal(this)">Cancelar</button>
                </div>
            </form>
        `);
        document.getElementById('form-agregar-cliente').addEventListener('submit', manejarAgregarCliente);
    }
}

async function cargarInstructoresSelect(selectId) {
    const selectElement = document.getElementById(selectId);
    if (!selectElement) return;

    selectElement.innerHTML = '<option value="">Cargando instructores...</option>';
    try {
        const response = await fetchAuthenticated(`${API_URL}/entrenadores`);
        const entrenadores = await response.json();
        
        selectElement.innerHTML = '<option value="">Selecciona un instructor</option>';
        entrenadores.forEach(entrenador => {
            const option = document.createElement('option');
            option.value = entrenador.id; // O entrenador.nombre si tu backend usa el nombre directamente para vincular
            option.textContent = `${entrenador.nombre} ${entrenador.apellido}`;
            selectElement.appendChild(option);
        });
    } catch (error) {
        console.error('Error al cargar instructores para select:', error);
        selectElement.innerHTML = '<option value="">Error al cargar instructores</option>';
    }
}

async function manejarAgregarClase(event) {
    event.preventDefault();

    const form = event.target;
    const formData = new FormData(form);
    const claseData = {};

    formData.forEach((value, key) => {
        // Ahora solo necesitamos parsear 'duracion' y 'capacidad' a número
        if (key === 'duracion' || key === 'capacidad') {
            claseData[key] = parseInt(value, 10);
        } else {
            claseData[key] = value;
        }
    });

    // Validaciones actualizadas: solo nombre, duracion y capacidad son obligatorios
    if (!claseData.nombre || !claseData.duracion || !claseData.capacidad) {
        mostrarNotificacion('Por favor, completa todos los campos obligatorios: Nombre, Duración y Cupos.', 'advertencia');
        return;
    }

    try {
        const btnSubmit = form.querySelector('button[type="submit"]');
        btnSubmit.disabled = true;
        btnSubmit.textContent = 'Agregando...';

         const response = await fetchAuthenticated(`${API_URL}/clases/simple`, { // <-- CAMBIO AQUÍ
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(claseData)
        });

        const data = await response.json();

        if (response.ok) {
            mostrarNotificacion(data.message || 'Clase creada exitosamente.', 'exito');
            cerrarModal(form.closest('.modal-contenido'));
            cargarClases();
        } else {
            mostrarNotificacion(data.message || 'Error al crear la clase.', 'error');
        }
    } catch (error) {
        console.error('Error al crear clase:', error);
        mostrarNotificacion('Error de conexión al intentar crear la clase.', 'error');
    } finally {
        const btnSubmit = form.querySelector('button[type="submit"]');
        btnSubmit.disabled = false;
        btnSubmit.textContent = 'Agregar Clase';
    }
}

// tablero.js - Asegúrate de que esta función esté en el ámbito global
// (es decir, no dentro de otra función como 'init' o 'document.addEventListener')

async function cargarOpcionesReserva() {
    try {
        // Ejemplo: Cargar las clases para el selector de clases en el formulario de reserva
        // Si ya tienes 'cargarClases' que trae datos, podrías reutilizarlos o hacer una nueva llamada
        const responseClases = await fetchAuthenticated(`${API_URL}/clases`);
        const clases = await responseClases.json();

        const selectClase = document.getElementById('reserva-clase-select'); // Asegúrate de que este ID exista en tu HTML
        selectClase.innerHTML = '<option value="">Selecciona una Clase</option>'; // Opción por defecto
        clases.forEach(clase => {
            const optgroup = document.createElement('optgroup');
            optgroup.label = clase.nombre;

            if (clase.horarios && clase.horarios.length > 0) {
                clase.horarios.forEach(horario => {
                    const option = document.createElement('option');
                    option.value = horario.idHorario; // El ID del horario es lo que necesitas para la reserva
                    option.textContent = `${clase.nombre} - ${horario.display}`;
                    optgroup.appendChild(option);
                });
            } else {
                // Si la clase no tiene horarios, aún puedes mostrarla pero deshabilitada o con un mensaje
                const option = document.createElement('option');
                option.value = '';
                option.textContent = `${clase.nombre} (Sin horarios disponibles)`;
                option.disabled = true;
                optgroup.appendChild(option);
            }
            selectClase.appendChild(optgroup);
        });

        // Ejemplo: Cargar entrenadores si tu formulario de reserva lo necesita
        // const responseEntrenadores = await fetchAuthenticated(`${API_URL}/entrenadores`);
        // const entrenadores = await responseEntrenadores.json();
        // const selectEntrenador = document.getElementById('reserva-entrenador-select');
        // ... (lógica para llenar el select de entrenadores)

    } catch (error) {
        console.error('Error al cargar opciones de reserva:', error);
        mostrarNotificacion('Error al cargar las opciones para la reserva.', 'error');
    }
}
async function manejarAgregarEntrenador(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const entrenadorData = {};

    formData.forEach((value, key) => {
        if (key === 'certificaciones') {
            entrenadorData[key] = value.split(',').map(c => c.trim()).filter(c => c !== '');
        } else if (key === 'experiencia') {
            entrenadorData[key] = parseInt(value, 10) || 0; // Asegura que sea un número, por defecto 0 si está vacío
        } else {
            entrenadorData[key] = value;
        }
    });

    // Añadir fecha_ingreso si no está en el formulario (puede ser manejado por el backend también)
    if (!entrenadorData.fecha_ingreso) {
        entrenadorData.fecha_ingreso = new Date().toISOString();
    }

    if (!entrenadorData.nombre || !entrenadorData.apellido || !entrenadorData.correo || !entrenadorData.rut || !entrenadorData.especialidad) {
        mostrarNotificacion('Por favor, completa los campos obligatorios para el entrenador.', 'error');
        return;
    }

    try {
        const btnSubmit = form.querySelector('button[type="submit"]');
        btnSubmit.disabled = true;
        btnSubmit.textContent = 'Agregando...';

        const response = await fetchAuthenticated(`${API_URL}/entrenadores`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(entrenadorData)
        });

        const data = await response.json();
        if (response.ok) {
            mostrarNotificacion(data.message || 'Entrenador agregado correctamente.', 'exito');
            cerrarModal(form.closest('.modal-contenido'));
            cargarEntrenadores();
        } else {
            mostrarNotificacion(data.message || 'Error al agregar entrenador.', 'error');
        }
    } catch (error) {
        console.error('Error al agregar entrenador:', error);
        mostrarNotificacion('Error de red al agregar entrenador.', 'error');
    } finally {
        const btnSubmit = form.querySelector('button[type="submit"]');
        btnSubmit.disabled = false;
        btnSubmit.textContent = 'Agregar Entrenador';
    }
}

async function manejarAgregarCliente(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const clienteData = {};

    formData.forEach((value, key) => {
        clienteData[key] = value;
    });

    // Añadir fecha_registro si no está en el formulario
    if (!clienteData.fecha_registro) {
        clienteData.fecha_registro = new Date().toISOString();
    }

    if (!clienteData.nombre || !clienteData.apellido || !clienteData.correo || !clienteData.rut || !clienteData.contraseña) {
        mostrarNotificacion('Por favor, completa todos los campos para el cliente.', 'error');
        return;
    }

    try {
        const btnSubmit = form.querySelector('button[type="submit"]');
        btnSubmit.disabled = true;
        btnSubmit.textContent = 'Agregando...';

        const response = await fetchAuthenticated(`${API_URL}/register`, { // Usando el mismo endpoint de registro, o uno dedicado para admin-añadir-usuario
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ...clienteData,
                tipo_usuario: 'usuario' // Establecer explícitamente como 'usuario'
            })
        });

        const data = await response.json();
        if (response.ok) {
            mostrarNotificacion(data.message || 'Cliente agregado correctamente.', 'exito');
            cerrarModal(form.closest('.modal-contenido'));
            cargarClientes();
        } else {
            mostrarNotificacion(data.message || 'Error al agregar cliente. ¿Ya existe el RUT/Email?', 'error');
        }
    } catch (error) {
        console.error('Error al agregar cliente:', error);
        mostrarNotificacion('Error de red al agregar cliente.', 'error');
    } finally {
        const btnSubmit = form.querySelector('button[type="submit"]');
        btnSubmit.disabled = false;
        btnSubmit.textContent = 'Agregar Cliente';
    }
}

function mostrarModalEditar(tipo, item) {
    // Esta función deberá ser lo suficientemente robusta para manejar formularios de edición para cada tipo
    // Debería prellenar el formulario con los datos del `item` y enviar una solicitud PUT al enviar.
    mostrarNotificacion(`La funcionalidad de editar ${tipo} se implementará con formularios modales`, 'info');
    // Ejemplo para 'clase':
    // if (tipo === 'clase') {
    //     mostrarModalInfo('Editar Clase', `
    //         <form id="form-editar-clase" class="formulario-modal">
    //             <input type="hidden" id="edit-clase-id" value="${item.id}">
    //             <div class="form-grupo">
    //                 <label for="edit-nombre-clase">Nombre:</label>
    //                 <input type="text" id="edit-nombre-clase" value="${item.nombre}" required>
    //             </div>
    //             ... otros campos
    //             <button type="submit" class="boton-primario">Guardar Cambios</button>
    //             <button type="button" class="boton-secundario" onclick="cerrarModal(this)">Cancelar</button>
    //         </form>
    //     `);
    //     document.getElementById('form-editar-clase').addEventListener('submit', (e) => manejarEditarClase(e, item.id));
    // }
}

function mostrarModalConfirmacion(mensaje, callback) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-contenido modal-confirmacion">
            <h3><i class="fas fa-exclamation-triangle" style="color: #f59e0b;"></i> Confirmación</h3>
            <p>${mensaje}</p>
            <div class="botones-confirmacion">
                <button class="boton-cancelar" onclick="cerrarModal(this)">Cancelar</button>
                <button class="boton-confirmar">Confirmar</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Añadir event listener directamente al botón
    modal.querySelector('.boton-confirmar').addEventListener('click', () => {
        callback();
        cerrarModal(modal.querySelector('.boton-confirmar'));
    });
}

function mostrarModalInfo(titulo, contenido) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-contenido">
            <div class="modal-header">
                <h3>${titulo}</h3>
                <button class="boton-cerrar-modal" onclick="cerrarModal(this)">&times;</button>
            </div>
            <div>${contenido}</div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function cerrarModal(elemento) {
    const modal = elemento.closest('.modal');
    if (modal) {
        modal.remove();
    }
}

function mostrarConfirmacionCerrarSesion() {
    mostrarModalConfirmacion(
        '¿Estás seguro de que quieres cerrar sesión?',
        cerrarSesion
    );
}

function cerrarSesion() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userRut');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('tipoUsuario');
    localStorage.removeItem('datosRecordados'); // También limpiar "recuérdame"
    
    mostrarNotificacion('Sesión cerrada correctamente', 'info');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}

function formatearFecha(fecha) {
    if (!fecha) return '';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-CL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function mostrarNotificacion(mensaje, tipo = 'info') {
    const notificacion = document.createElement('div');
    notificacion.className = `notificacion ${tipo}`;
    notificacion.innerHTML = `
        <i class="fas fa-${tipo === 'exito' ? 'check-circle' : tipo === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        ${mensaje}
    `;
    
    document.body.appendChild(notificacion);
    
    setTimeout(() => {
        notificacion.remove();
    }, 4000);
}