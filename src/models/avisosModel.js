//importo conexion a la bbdd
const connection = require('../../database/sistema_avisos_db');

//funcion para obtener aviso por id
const obtenerAvisoPorId = (id_aviso) => {
    return new Promise ((resolve , reject) => {
        //defino mi query
        const queryObtenerAviso = `
            SELECT *
            FROM avisos
            WHERE id_aviso = ?
        `;
        //ejecuto la query
        connection.query(queryObtenerAviso, [id_aviso], (error , resultado) => {
            if (error) {
                //rechazo la promesa
                reject(error);
                //corto
                return;
            }
            //si no hay error, resuelvo la promesa con el resultado
            resolve(resultado[0]); //devuelvo el aviso encontrado o undefined si no existe
        })
    })
};

//funcion para modificar un aviso 
const modificarAvisoModel = (id, titulo, descripcion, fecha_publicacion, fecha_vencimiento, id_categoria, todos_edificios, todas_carreras) => {
    return new Promise((resolve, reject) => {
        //defino la query para modificar el aviso
        const queryModificar = `
        UPDATE avisos
        SET titulo = ?,
        descripcion = ?,
        fecha_publicacion = ?,
        fecha_vencimiento = ?,
        id_categoria = ?,
        todos_edificios = ?,
        todas_carreras = ?
        WHERE id_aviso = ?
        `;
        // ejecutamos la query creada para modificar
        connection.query(queryModificar, [titulo, descripcion, fecha_publicacion, fecha_vencimiento, id_categoria, todos_edificios, todas_carreras, id], (error, resultado) => {
            if (error) {
                reject(error);
                return;
            }
            //eliminamos las relaciones en la tabla intermedia 
            const queryEliminarRelacionesEdificios = ` 
            DELETE FROM avisos_edificios
            WHERE id_aviso = ?`;
            connection.query(queryEliminarRelacionesEdificios, [id], (error, resultado) => {
                if (error) {
                    reject(error);
                    return;
                }
                //eliminamos las relaciones de carreras en la tabla intermedia
                const queryEliminarRelacionesCarreras = ` 
                DELETE FROM avisos_carreras
                WHERE id_aviso = ?`;
                connection.query(queryEliminarRelacionesCarreras, [id], (error, resultado) => {
                    if (error) {
                        reject(error);
                        return;
                    }
                    //si todas las consultas se ejecutaron correctamente, resolvemos avisando que todo salio bien
                    resolve(true);
                });
            })
        });
    })
};

//funcion para verificar si existen todos los ids del array de edificios y que sea un array lo que envian
function existenEdificios(idsEdificios) {
    //usamos promise porque sql va a responder mas adelante y debemos hacerle saber que tiene que esperar
    return new Promise((resolve, reject) => {
        //logica para buscar coincidencias en la bbdd
        //priero necesito saber cuantos elementos habra en el array, generamos array con esa cantidad
        const arrayElementos = idsEdificios.map(() => '?').join(',');
        //query
        const query = `
            SELECT id_edificio
            FROM edificios
            WHERE id_edificio IN (${arrayElementos})
        `;
        //ahora si hago la consulta
        connection.query(query,idsEdificios, (error,resultado) => {
            if(error){
                //rechazo la promesa
                reject(error);
                return;
            }
            //verificamos si TODOS los ids existen
            resolve(resultado.length === idsEdificios.length);

        });
    });
};

//funcion para verificar si existen todos los ids de carreras
function existenCarreras(idsCarreras){
    //usamos promise porque sql va a responder mas adelante y debemos hacerle saber que tiene que esperar
    return new Promise((resolve, reject) => {
        //logica para buscar coincidencias en la bbdd
        //priero necesito saber cuantos elementos habra en el array
        const arrayComparacion = idsCarreras.map(() => '?').join(',');
        //query
        const query = `
            SELECT id_carrera
            FROM carreras
            WHERE id_carrera IN (${arrayComparacion})
        `;
        //ahora si hago la consulta
        connection.query(query,idsCarreras, (error,resultado) => {
            if(error){
                //rechazo la promesa
                reject(error);
                return;
            }
            //verificamos si TODOS los ids existen
            resolve(resultado.length === idsCarreras.length);

        });
    });

};

//funcion para VERIFICAR SI EXISTE CATEGORIA en bbdd
function existeCategoria(id_categoria) {
    //usamos promise porque sql va a responder mas adelante y debemos hacerle saber que tiene que esperar
    return new Promise((resolve, reject) => {
        //defino la consulta para buscar el id_categoria en la tabla categorias
        const query = `
            SELECT id_categoria
            FROM categorias
            WHERE id_categoria = ?
        `;
        //usamos el metodo .query() para enviar instruccion sql a la base y recibir el resultado
        connection.query(query, [id_categoria], (error, resultado) => {
            if(error){
                //manejamos error en caso de que algo falle rechazando la promesa
                reject(error);
                return;
            }
            //si todo sale bien , la consulta devuelve true si hay categoria o false si no hay en la tabla
            resolve(resultado.length > 0);
        });
    });
};

//creo funciones para hacer las inserciones en las tablas intermedias avisos_edificios y avisos_carreras
function insertarAvisosEdificios(id_aviso, idsEdificios) {
    return new Promise((resolve, reject) => {
        //primero verifico si hay elementos en el array, si no hay no hago nada
        if (idsEdificios.length === 0) {
            resolve(); // No hay edificios para insertar, por lo tanto resolvemos la promesa
            return;
        }

        //creo un array para almacenar los valores que tenemos que insertar en la tabla intermedia
        const valores = idsEdificios.map(id_edificio => [id_aviso, id_edificio]);

        //defino la query para insertar
        const query = `
            INSERT INTO avisos_edificios (id_aviso, id_edificio)
            VALUES ?
        `;

        //ejecutamos la query
        connection.query(query, [valores], (error, resultado) => {
            if (error) {
                reject(error);
                return;
            }
            resolve(resultado);
        });
    });
};

// avisos_carreras
function insertarAvisosCarreras(id_aviso, idsCarreras) {
    return new Promise((resolve, reject) => {
        //primero verifico si hay elementos en el array, si no hay no hago nada
        if(idsCarreras.length === 0) {
            resolve(); // No hay carreras para insertar, por lo tanto resolvemos la promesa
            return;
        }
        //creo array para almacenar los valores qye debems insertar 
        const valores = idsCarreras.map(id_carrera => [id_aviso, id_carrera]);
        //defino la query para insertar
        const query = `
        INSERT INTO avisos_carreras(id_aviso, id_carrera)
        VALUES ?
        `;
        //usamos la query
        connection.query(query, [valores], (error, resultado) => {
            if (error) {
                reject(error);
                return;
            }
            resolve(resultado);
        });
    });
};





module.exports = {
    existenEdificios,
    existenCarreras,
    existeCategoria,
    insertarAvisosEdificios,
    insertarAvisosCarreras,
    obtenerAvisoPorId,
    modificarAvisoModel
};