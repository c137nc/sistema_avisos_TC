//importo conexion a la bbdd
const connection = require('../../database/sistema_avisos_db');

//Crear Usuario
const crearUsuario = (nombre, apellido, email, password , id_rol) => {
    //retorno una promesa para poder usar async await en el controller
    return new Promise((resolve, reject) => {
        //defino query para insertar usuario
        const queryRegistrarUsuario = `
            INSERT INTO usuarios (
                nombre,
                apellido,
                email,
                password,
                id_rol,
                activo
            )
            VALUES (?, ?, ?, ?, ?, 1)
        `;
        //ejecuto la query con la conexion a la base de datos
        connection.query(queryRegistrarUsuario,[nombre, apellido, email, password , id_rol], (error, resultado) => {
            if (error) {
                //rechazamos la promesa con el error
                reject(error);
                return;
            }
            //resolvemos la promesa con el resultado
            resolve(resultado);
        })
    });
};

//Login Usuario
const buscarUsuario = (email) => {
    //retorno una promesa para poder usar async await en el controller 
    return new Promise((resolve,reject) => {
        //defino query para buscar usuario
        const queryBuscarUsuario = `
        SELECT u.id_usuario, u.email, u.password, u.activo, r.nombre_rol AS rol
        FROM usuarios u
        INNER JOIN roles r ON u.id_rol = r.id_rol
        WHERE u.email = ?
        `;

        //ejecuto la query con la conexion a la base de datos
        connection.query(queryBuscarUsuario, [email], (error,resultado) => {
            //si hay error rechazamos
            if (error) {
                reject(error);
                return;
            }
            //si no hay error resolvemos con el resultado
            resolve(resultado[0]);
        })
    })
};
//exporto las funciones para poder usarlas en el controller
module.exports = {
    crearUsuario,
    buscarUsuario
};