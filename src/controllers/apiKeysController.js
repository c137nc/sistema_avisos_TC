//importamos el modelo de ApiKey
const apiKeysModel = require('../models/apiKeysModel');

// funcion para crear una nueva api key
const crearApiKey = async (req, res) => {
    try {
        const { nombreConsumidor } = req.body;
        //validamos que el nombre del consumidor no este vacio
        if (!nombreConsumidor || typeof nombreConsumidor !== 'string' || nombreConsumidor.trim() === '') {
            return res.status(400).json({ mensaje: 'El nombre del consumidor es obligatorio'});
        }
    //llamamos al modelo para generar y guardar la clave
    const nuevaApiKey = await apiKeysModel.crearApiKey(nombreConsumidor.trim());
    return res.status(201).json({ mensaje: 'API key generada correctamente', datos: nuevaApiKey });
    } catch (error) {
        console.error('Error al generar la API key:', error);
        return res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
};

module.exports = {
    crearApiKey
};