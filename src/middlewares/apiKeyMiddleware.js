//importamos el módulo crypto para generar el hash de la API Key
const crypto = require('crypto');

// Importamos las funciones del modelo de API Keys
const {buscarApiKeyPorHash,registrarSolicitud} = require('../models/apiKeysModel.js');

// funcion Middleware para verificar la API Key
const verificarApiKey = async (req, res, next) => {
    try {
        // Obtenemos la clave que envia el dispositivo en el encabezado de la solicitud
        const apiKey = req.headers['x-api-key'];

        // Comprobamos que se haya enviado una clave
        if (!apiKey || typeof apiKey !== 'string' || apiKey.trim() === '') {
            return res.status(401).json({mensaje: 'La API Key es obligatoria en el encabezado de la solicitud'});
        }

        // Generamos el hash  de la clave recibida
        const claveHash = crypto.createHash('sha256').update(apiKey).digest('hex');

        // Buscamos la API Key en la base de datos
        const apiKeyEncontrada = await buscarApiKeyPorHash(claveHash);

        // Comprobamos que la clave exista y este habilitada
        if (!apiKeyEncontrada) {
            return res.status(401).json({mensaje: 'API Key inválida, inactiva o vencida'});
        }

        // Registramos la solicitud y comprobamos el limite de uso
        const solicitudRegistrada = await registrarSolicitud(apiKeyEncontrada.id_api_key);

        // Si no se pudo registrar, se alcanzo el limite o la clave dejo de ser valida
        if (!solicitudRegistrada) {
            return res.status(429).json({mensaje: 'Se alcanzó el límite de solicitudes permitido'});
        }

        // Guardamos info  del dispositivo en el objeto request
        req.apiKey = {id_api_key: apiKeyEncontrada.id_api_key,nombre_consumidor: apiKeyEncontrada.nombre_consumidor};

        // si todo es correcto, pasamos al siguiente middleware o ruta
        next();

    } catch (error) {
        console.error('Error al verificar API Key:', error);

        return res.status(500).json({
            mensaje: 'Error interno al verificar la API Key'
        });
    }
};

// Exportamos el middleware para utilizarlo en las rutas
module.exports = {
    verificarApiKey
};
