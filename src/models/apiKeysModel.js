//importamos la conexion a la base de datos
const connection = require('../../database/sistema_avisos_db');
//importamos la libreria crypto para generar el hash de la api key y poder generar los bytes aletorios
const crypto = require('crypto');

//Generamos una nueva api key
const crearApiKey = (nombreConsumidor) => {
    // generamos una clave aleatoria de 32 bytes y la convertimos a hexadecimal
    const apiKey = 'ak_' + crypto.randomBytes(32).toString('hex');

    //generamos el hash de la clave para almacenarla en la base de datos de forma segura
    const claveHash = crypto.createHash('sha256').update(apiKey).digest('hex');
    //obtenemos el prefijo para identificar la clave en la base de datos
    const prefijo = apiKey.substring(0,10);

    //creamos la query para insertar la api key en la base de datos
    const query = `
        INSERT INTO api_keys(nombre_consumidor, clave_hash, prefijo)
        VALUES (?, ?, ?)`
        ;
    //usamos la conexion a la base de datos para ejecutar la query
    return new Promise((resolve, reject) => {
        connection.query(query, [nombreConsumidor, claveHash, prefijo], (error, resultado) => {
            if(error) {
                return reject(error);
            }
            //devolvemos la clave original para poder mostrarla al administrador, pero se almacena el hash en la bd
            resolve({
                id_api_key: resultado.insertId,
                nombre_consumidor: nombreConsumidor,
                api_key: apiKey
            });
        })
    })
};


// Buscar una API Key por su hash
const buscarApiKeyPorHash = (claveHash) => {

    const query = `
        SELECT id_api_key, nombre_consumidor,
               activa, limite_solicitudes, solicitudes_realizadas
        FROM api_keys
        WHERE clave_hash = ?
        AND activa = TRUE
        AND (fecha_vencimiento IS NULL OR fecha_vencimiento > NOW())
        LIMIT 1
    `;

    return new Promise((resolve, reject) => {
        connection.query(query, [claveHash], (error, resultado) => {
            //si no existe la clave o esta inactiva, devolvemos null y rechazamos el acceso
            if (error) {
                return reject(error);
            }

            resolve(resultado[0]);
        });
    });
};


// Registrar una solicitud realizada por el dispositivo
const registrarSolicitud = (idApiKey) => {

    const query = `
        UPDATE api_keys
        SET solicitudes_realizadas = solicitudes_realizadas + 1
        WHERE id_api_key = ?
        AND activa = TRUE
        AND (fecha_vencimiento IS NULL OR fecha_vencimiento > NOW())
        AND solicitudes_realizadas < limite_solicitudes
    `;

    return new Promise((resolve, reject) => {
        connection.query(query, [idApiKey], (error, resultado) => {
            if (error) {
                return reject(error);
            }
            // si se registra correctamente devuelve true si no se pudo registrar devuelve false
            resolve(resultado.affectedRows > 0);
        });
    });
};


module.exports = {
    crearApiKey,
    buscarApiKeyPorHash,
    registrarSolicitud
};

