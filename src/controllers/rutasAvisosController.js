//importo conexion a la bbdd
const connection = require('../../database/sistema_avisos_db');
//importo funciones para insertar en las tablas intermedias
const { insertarAvisosEdificios, insertarAvisosCarreras } = require('../models/avisosModel.js');
//importo funciones del model necesarias
const {obtenerTodosAvisos ,obtenerAvisoPorId, eliminarAvisoPorId, modificarAvisoModel } = require ('../models/avisosModel.js');
//importo funciones de validacion de los avisos
const { validarDatosAviso, validarEdificios, validarCarreras } = require('../helpers/validacionesAvisos.js');


//-----CRUD DE AVISOS -----

//guardo en constante la funcion ue muestra todos los avisos
const mostrarAvisos = async (req, res) =>{
    try {
        //llamamos a l afuncion del modelo
        const todosAvisosResultado = await obtenerTodosAvisos();
        //controlamos si hay avisos o no
        if (!todosAvisosResultado || todosAvisosResultado.length === 0) {
            return res.status(404).json({ mensaje: `No hay avisos disponibles`});
        }
        return res.status(200).json(todosAvisosResultado);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ mensaje: `Error de Servidor`});
    }
};

const mostrarAvisoPorId = async (req,res) => {
    try {
        //capturo el id desde los parametros de la ruta
        const { id } = req.params;
        //llamamos a la funcion del modelo
        const avisoResultado = await obtenerAvisoPorId(id);
        //controlamos si  el aviso existe o no
        if (!avisoResultado) {
            return res.status(404).json({ mensaje: `El aviso con id: ${id} no existe`});
        }
        return res.status(200).json(avisoResultado);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ mensaje: `Error de Servidor`});
    }
    
};

//funcion para borraar aviso
const borrarAviso = async(req, res) => {
    try {
        const {id} = req.params;
        //llamamos a la funcion del modelo
        const avisoEliminado = await eliminarAvisoPorId(id);
        //controlamos 
        if (avisoEliminado === 0) {
            return res.status(404).json({ mensaje : `No se encontro aviso con id: ${id}, no se completo la operacion para eliminar`})
        }
        return res.status(200).json({mensaje: `El aviso con id: ${id} se ha eliminado correctamente`});
    }
    catch (error) {
        console.error(error)
        return res.status(500).json({ mensaje: `Error de servidor`})
    }
    
};

// Defino POST para crear un nuevo aviso.
// Usamos async porque las validaciones de categoría,
// edificios y carreras realizan consultas a la base de datos.
const crearAviso = async (req,res ) => {
    try {
        //desestructuro lo que me envian en el body del req
        const {titulo, descripcion,fecha_publicacion , fecha_vencimiento, id_categoria, edificios, carreras } = req.body;
        const listaEdificios = edificios || [];
        const listaCarreras = carreras || [];
        const todosEdificios = listaEdificios.length === 0; //si no hay elementos, todos es true para respetar logica 
        const todasCarreras = listaCarreras.length === 0; //si no hay elementos, todos es true para respetar logica 

        
        // usamos las validaciones
        const errorDatosAviso = await validarDatosAviso(req.body); //usamos await porque nuestra funcion devuelve un promise
        if(errorDatosAviso){
            return res.status(400).json({ mensaje: errorDatosAviso });
        }
        const errorEdificios = await validarEdificios(listaEdificios);
        if(errorEdificios){
            return res.status(400).json({ mensaje: errorEdificios });
        }
        const errorCarreras = await validarCarreras(listaCarreras);
        if(errorCarreras){
            return res.status(400).json({ mensaje: errorCarreras });
        }


        //cambiamos la forma de capturar el id_usuario
        const id_usuario = req.usuario.id; //obtenemos el id del usuario del token decodificado en el middleware de autenticacion
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
        connection.query(query, [titulo, descripcion,fecha_publicacion , fecha_vencimiento, estado,id_usuario, id_categoria, todosEdificios, todasCarreras] , async (error,resultado) => {
            if(error) {
                console.error(error);
                return res.status(500).json({ mensaje: `Error al crear el aviso`});
            }
            //si todo sale bien guardo el id_aviso generaado para usarlo en la respuesta y en las tablas intermedias
            const id_aviso = resultado.insertId;

            //una vez insertado el aviso, insertamos los registros en las tablas intermedias
            await insertarAvisosEdificios(id_aviso, listaEdificios);
            await insertarAvisosCarreras(id_aviso, listaCarreras);

            return res.status(200).json({ 
                mensaje: `El aviso se creo correctamente`,
                id_aviso: id_aviso
            });

        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ mensaje: `Error de Servidor`});
    }
    
};

//definimos Put para completar el crud 
const modificarAviso = async (req, res) => {
    try {
        //capturamos el id del aviso a modificar desde los parametros de la ruta
        const { id } = req.params;
        //desestructuramos los datos que nos envian en el body del request
        const { titulo, descripcion, fecha_publicacion, fecha_vencimiento, id_categoria, edificios, carreras} = req.body;
        const listaEdificios = edificios || [];
        const listaCarreras = carreras || [];
        const todosEdificios = listaEdificios.length === 0 ? 1 : 0; //si no hay elementos, todos es true para respetar logica 
        const todasCarreras = listaCarreras.length === 0 ? 1 : 0; //si no hay elementos, todos es true para respetar logica 
        
        //llamamos a la funcion para buscar el id en la base verificando si existe el aviso
        const avisoResultado = await obtenerAvisoPorId(id);
        if (!avisoResultado) {
            return res.status(404).json({ mensaje: `El aviso con id: ${id} no existe` });
        }
        //hacemos las validaciones de los datos del aviso, edificios y carreras
        //reutilizando la logica del post de crear aviso
        const errorDatosAviso = await validarDatosAviso(req.body); //usamos await porque el validador devuelve una promesa
        if (errorDatosAviso) {
            return res.status(400).json({ mensaje: errorDatosAviso });
        }
        const errorEdificios = await validarEdificios(listaEdificios);
        if (errorEdificios) {
            return res.status(400).json({ mensaje: errorEdificios });
        }
        const errorCarreras = await validarCarreras(listaCarreras);
        if (errorCarreras) {
            return res.status(400).json({ mensaje: errorCarreras });
        }
        //llamamos a la funcion del modelo para modificar el aviso, pasando todos los datos necesarios
        //usamos await para esperar a que la promesa se resuelva antes de continuar
        await modificarAvisoModel(id, titulo, descripcion, fecha_publicacion, fecha_vencimiento, id_categoria, todosEdificios, todasCarreras);
        //una vez modificado el aviso, insertamos los registros en las tablas intermedias
        await insertarAvisosEdificios(id, listaEdificios);
        await insertarAvisosCarreras(id, listaCarreras);
        //salida para prueba
        return res.status(200).json({ mensaje: `El aviso con id: ${id} se ha modificado correctamente` });

    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ mensaje: `Error de Servidor` });
    }
};
  
module.exports = {
    mostrarAvisos,
    mostrarAvisoPorId, 
    borrarAviso,
    crearAviso,
    modificarAviso
};
