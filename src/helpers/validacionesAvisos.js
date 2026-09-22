//importo funciones de validacion de la bbdd
const { existenEdificios, existenCarreras, existeCategoria } = require('../models/avisosModel.js');

//funcion para validar datos del aviso
const validarDatosAviso = async (datos) => {
    const { titulo, descripcion, fecha_publicacion, fecha_vencimiento, id_categoria} = datos;
    //validaciones de los datos recibidos
    //TITULO
    //debe ser string xq en bbdd tengo titulo VARCHAR(255)
    if (typeof titulo !== "string" || titulo.trim() === "") {
        return `El titulo es obligatorio`;
    }
    if (titulo.length > 255) {
        return `El titulo debe contener menos de 255 caracteres`;
    }
    // DESCRIPCION en bbdd not null
    if (typeof descripcion !== "string" || descripcion.trim() === "") {
        return `La descripcion es obligatoria`;
    }
    //fecha publicacion < vecha vencimiento
    const fechaPublicacion = new Date(fecha_publicacion);
    const fechaVencimiento = new Date(fecha_vencimiento);

    if (isNaN(fechaPublicacion.getTime()) || isNaN(fechaVencimiento.getTime())) {
        return `Formato de fecha no valido`;
    }
    if (fechaPublicacion >= fechaVencimiento) {
        return `La fecha de publicacion debe ser anterior al vencimiento`;
    }
    //validamos id_categoria, para esto requerimos utilizar la conexion a la bbdd por lo tanto usamos await para esperar 
    const categoriaExiste = await existeCategoria(id_categoria); //usamos await porque nuestra funcion devuelve un promise
    if (!categoriaExiste) {
        return  `La categoria ingresada es inexistente` ;
    }
    return null; //si todo esta ok 

}

const validarEdificios = async (listaEdificios) => {
    //aca iria validacion para ver si me enviaron array para edificios y carreras
    if (!Array.isArray(listaEdificios)) {
        //si no es un arreglo devuelve true
        return `El campo para edificios debe ser un array`;
    }
    //valido que los elementos del array sean enteros
    if (!listaEdificios.every(id => Number.isInteger(id))) {
        return `Los id deben ser numeros enteros`;
    }
    //valido que haya elem. para hacer la consulta solo en ese caso y evitar error si lista es vacia
    if (listaEdificios.length > 0) {
        const edificiosExisten = await existenEdificios(listaEdificios); //devuelve true para todas las coincidencias v, y false si al menos uno no coincide
        if (!edificiosExisten) {
            return `No se encontró uno o mas edificios`;
        }
    }
    return null; //si todo esta ok, devuelvo null para indicar que no hay error
}
//idem pero para carreras
//funcion para validar carreras
const validarCarreras = async (listaCarreras) => {
    //aca iria validacion para ver si me enviaron array para edificios y carreras
    if (!Array.isArray(listaCarreras)) {
        //si no es un arreglo devuelve true
        return `El campo para carreras debe ser un array`;
    }
    //valido que los elemtnos del array sean enteros
    if (!listaCarreras.every(id => Number.isInteger(id))) {
        return `Los id deben ser numeros enteros`;
    }
    //valido que haya elem. para hacer la consulta solo en ese caso y evitar error si lista es vacia
    if (listaCarreras.length > 0) {
        const carrerasExisten = await existenCarreras(listaCarreras); //devuelve true para todas las coincidencias v, y false si al menos uno no coincide
        if (!carrerasExisten) {
            return `No se encontró una o mas carreras`;
        }
    }
    return null; //si todo esta ok, devuelvo null para indicar que no hay error
}



module.exports = {
    validarDatosAviso,
    validarEdificios,
    validarCarreras
}