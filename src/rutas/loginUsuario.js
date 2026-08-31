const express = require ('express');
const router = express.Router();

//traigo a cors para poder hacer peticiones desde el front
const cors = require('cors');
router.use(cors());
//traigo a jsonwebtoken para poder generar tokens
const jwt = require('jsonwebtoken');

//invocamos la libreria bcrypt para encriptar contraseñas
const bcrypt = require('bcryptjs');


// ------ESTABLECEMOS LAS RUTAS DE NUESTRO SERVIDOR-----
// registro de usurio

router.post('/registrar' , async (req , res) => {
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
router.post('/login', (req, res) => {
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
            { expiresIn: '1h' } //el token expira en 1 hora => cambiar a media hora 
        );
        //enviamos el token al cliente
        return res.status(200).json({ 
            message: 'Login exitoso',
            token: token,
            rol: usuarioDB.rol });
    });
});

//exporto
module.exports = router;