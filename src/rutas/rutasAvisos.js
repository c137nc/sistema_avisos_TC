const express = require ('express');
const router = express.Router();

// ------ llamamos a las funciones definidas en el controller ------
const controller = require('../controllers/rutasAvisosController.js');
//llamamos al middleware de autenticacion para proteger las rutas
const verificarToken = require('../middlewares/authMiddleware.js');
//listar todos los avisos
router.get('/', verificarToken, controller.mostrarAvisos);
//listar un aviso por id
router.get('/:id', verificarToken, controller.mostrarAvisoPorId);
//crear aviso
router.post('/', verificarToken, controller.crearAviso);
//borar aviso por id
router.delete('/:id', verificarToken, controller.borrarAviso);



//lo pngo en un modulo para poder exportarlo y usarlo en otros archivos
module.exports = router;