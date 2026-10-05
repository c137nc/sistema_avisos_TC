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

module.exports = {
    obtenerMateriasPorDia
}