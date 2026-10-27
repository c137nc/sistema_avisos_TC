//importo librerias
//jsonwebtoken para poder generar tokens
const jwt = require('jsonwebtoken');
//bcrypt para encriptar contraseñas y comparar hashes
const bcrypt = require('bcryptjs');
//importo las funciones del modelo de usuario
const { crearUsuario, buscarUsuario } = require('../models/usuariosModel.js');
//importo las funciones del helper de usuario  
const { validarDatosLogin, validarDatosRegistro } = require('../helpers/validacionesUsuarios.js');
// ---- REGISTRO Y LOGIN DE USUARIO ----

const registrarUsuario = async (req, res) => {
    // desestructuro lo que me envian en el body
    const { nombre, apellido, email, password , id_rol } = req.body;
    //validamos los datos del registro
    const errorValidacion = validarDatosRegistro({ nombre, apellido, email, password , id_rol });
    if (errorValidacion) {
        return res.status(400).json({ mensaje: errorValidacion });
    }
    //para manejar errores de manera mas clara, usamos try catch
    try {
        //encriptamos la contraseña con brypt
        const hashPassword = await bcrypt.hash( password, 10); // 10 es el numero de rondas de encriptacion
        //solicitamos al modelo que registre el usuario en la base de datos
        const resultado = await crearUsuario(nombre,apellido,email,hashPassword,id_rol);
        //aviso al usuario que se registro correctamente
        return res.status(200).json({ mensaje: 'El usuario se ha regitrado correctamente', id_usuario: resultado.insertId });
    }
    catch (error) {
        //controlamos el caso de email duplicado que es un error de la bd
        if(error.code === 'ER_DUP_ENTRY'){
            return res.status(400).json({ mensaje: 'El email ya se encuentra registrado'});
        }
        console.error('Error al registrar usuario:', error);
        return res.status(500).json({ mensaje: 'Error al registrar el usuario' });
    }
};

const loginUsuario = async (req, res) => {
    // desestructuro lo que me envian en el body del request
    const { usuario, password } = req.body;

    //validaciones 
    const errorValidacion = validarDatosLogin({ usuario, password });
    if (errorValidacion) {
        return res.status(400).json({ mensaje: errorValidacion });
    }
    try {
        //solicitamos al modelo que busque el usuario en la base de datos
        const usuarioDB = await buscarUsuario(usuario);
        //si no existe el usuario, devolvemos error
        if (!usuarioDB) {
            return res.status(401).json({ mensaje: 'Usuario o contraseña incorrectos' });
        }
        // Verificamos que el usuario esté activo
        if (!usuarioDB.activo) {
            //colocamos este codigo y ensaje para no revelar un mail existente pero inactivo  (por seguridad)
            return res.status(401).json({ mensaje: 'Usuario o contraseña incorrectos' });
        }
        //COMPARAMOS HASH CON LA CONTRA QUE NOS ENVIARON EN EL BODY DEL REQUEST
        const coincide = await bcrypt.compare(password, usuarioDB.password);
        //si no coincide, devolvemos error
        if (!coincide) {
            return res.status(401).json({ mensaje: 'Usuario o contraseña incorrectos' });
        }
        //si coincide, generamos el token y lo devolvemos al cliente
        const payload = {
            id: usuarioDB.id_usuario,
            usuario: usuarioDB.email,
            rol: usuarioDB.rol
        };
        //firmamos el token con la clave secreta y le damos un tiempo de expiracion
        const token = jwt.sign(payload,process.env.JWT_SECRET || 'CLAVE_SECRETA_SISTEMA', { expiresIn: '1h' });
        //enviamos el token al cliente
        return res.status(200).json({ 
            mensaje: 'Autenticación exitosa',
            token: token,
            rol: usuarioDB.rol });

    }
    catch (error) {
        console.error('Error al iniciar sesión:', error);
        return res.status(500).json({ mensaje: 'Error al iniciar sesión' });
    }
};

module.exports = {
    registrarUsuario,
    loginUsuario
}