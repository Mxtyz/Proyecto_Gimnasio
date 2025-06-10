// Carga las variables de entorno desde el archivo .env
require('dotenv').config();

const express = require('express');
const { Pool } = require('pg');
const cors = require('cors'); // Importa CORS
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const port = process.env.PORT || 3000;

// Configuración de la base de datos PostgreSQL
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 5432,
});

// Testear la conexión a la base de datos al inicio
pool.connect()
    .then(() => console.log('Conexión a PostgreSQL exitosa'))
    .catch(err => console.error('Error al conectar a PostgreSQL:', err.stack));

// Clave secreta para JWT (debería ser una variable de entorno en producción)
const JWT_SECRET = process.env.JWT_SECRET || 'mi_clave_secreta_super_segura'; // ¡Cambia esto en tu .env!

// --- Configuración CORS específica para Live Server ---
// Define los orígenes permitidos explícitamente.
// Esto es crucial cuando tu frontend (Live Server) está en un puerto diferente.
// Asegúrate de incluir el puerto exacto de Live Server.
const allowedOrigins = [
    'http://localhost:5500',  // O el puerto exacto que usa Live Server
    'http://127.0.0.1:5500',  // Live Server a menudo usa esta IP también
    // Puedes añadir otros orígenes si tu frontend se sirve desde otros lugares (ej. 'http://your-domain.com')
];

app.use(cors({
    origin: function (origin, callback) {
        // Permite solicitudes sin origen (como las de 'file://' para algunos navegadores, o Postman/cURL)
        // aunque lo ideal es que Live Server siempre tenga un origen.
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = `La política CORS para este sitio no permite el acceso desde el origen especificado: ${origin}.`;
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Métodos HTTP permitidos
    allowedHeaders: ['Content-Type', 'Authorization'], // Encabezados permitidos que tu frontend puede enviar
    credentials: true // Importante si envías cookies o encabezados de autorización (como el token JWT)
}));
// --- Fin de la configuración CORS ---

// Middleware para parsear JSON en las solicitudes
app.use(express.json());

// Middleware de autenticación (para proteger rutas)
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Formato: Bearer TOKEN

    if (token == null) {
        console.log('No token provided. Access Denied (401).');
        return res.sendStatus(401); // Si no hay token
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            console.log('Invalid or expired token. Access Forbidden (403).', err.message);
            return res.sendStatus(403); // Token inválido o expirado
        }
        req.user = user; // Guarda la información del usuario en la solicitud (rut, tipoUsuario)
        next();
    });
};

// Middleware para verificar si el usuario es un entrenador o administrador
const requireTrainerRole = (req, res, next) => {
    // Permite tanto 'entrenador' como 'administrador'
    if (!req.user || (req.user.tipoUsuario !== 'entrenador' && req.user.tipoUsuario !== 'administrador')) {
        console.log(`Access Denied: User role is ${req.user ? req.user.tipoUsuario : 'undefined'}. Trainer or Admin role required.`);
        return res.status(403).json({ message: 'Acceso denegado. Se requiere rol de entrenador o administrador.' });
    }
    next();
};

// --- Rutas de Autenticación ---

// Ruta de Registro de Usuario
app.post('/api/register', async (req, res) => {
    const { rut, nombre, apellido, correo, contraseña, tipoUsuario, telefono } = req.body;

    if (!rut || !nombre || !apellido || !correo || !contraseña || !tipoUsuario) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
    }

    try {
        const hashedPassword = await bcrypt.hash(contraseña, 10);

        const result = await pool.query(
            'INSERT INTO usuario (rut, nombre, apellido, correo, contraseña, tipousuario, telefono) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [rut, nombre, apellido, correo, hashedPassword, tipoUsuario, telefono]
        );
        res.status(201).json({ message: 'Usuario registrado exitosamente', user: result.rows[0] });
    } catch (err) {
        console.error('Error al registrar usuario:', err);
        if (err.code === '23505') { // Código de error para duplicado (UNIQUE violation)
            return res.status(409).json({ message: 'El Rut o correo ya está registrado.' });
        }
        res.status(500).json({ message: 'Error interno del servidor al registrar usuario.' });
    }
});

// Ruta de Login de Usuario
app.post('/api/login', async (req, res) => {
    const { nombre_usuario, contraseña } = req.body;

    if (!nombre_usuario || !contraseña) {
        return res.status(400).json({ message: 'Por favor, introduce tu usuario y contraseña.' });
    }

    try {
        const result = await pool.query(
            'SELECT * FROM usuario WHERE rut = $1 OR correo = $1',
            [nombre_usuario]
        );

        const user = result.rows[0];

        if (!user) {
            return res.status(400).json({ message: 'Usuario o contraseña incorrectos.' });
        }

        const isPasswordValid = await bcrypt.compare(contraseña, user.contraseña);

        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Usuario o contraseña incorrectos.' });
        }

        const accessToken = jwt.sign(
            { rut: user.rut, tipoUsuario: user.tipousuario }, // Asegúrate de que el payload coincida con `req.user.tipoUsuario`
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({
            message: 'Inicio de sesión exitoso.',
            accessToken: accessToken,
            tipoUsuario: user.tipousuario,
            rut: user.rut,
            nombre: user.nombre
        });

    } catch (err) {
        console.error('Error al iniciar sesión:', err);
        res.status(500).json({ message: 'Error interno del servidor al iniciar sesión.' });
    }
});

app.get('/api/checkAuth', authenticateToken, (req, res) => {
    res.json({ isAuthenticated: true, tipoUsuario: req.user.tipoUsuario });
});

// --- Rutas del Tablero (protegidas con autenticación) ---

// MODIFICACIÓN EN server.cjs para app.get('/api/clases')
app.get('/api/clases', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                c.idclase,
                c.nombreclase,
                c.descripcion,
                c.duracion,
                c.cupos,
                h.idhorario,
                h.fecha,
                h.horainicio,
                h.horafin,
                h.estado AS horariostado,
                u.nombre AS instructornombre,
                u.apellido AS instructorapellido,
                s.nombre AS salanombre
            FROM
                clase c
            LEFT JOIN  -- <-- ¡CAMBIO IMPORTANTE AQUÍ! De JOIN a LEFT JOIN
                horario h ON c.idclase = h.idclase
            LEFT JOIN  -- También es buena práctica cambiar estos a LEFT JOIN
                usuario u ON h.rutusuario = u.rut
            LEFT JOIN
                sala s ON h.idsala = s.idsala
            WHERE h.estado = TRUE OR h.idhorario IS NULL -- Para incluir clases sin horario, o solo horarios activos
            ORDER BY c.nombreclase, h.fecha, h.horainicio;
        `);

        const clasesAgrupadas = {};
        result.rows.forEach(row => {
            if (!clasesAgrupadas[row.idclase]) {
                clasesAgrupadas[row.idclase] = {
                    id: row.idclase,
                    nombre: row.nombreclase,
                    descripcion: row.descripcion,
                    duracion: `${row.duracion} minutos`,
                    cupos: row.cupos,
                    // Maneja el caso de que no haya instructor si la clase no tiene horario
                    instructor: row.instructornombre ? `${row.instructornombre} ${row.instructorapellido}` : 'Sin asignar',
                    horarios: []
                };
            }
            // Solo agrega horarios si existen y están activos.
            // Los campos de h. (horario) serán NULL si no hay coincidencia.
            if (row.idhorario && row.horariostado) {
                const fechaHora = new Date(row.fecha + 'T' + row.horainicio);
                const diaSemana = fechaHora.toLocaleDateString('es-ES', { weekday: 'long' });
                const horaInicio = row.horainicio.substring(0, 5);

                clasesAgrupadas[row.idclase].horarios.push({
                    idHorario: row.idhorario,
                    fecha: row.fecha,
                    horaInicio: row.horainicio,
                    horaFin: row.horafin,
                    display: `${diaSemana} ${horaInicio} - ${row.salanombre || 'Sala sin asignar'}`
                });
            }
        });

        res.json(Object.values(clasesAgrupadas));
    } catch (err) {
        console.error('Error al obtener clases y horarios:', err);
        res.status(500).json({ message: 'Error interno del servidor al obtener clases.' });
    }
});

// Obtener todas las reservas del usuario autenticado (o todas si es entrenador/admin)
app.get('/api/reservas', authenticateToken, async (req, res) => {
    const { rut, tipoUsuario } = req.user;

    try {
        let query = `
            SELECT
                r.idreserva,
                r.fechareserva,
                r.estadoreserva,
                h.fecha AS fechorario,
                h.horainicio,
                h.horafin,
                c.nombreclase,
                iu.nombre AS instructornombre,
                iu.apellido AS instructorapellido,
                ru.nombre AS reservausuarionombre,
                ru.apellido AS reservausuarioapellido
            FROM
                reserva r
            JOIN
                horario h ON r.idhorario = h.idhorario
            JOIN
                clase c ON h.idclase = c.idclase
            JOIN
                usuario iu ON h.rutusuario = iu.rut
            JOIN
                usuario ru ON r.rutusuario = ru.rut
        `;
        let params = [];

        // Si el usuario autenticado es un 'usuario' (cliente), solo ve sus propias reservas
        if (tipoUsuario === 'usuario') {
            query += ' WHERE r.rutusuario = $1';
            params.push(rut);
        }
        // Si es 'entrenador' o 'administrador', pueden ver todas las reservas.
        // No se añade WHERE y params para ellos.

        query += ' ORDER BY r.fechareserva DESC;';

        const result = await pool.query(query, params);

        const reservasFormateadas = result.rows.map(reserva => ({
            id: reserva.idreserva,
            clase: reserva.nombreclase,
            fecha: new Date(reserva.fechorario).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }),
            hora: `${reserva.horainicio.substring(0, 5)} - ${reserva.horafin.substring(0, 5)}`,
            instructor: `${reserva.instructornombre} ${reserva.instructorapellido}`,
            estado: reserva.estadoreserva ? 'confirmada' : 'cancelada', // O el estado que uses
            // Añadir información del usuario que reservó si el rol lo permite (ej. para entrenador/admin)
            usuarioReserva: (tipoUsuario === 'entrenador' || tipoUsuario === 'administrador') ? `${reserva.reservausuarionombre} ${reserva.reservausuarioapellido}` : undefined
        }));

        res.json(reservasFormateadas);
    } catch (err) {
        console.error('Error al obtener reservas:', err);
        res.status(500).json({ message: 'Error interno del servidor al obtener reservas.' });
    }
});

// Obtener lista de entrenadores
app.get('/api/entrenadores', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                rut AS id,
                nombre AS nombre,
                apellido AS apellido,
                correo AS correo,
                telefono AS telefono
            FROM
                usuario
            WHERE
                tipousuario = 'entrenador';
        `);

        const entrenadoresFormateados = result.rows.map(entrenador => ({
            id: entrenador.id,
            nombre: `${entrenador.nombre} ${entrenador.apellido}`,
            telefono: entrenador.telefono || 'No disponible'
        }));

        res.json(entrenadoresFormateados);
    } catch (err) {
        console.error('Error al obtener entrenadores:', err);
        res.status(500).json({ message: 'Error interno del servidor al obtener entrenadores.' });
    }
});

// Crear una nueva reserva
app.post('/api/reservas', authenticateToken, async (req, res) => {
    const { idHorario } = req.body;
    const { rut: usuarioRut } = req.user; // Rut del usuario autenticado

    if (!idHorario) {
        return res.status(400).json({ message: 'Se requiere el ID del horario para la reserva.' });
    }

    try {
        const horarioInfo = await pool.query(`
            SELECT
                h.estado,
                c.cupos,
                h.idclase
            FROM
                horario h
            JOIN
                clase c ON h.idclase = c.idclase
            WHERE h.idhorario = $1;
        `, [idHorario]);

        if (horarioInfo.rows.length === 0 || !horarioInfo.rows[0].estado) {
            return res.status(404).json({ message: 'Horario no encontrado o no disponible.' });
        }

        const { cupos } = horarioInfo.rows[0];

        // Contar reservas existentes para este horario
        const reservasExistentes = await pool.query(
            'SELECT COUNT(*) FROM reserva WHERE idhorario = $1 AND estadoreserva = TRUE;',
            [idHorario]
        );

        if (parseInt(reservasExistentes.rows[0].count) >= cupos) {
            return res.status(400).json({ message: 'No hay cupos disponibles para esta clase.' });
        }

        // Verificar si el usuario ya tiene una reserva para este horario
        const usuarioYaReservado = await pool.query(
            'SELECT COUNT(*) FROM reserva WHERE idhorario = $1 AND rutusuario = $2;',
            [idHorario, usuarioRut]
        );

        if (parseInt(usuarioYaReservado.rows[0].count) > 0) {
            return res.status(400).json({ message: 'Ya tienes una reserva para este horario.' });
        }

        // Crear la reserva
        const result = await pool.query(
            'INSERT INTO reserva (fechareserva, estadoreserva, rutusuario, idhorario) VALUES (CURRENT_DATE, TRUE, $1, $2) RETURNING *',
            [usuarioRut, idHorario]
        );
        res.status(201).json({ message: 'Reserva creada exitosamente.', reserva: result.rows[0] });

    } catch (err) {
        console.error('Error al crear reserva:', err);
        res.status(500).json({ message: 'Error interno del servidor al crear reserva.' });
    }
});

// Cancelar una reserva
app.delete('/api/reservas/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { rut: usuarioRut, tipoUsuario } = req.user;

    try {
        let query;
        let params;

        if (tipoUsuario === 'usuario') {
            query = 'UPDATE reserva SET estadoreserva = FALSE WHERE idreserva = $1 AND rutusuario = $2 RETURNING *;';
            params = [id, usuarioRut];
        } else { // Si es entrenador o administrador, puede cancelar cualquier reserva
            query = 'UPDATE reserva SET estadoreserva = FALSE WHERE idreserva = $1 RETURNING *;';
            params = [id];
        }

        const result = await pool.query(query, params);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Reserva no encontrada o no tienes permiso para cancelarla.' });
        }

        res.json({ message: 'Reserva cancelada exitosamente.', reserva: result.rows[0] });
    } catch (err) {
        console.error('Error al cancelar reserva:', err);
        res.status(500).json({ message: 'Error interno del servidor al cancelar reserva.' });
    }
});

// --- Rutas solo para Entrenadores y Administradores ---

// Obtener todos los usuarios (clientes, entrenadores, administradores)
app.get('/api/usuarios', authenticateToken, requireTrainerRole, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                rut,
                nombre,
                apellido,
                correo,
                telefono,
                tipousuario
            FROM
                usuario;
        `);
        res.json(result.rows);
    } catch (err) {
        console.error('Error al obtener usuarios:', err);
        res.status(500).json({ message: 'Error interno del servidor al obtener usuarios.' });
    }
});

// Agregar una nueva clase (incluyendo horario)
app.post('/api/clases/simple', authenticateToken, requireTrainerRole, async (req, res) => {
    // Nota: Los nombres de las propiedades aquí deben coincidir con los "name" de tus inputs en el frontend
    const { nombre, descripcion, duracion, capacidad } = req.body;

    // Asegúrate de que los nombres de las columnas en tu tabla `clase` sean correctos
    if (!nombre || !descripcion || !duracion || !capacidad) {
        return res.status(400).json({ message: 'Todos los campos (nombre, descripción, duración, cupos) son obligatorios.' });
    }

    try {
        const result = await pool.query(
    'INSERT INTO clase (nombreclase, descripcion, duracion, cupos) VALUES ($1, $2, $3, $4) RETURNING *;',
    [nombre, descripcion, duracion, capacidad]
);
        res.status(201).json({
            message: 'Clase agregada exitosamente.',
            clase: result.rows[0]
        });
    } catch (err) {
        console.error('Error al agregar clase:', err);
        // Si el error es por una restricción de unicidad, por ejemplo
        if (err.code === '23505') {
            return res.status(409).json({ message: 'Ya existe una clase con ese nombre.' });
        }
        res.status(500).json({ message: 'Error interno del servidor al agregar clase.' });
    }
});

// Editar una clase (puedes decidir si editas solo la clase o también los horarios)
app.put('/api/clases/:idClase', authenticateToken, requireTrainerRole, async (req, res) => {
    const { idClase } = req.params;
    const { nombreClase, descripcion, duracion, cupos } = req.body;

    if (!nombreClase || !descripcion || !duracion || !cupos) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios para actualizar la clase.' });
    }

    try {
        const result = await pool.query(
            'UPDATE clase SET nombreclase = $1, descripcion = $2, duracion = $3, cupos = $4 WHERE idclase = $5 RETURNING *;',
            [nombreClase, descripcion, duracion, cupos, idClase]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Clase no encontrada.' });
        }

        res.json({ message: 'Clase actualizada exitosamente.', clase: result.rows[0] });
    } catch (err) {
        console.error('Error al actualizar clase:', err);
        res.status(500).json({ message: 'Error interno del servidor al actualizar clase.' });
    }
});

// Eliminar una clase
app.delete('/api/clases/:idClase', authenticateToken, requireTrainerRole, async (req, res) => {
    const { idClase } = req.params;

    try {
        await pool.query('BEGIN');

        // Eliminar reservas relacionadas si no usas ON DELETE CASCADE
        await pool.query('DELETE FROM reserva WHERE idhorario IN (SELECT idhorario FROM horario WHERE idclase = $1);', [idClase]);

        // Eliminar horarios relacionados si no usas ON DELETE CASCADE
        await pool.query('DELETE FROM horario WHERE idclase = $1;', [idClase]);

        // Eliminar la clase
        const result = await pool.query('DELETE FROM clase WHERE idclase = $1 RETURNING *;', [idClase]);

        if (result.rows.length === 0) {
            await pool.query('ROLLBACK');
            return res.status(404).json({ message: 'Clase no encontrada.' });
        }

        await pool.query('COMMIT');
        res.json({ message: 'Clase eliminada exitosamente.', clase: result.rows[0] });
    } catch (err) {
        await pool.query('ROLLBACK');
        console.error('Error al eliminar clase:', err);
        res.status(500).json({ message: 'Error interno del servidor al eliminar clase.' });
    }
});


// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
    // La prueba de conexión a la base de datos ya se hace al inicio con pool.connect()
});