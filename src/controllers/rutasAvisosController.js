//importo conexion a la bbdd
const connection = require('../../database/sistema_avisos_db');

//-----CRUD DE AVISOS -----

//guardo en constante la funcion ue muestra todos los avisos
const mostrarAvisos = (req, res) =>{
    //defino mi query
    const query = `
        SELECT *
        FROM avisos
    `;
    connection.query(query, (error, resultado) => {
        if (error){
            console.error(error);
            return res.status(404).json({ mensaje: `Error al obtener los avisos`});
        }
        return res.status(200).json(resultado);
    })
};

const mostrarAvisoPorId = (req,res) => {
    const {id} = req.params;
    const query = `
        SELECT *
        FROM avisos
        WHERE id_aviso = ?
    `;
    connection.query(query, [id] , (error, resultado) => {
        if(error) {
            console.error(error);
            return res.status(500).json({ mensaje: `Error al obtener`});
        }
        if(resultado.length === 0){
            return res.status(404).json({ mensaje: `El aviso con id: ${id} no se encontro`});
        }
        return res.status(200).json(resultado[0]);
    })
};

//funcion para borraar aviso
const borrarAviso = (req, res) => {
    const {id} = req.params;
    //defino mi query
    const query = `
        DELETE FROM avisos
        WHERE id_aviso = ?
    `;
    connection.query(query,[id],(error, resultado) => {
        if(error){
            console.error(error);
            return res.status(500).json({ mensaje: `Error interno al eliminar`})
        }
        if(resultado.affectedRows===0){
            return res.status(404).json({mensaje: `No se encontro id: ${id}, no se pudo eliminar`})
        }
        return res.status(200).json({ mensaje: `El aviso con id: ${id}, fue eliminado correctamente`});
    })
}

//Defino POST para crear un nuevo aviso , usamos async xq categoria,edificiois y carreras hacen consulta a bbdd
const crearAviso = async (req,res ) => {
    try {
        //desestructuro lo que me envian en el body del req
        const {titulo, descripcion,fecha_publicacion , fecha_vencimiento, id_categoria, edificios, carreras } = req.body;
        const listaEdificios = edificios || [];
        const listaCarreras = carreras || [];
        const todosEdificios = listaEdificios.length === 0; //si no hay elementos, todos es true para respetar logica 
        const todasCarreras = listaCarreras.length === 0; //si no hay elementos, todos es true para respetar logica 


        //validaciones de los datos recibidos
        //TITULO
        //debe ser string xq en bbdd titulo VARCHAR(255)
        if (typeof titulo !== "string" || titulo.trim() === "") {
            return res.status(400).json({ mensaje: `El titulo es obligatorio`});
        }
        if (titulo.length > 255) {
            return res.status(400).json({ mensaje: `El titulo debe contener menos de 255 caracteres`});
        }
        // DESCRIPCION en bbdd not null
        if (typeof descripcion !== "string" || descripcion.trim() === "") {
            return res.status(400).json({ mensaje: `La descripcion es obligatoria`});
        }
        //fecha publicacion < vecha vencimiento
        const fechaPublicacion = new Date(fecha_publicacion);
        const fechaVencimiento = new Date(fecha_vencimiento);

        if(isNaN(fechaPublicacion.getTime()) || isNaN(fechaVencimiento.getTime())) {
            return res.status(400).json({ mensaje: `Formato de fecha no valido`});
        }
        if(fechaPublicacion >= fechaVencimiento) {
        return res.status(400).json({mensaje: `La fecha de publicacion debe ser anterior al vencimiento`});
        } 
        //validamos id_categoria, para esto requerimos utilizar la conexion a la bbdd por lo tanto usamos await para esperar 
        const categoriaExiste = await existeCategoria(id_categoria); //usamos await porque nuestra funcion devuelve un promise
        if(!categoriaExiste) {
                return res.status(400).json({ mensaje: `La categoria ingresada es inexistente`});
        }
        //aca iria validacion para ver si me enviaron array para edificios y carreras
        if(!Array.isArray(listaEdificios)){
                //si no es un arreglo devuelve true
                return res.status(400).json({ mensaje: `El campo para edificios debe ser un array`})
        }
        //valido que los elementos del array sean enteros
        if(!listaEdificios.every(id => Number.isInteger(id))) {
                return res.status(400).json({ mensaje: `Los id deben ser numeros enteros`});
        }
        //valido que haya elem. para hacer la consulta solo en ese caso y evitar error si lista es vacia
        if(listaEdificios.length > 0) {
                const edificiosExisten = await existenEdificios(listaEdificios); //devuelve true para todas las coincidencias v, y false si al menos uno no coincide
                if(!edificiosExisten) {
                    return res.status(400).json({mensaje: `No se encontró uno o mas edificios`});
                }
        }
        //idem pero para carreras
        if(!Array.isArray(listaCarreras)){
            //si no es un arreglo devuelve true
            return res.status(400).json({ mensaje: `El campo para carreras debe ser un array`})
         }
        //valido que los elemtnos del array sean enteros
        if(!listaCarreras.every(id => Number.isInteger(id))) {
                return res.status(400).json({ mensaje: `Los id deben ser numeros enteros`});
        }
        //valido que haya elem. para hacer la consulta solo en ese caso y evitar error si lista es vacia
        if(listaCarreras.length > 0) {
            const carrerasExisten = await existenCarreras(listaCarreras); //devuelve true para todas las coincidencias v, y false si al menos uno no coincide
            if(!carrerasExisten) {
                return res.status(400).json({mensaje: `No se encontró una o mas carreras`});
            }
        }
        //logica para obtener id de usuario
        const id_usuario = 1; //req.session.id_usuario;
        const estado = 'BORRADOR';
        //HAGO MI QUERY PARA HACER EL INSERT
        const query = `
            INSERT INTO avisos (
                titulo,
                descripcion,
                fecha_publicacion,
                fecha_vencimiento,
                estado,
                id_usuario,
                id_categoria,
                todos_edificios,
                todas_carreras    
            )
            VALUES (?,?,?,?,?,?,?,?,?)
        `
        connection.query(query, [titulo, descripcion,fecha_publicacion , fecha_vencimiento, estado,id_usuario, id_categoria, todosEdificios, todasCarreras] , (error,resultado) => {
            if(error) {
                console.error(error);
                return res.status(500).json({ mensaje: `Error al crear l aviso`});
            }
            //si todo sale bien guardo el id_aviso generaado
            const id_aviso = resultado.insertId;
            return res.status(200).json({ 
                mensaje: `El aviso se creo correctamente`,
                id_aviso: id_aviso
            });

        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ mensaje: `Erros de Servidor`});
    }
    
};

//funcion para VERIFICAR SI EXISTE CATEGORIA en bbdd
function existeCategoria(id_categoria) {
    //usamos promise porque sql va a responder mas adelante y debemos hacerle saber que tiene que esperar
    return new Promise((resolve, reject) => {
        //defino la consulta para buscar el id_categoria en ka tabla categorias
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

//funcion para verificar si existen todos los ids del array de edificios y que sea un array lo que envian
function existenEdificios(idsEdificios) {
    //usamos promise porque sql va a responder mas adelante y debemos hacerle saber que tiene que esperar
    return new Promise((resolve, reject) => {
        //logica para buscar coincidencias en la bbdd
        //priero necesito saber cuantos elementos habra en el array
        const cantElementos = idsEdificios.map(() => '?').join(',');
        //query
        const query = `
            SELECT id_edificio
            FROM edificios
            WHERE id_edificio IN (${cantElementos})
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

}


module.exports = {
    mostrarAvisos,
    mostrarAvisoPorId, 
    borrarAviso,
    existeCategoria, 
    existenEdificios,
    existenCarreras,
    crearAviso
};
