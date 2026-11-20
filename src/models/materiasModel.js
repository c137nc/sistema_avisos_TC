//importo conexion a la bbdd
const connection = require('../../database/sistema_avisos_db');

//funcion para obtener materias vigenetes teniendo en cuenta un dias especifico
const obtenerMateriasPorDia = (dia) => {
    return new Promise ((resolve, reject) => {
        // defino query que contemple dia
        const queryObtenerMateriasDia = `
            SELECT *
            FROM materias
            WHERE dia = ?
        `;
        //ejecutamos la query
        connection.query(queryObtenerMateriasDia,[dia], (error, resultado) => {
            if(error) {
                //rechazo
                reject(error);
                return;
            }
            //si todo ok devuelvo aviso
            resolve(resultado); // devuelvo array 
        })
    })
};

//funcion para obtener materias vigentes por filtros
const obtenerMateriasPorFiltros = (filtros) => {
    return new Promise((resolve, reject) => {
        //defino query base
        let queryObtenerMateriasFiltros = `
            SELECT m.id_materia, m.nombre as Materia, m.dia as Dia, m.hora_inicio , m.hora_fin, m.modalidad, m.modalidad_combo, m.periodicidad, 
            c.nombre as Carrera, a.numero_aula as Aula, a.piso, e.nombre as Edificio, CONCAT(d.nombre, ' ', d.apellido) as Docente
            FROM materias AS m
            INNER JOIN carreras_materias as cm ON m.id_materia = cm.id_materia
            INNER JOIN carreras as c ON cm.id_carrera = c.id_carrera
            INNER JOIN aulas as a ON m.id_aula = a.id_aula
            INNER JOIN edificios as e ON a.id_edificio = e.id_edificio
            LEFT JOIN docentes_materias as dm ON m.id_materia = dm.id_materia
            LEFT JOIN docentes as d ON dm.id_docente = d.id_docente
            WHERE 1=1 `;

        const queryParametros = [];
        //filtro por carrera
        if(filtros.idCarrera) {
            queryObtenerMateriasFiltros += ` AND cm.id_carrera = ?`;
            queryParametros.push(filtros.idCarrera);
        }
        //filtro por edificio
        if(filtros.idEdificio) {
            queryObtenerMateriasFiltros += ` AND a.id_edificio = ?`;
            queryParametros.push(filtros.idEdificio);
        }
        // filtro por piso
        if(filtros.piso !== undefined && filtros.piso !== null && filtros.piso !== '') {
            queryObtenerMateriasFiltros += ` AND a.piso = ?`;
            queryParametros.push(filtros.piso);
        }
        // filtro por numero de aula
        if(filtros.numeroAula !== undefined && filtros.numeroAula !== null && filtros.numeroAula !== '') {
            queryObtenerMateriasFiltros += ` AND a.numero_aula = ?`;
            queryParametros.push(filtros.numeroAula);
        }
        //filtro por dia
        if(filtros.dia) {
            queryObtenerMateriasFiltros += ` AND m.dia = ?`;
            queryParametros.push(filtros.dia);
        }
        //filtro por hora desde
        if(filtros.horaInicio) {
            queryObtenerMateriasFiltros += ` AND m.hora_inicio = ?`;
            queryParametros.push(filtros.horaInicio);
        }
        //filtro por hora hasta
        if(filtros.horaFin) {
            queryObtenerMateriasFiltros += ` AND m.hora_fin = ?`;
            queryParametros.push(filtros.horaFin);
        }
        // filtro por nombre de materia
        if(filtros.nombre) {
            queryObtenerMateriasFiltros += ` AND m.nombre LIKE ?`;
            queryParametros.push(`%${filtros.nombre}%`);
        }
        // filtro por comision
        if(filtros.comision) {
            queryObtenerMateriasFiltros += ` AND m.comision = ?`;
            queryParametros.push(filtros.comision);
        }
        //filtro por modalidad
        if(filtros.modalidad) {
            queryObtenerMateriasFiltros += ` AND m.modalidad = ?`;
            queryParametros.push(filtros.modalidad);
        }
        //filtro por modalidad combo
        if(filtros.modalidadCombo) {
            queryObtenerMateriasFiltros += ` AND m.modalidad_combo = ?`;
            queryParametros.push(filtros.modalidadCombo);
        }
        //filtro por periodicidad
        if(filtros.periodicidad) {
            queryObtenerMateriasFiltros += ` AND m.periodicidad = ?`;
            queryParametros.push(filtros.periodicidad);
        }
        //ordenar por dia y hora de inicio
        queryObtenerMateriasFiltros += ` ORDER BY m.dia, m.hora_inicio`;

        //ejecutamos laa consulta
        connection.query(queryObtenerMateriasFiltros, queryParametros, (error, resultado) => {
            if(error) {
                reject(error);
                return;
            }
            resolve(resultado);
        });
    });
};
module.exports = {
    obtenerMateriasPorDia,
    obtenerMateriasPorFiltros
}