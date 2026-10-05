const express = require ('express');
const router = express.Router();

// ------ llamamos a las funciones definidas en el controller ------
const controller = require('../controllers/rutasAvisosController.js');
//llamamos al middleware de autenticacion para proteger las rutas
const verificarToken = require('../middlewares/authMiddleware.js');
//CRUD AVISOS
//crear aviso
router.post('/', verificarToken, controller.crearAviso);
//listar avisos vigentes en horario especifico
router.get('/vigentes', verificarToken, controller.mostrarAvisosVigentes);
//listar avisos vigentes segun filtros de fecha, carreras y edificios
router.get('/filtros', verificarToken, controller.mostrarAvisosVigentesFiltros);
//listar todos los avisos - admin
router.get('/', verificarToken, controller.mostrarTodosAvisos);
//listar un aviso por id - admin
router.get('/:id', verificarToken, controller.mostrarAvisoPorId);
//borar aviso por id
router.delete('/:id', verificarToken, controller.borrarAviso);
//modificar aviso por id
router.put('/:id', verificarToken, controller.modificarAviso);


//lo pngo en un modulo para poder exportarlo y usarlo en otros archivos
module.exports = router;