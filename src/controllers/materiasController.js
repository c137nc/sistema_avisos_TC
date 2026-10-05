//importo funcion para obtener materias vigentes por dia
const { obtenerMateriasPorDia } = require('../models/materiasModel.js');

//funcion para obtener materias vigentes por dia
const mostrarMateriasPorDia = async (req, res) => {
    try {
        //capturo el dia del request
        const {dia} = req.body;
        //llamo a la funcion del modelo para obtener materias vigentes por dia
        const resultadoMaterias = await obtenerMateriasPorDia(dia);
        //controlar si hay materias vigentes
        if (resultadoMaterias.length === 0) {
            return res.status(404).json({ mensaje: 'No hay materias vigentes para el día especificado' });
        }
        //si todo ok devuelvo resultado
        res.status(200).json(resultadoMaterias);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
};

module.exports = {
    mostrarMateriasPorDia
};