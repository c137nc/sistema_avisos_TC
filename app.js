//traigo a dotenv para poder usar variables de entorno
const dotenv = require('dotenv');
//indicmos a donde esta el archivo .env
dotenv.config({ path: './env/.env' });

//traigo a express
const express = require('express');
const app = express();

//traigo a cors para poder hacer peticiones desde el front
const cors = require('cors');
app.use(cors());
//traigo a jsonwebtoken para poder generar tokens
const jwt = require('jsonwebtoken');

//configuramos puerto
const PORT = 3000;

//usamos libreria para capturar datos de formularios
app.use(express.urlencoded({ extended: false }));
//HACEMOS QUE ENTIENDA JSON
app.use(express.json());


// *


//invocamos la libreria bcrypt para encriptar contraseñas
const bcrypt = require('bcryptjs');

//invocamos la libreria express-session para manejar sesiones
const session = require('express-session');
//configuramos la sesion
app.use(session({
    secret: 'secret', //clave que usa express-session para firmar la cookie de sesion
    resave: true, // guarda la sesion en cada peticion, aunque no haya cambios
    saveUninitialized: true // guarda la sesion aunque no haya sido inicializada    
}));

//invocamos al modulo de conexion a la base de datos
const connection = require('./database/sistema_avisos_db.js');

//traigo referencia de archivo aviso.js 
const avisos_array = require('./aviso.js');

// ------ESTABLECEMOS LAS RUTAS DE NUESTRO SERVIDOR-----
// registro de usurio

app.post('/registrar' , async (req , res) => {
    // desestructuro lo que me envian en el body
    const { nombre, apellido, email, password , id_rol } = req.body;

    //validaciones 
    if (!nombre || !apellido || !email || !password || !id_rol) {
        return res.status(400).json({ message: ' Los campos no pueden estar vacios' });
    }
    //para manejar errores de manera mas clara, usamos try catch
    try {
        //encriptamos la contraseña con brypt
        const hashPassword = await bcrypt.hash( password, 10); // 10 es el numero de rondas de encriptacion

        //guardo la query para insertar usuario
        const query = `
            INSERT INTO usuarios (nombre , apellido, email, password, id_rol , activo)
            VALUES (?, ?, ?, ?, ?, 1)
        `;

        //ejecutamos la query con la conexion a la base de datos
        connection.query(query, [nombre, apellido, email, hashPassword, id_rol], (error, results) => {
            if (error) {
                //controlamos que el mail no se repita
                if (error.code === 'ER_DUP_ENTRY') {
                    return res.status(400).json({ message: 'El email ya esta registrado' });
                }
                console.log('Error al registrar: ', error) ;
                return res.status(500).json({ message: 'Error interno' });
            }
            // si todo sale bien, avisamos al usuario que se registro correctamente 
            return res.status(200).json({ message: 'El usuario se registro correctamente' , id_usuario: results.insertId });
        });
    }
    catch (error) {
        console.log('Error al registrar: ', error);
        return res.status(500).json({ message: 'Error al procesar la solicitud' });
    }
});
//login de usuario
app.post('/login', (req, res) => {
    // desestructuro lo que me envian en el body del request
    const { usuario, password } = req.body;

    //validaciones 
    if (!usuario   || !password) {
        return res.status(400).json({ message: 'Los campos no pueden estar vacios' });
    }

    //guardo la query en una variable para poder usarla en la conexion a la base de datos
    const query = `
        SELECT u.id_usuario, u.email, u.password, u.activo, r.nombre_rol AS rol
        FROM usuarios u
        INNER JOIN roles r ON u.id_rol = r.id_rol
        WHERE u.email = ?
    `;
    // *consulto en la base de datos si existe el usuario*
    connection.query(query, [usuario], async (error, results) => {
        if (error) {
            return res.status(500).json({ message: 'Error en la consulta a la base de datos' });
        }

        // si no hay resultados, el usuario no existe
        if (results.length === 0) {
            return res.status(401).json({ message: 'Usuario no encontrado' });
        }

        // si hay resultados, el usuario existe
        const usuarioDB = results[0];

        //COMPARAMOS LA CONTRASEÑA ENCRIPTADA (HASH) CON LA QUE NOS ENVIARON EN EL BODY DEL REQUEST
        const coincide = await bcrypt.compare(password, usuarioDB.password);

        //controlo si la contraseña coincide con el hash que guarde en la bd xq me dba error  
        console.log(' ¿Coinciden?:', coincide);

        if(!coincide) {
            return res.status(401).json({ message: 'Contraseña incorrecta' });
        }
        //si hay coincidencia, generamos un token con jwt
        const token = jwt.sign(
            { id: usuarioDB.id_usuario, rol: usuarioDB.rol },
            process.env.JWT_SECRET || 'CLAVE_SECRETA_SISTEMA',
            { expiresIn: '1h' } //el token expira en 1 hora
        );
        //enviamos el token al cliente
        return res.status(200).json({ 
            message: 'Login exitoso',
            token: token,
            rol: usuarioDB.rol });
    });
});

//enciendo el servidor - va al final del archivo
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
    }
);

/* para terminar despues el crud de avisos 

// -----rutas------

//listar
app.get('/avisos', (req, res) => {
    return res.json(avisos_array);

    }
);

//cargar un aviso nuevo
app.post('/avisos', (req, res) => {
    //capturo lo que envien en el req 
    let nuevoAviso = {
        id: avisos_array.length + 1,
        titulo: req.body.titulo,
        descripcion: req.body.descripcion
    }
    //lo agrego al array
    avisos_array.push(nuevoAviso);
    return res.status(200).json(nuevoAviso);
});

//eliminar un aviso por id
app.delete('/avisos/:id', (req, res) => {
    let id = req.params.id;
    let indiceBuscado = avisos_array.findIndex(aviso => aviso.id == id);
    if (indiceBuscado >= 0) {
        avisos_array.splice(indiceBuscado, 1);
        return res.status(200).json({ message: `Aviso con id ${id} eliminado` });
    }
    return res.status(404).json({ message: `Aviso con id ${id} no encontrado` });
});

*/