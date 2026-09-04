const express = require ('express');
const router = express.Router();

//tienen que ser try catch?
// ------ llamamos a las funciones definidas en el controller ------
const controller = require('../controllers/rutasAvisosController.js');
//listar todos los avisos
router.get('/', controller.mostrarAvisos);
//listar un aviso por id
router.get('/:id', controller.mostrarAvisoPorId);
//crear aviso
router.post('/', controller.crearAviso)
//borar aviso por id
router.delete('/:id', controller.borrarAviso);



//lo pngo en un modulo para poder exportarlo y usarlo en otros archivos
module.exports = router;