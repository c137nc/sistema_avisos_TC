const express = require ('express');
const router = express.Router();

// ------ llamamos a las funciones definidas en el controller ------
const controller = require('../controllers/materiasController.js');

//llamamos al middleware de autenticacion para proteger las rutas
const verificarToken = require('../middlewares/authMiddleware.js');
//get materias vigentes por dia
router.get('/materias', verificarToken, controller.mostrarMateriasPorDia);

//lo pngo en un modulo para poder exportarlo y usarlo en otros archivos
module.exports = router;