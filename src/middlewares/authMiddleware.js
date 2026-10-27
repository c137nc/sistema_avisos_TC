//iportamos librerias a utilizar
const jwt = require ('jsonwebtoken');

const verificarToken = (req, res, next) => {
    //como el token viaja en el header de la peticion, lo obtenemos de ahi
    const authHeader = req.headers['authorization'];
    //damos formato al token, ya que viene con el prefijo "Bearer ":
    //basicamente lo que hacemos es separar el contenido en un array y nos quedamos con la segunda parte
    const token = authHeader && authHeader.split(' ')[1];
    //validaos el token, si no existe, devolvemos codigo de error 401
    if (!token) {
        return res.status(401).json({ mensaje: 'Acceso denegado. Se requiere token de auntenticación' });
    }
    try {
        //validamos la firma y vigencia del token con la clave secreta
        //verify() devuelve la info que guardamos en el payload del token
        const decodificado = jwt.verify(token, process.env.JWT_SECRET || 'CLAVE_SECRETA_SISTEMA');
        //adjuntamos los datos decodificados al request para usarlos en el controlador
        req.usuario = decodificado;
        next(); //pasamos al siguiente middleware o controlador
    } catch (error) {
        return res.status(401).json({ mensaje: 'Token inválido o expirado' });
    }
};
// funcion para verificar el rol del usuario 

const  verificarRol = (rolPemitido) => {
    return (req, res, next) => {
        //comprobamos que exista la informacion del usuario 
        if (!req.usuario || !req.usuario.rol) {
            return res.status(401).json({ mensaje: 'Acceso denegado. Usuario no autenticado' });
        }
        //comprobamos que el rol del usuario sea el permitido
        if (req.usuario.rol.toLowerCase() !== rolPemitido.toLowerCase()) {
            return res.status(403).json({ mensaje: 'Acceso denegado. No tiene permisos para esta acción' });
        }
        //si el roll es correcto, pasamos al siguiente middleware o controlador
        next();
    }
};



//exportamos las funciones para poder usarlas en otros archivos
module.exports = {
    verificarToken,
    verificarRol
};