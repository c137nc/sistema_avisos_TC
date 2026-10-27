//funcion para validar datos del login

const validarDatosLogin = (datos) => {
    //desestructurar los datos
    const { usuario, password } = datos;
    //validacion Usuario
    if (typeof usuario !== 'string' || usuario.trim() === '') {
        return 'El campo usuario es obligatorio';
    }
    //validacion Password
    if (typeof password !== 'string' || password.trim() === '') {
        return 'El campo contraseña es obligatorio';
    }
    //si pasa todas las validaciones
    return null;
}

//funcion para validar datos del registro
const validarDatosRegistro = (datos) => {
    //desestructurar los datos
    const { nombre, apellido, email, password , id_rol } = datos;
    //validacion Nombre
    if (typeof nombre !== 'string' || nombre.trim() === '') {
        return 'El campo nombre es obligatorio';
    }
    //validacion Apellido
    if (typeof apellido !== 'string' || apellido.trim() === '') {
        return 'El campo apellido es obligatorio';
    }
    //validacion Email
    if (typeof email !== 'string' || email.trim() === '') {
        return 'El campo email es obligatorio';
    }
    //validacion adicional para verificar que el email tenga un formato valido
    //quito espacios al principio y al final del email
    const emailFormateado = email.trim();
    //posicion del @ en el email
    const posicionArroba = emailFormateado.indexOf('@');
    //posicion del ultimo punto en el email
    const posicionUltimoPunto = emailFormateado.lastIndexOf('.');
    //si el @ no esta presente o esta al principio o al final del email, o si el ultimo punto esta antes del @, 
    // o si el ultimo punto esta al final del email, entonces el email es invalido
    if (posicionArroba <= 0 || posicionUltimoPunto <= posicionArroba + 1 || posicionUltimoPunto === emailFormateado.length - 1) {
        return 'El campo email debe tener un formato valido';
    }
    //validacion Password
    if (typeof password !== 'string' || password.trim() === '') {
        return 'El campo contraseña es obligatorio';
    }
    //validacion ID Rol
    if (typeof id_rol !== 'number' || !Number.isInteger(id_rol)|| id_rol <= 0) {
        return 'El rol ingresado no es valido';
    }
    //si pasa todas las validaciones
    return null;
}
//ponemos disponeble la funcion para poder usarla en otros archivos
module.exports = {
    validarDatosLogin,
    validarDatosRegistro
};