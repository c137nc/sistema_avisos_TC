
const express = require('express');
const router = express.Router();

// Importamos el controlador 
const controller = require('../controllers/apiKeysController.js');

// Importamos los middlewares para autenticar y autorizar
const { verificarToken, verificarRol } = require('../middlewares/authMiddleware.js');

// Ruta para generar una nueva API Key
// Solamente el Administrador puede realizar esta operación
router.post('/',verificarToken,verificarRol('Administrador'),controller.crearApiKey);

// Exportamos el router
module.exports = router;
